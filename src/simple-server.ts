import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve .env relative to this file (not process.cwd()), so the server
// finds its config regardless of which directory it's launched from.
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const TIMEZONEDB_API_KEY = process.env.TIMEZONEDB_API_KEY;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://timezone-converter-pi.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Security headers. The CSP allows 'unsafe-inline' for script/style because every
// page's UI logic lives in inline <script>/<style> blocks (no nonce/hash infra
// exists) - real value here is still restricting which *origins* can be reached
// at all, which blocks an injected <script src="https://evil.example"> or a
// fetch() exfiltrating data to an arbitrary domain even if a future XSS bug slips
// past escaping.
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "img-src 'self' data: https://api.iconify.design",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://data.fixer.io https://api.exchangerate-api.com",
      "frame-src https://*.firebaseapp.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'"
    ].join('; ')
  );
  next();
});

app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // HTML shells should always be revalidated so deploys show up immediately
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      // 'no-cache' still lets the browser cache the file, but forces a
      // revalidation (cheap 304 if unchanged) on every load instead of trusting
      // a max-age window - so a fresh deploy is never masked by a stale cache.
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Basic per-IP rate limiting on the API - without this, a single client could
// flood /api/convert-time and exhaust the TimezoneDB free-tier quota for everyone.
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per window, per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  const clientData = requestCounts.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    next();
    return;
  }

  if (clientData.count >= RATE_LIMIT) {
    res.status(429).json({
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
    return;
  }

  clientData.count++;
  next();
});

// --- TimezoneDB-backed conversion (real logic, cached to stay under API limits) ---

interface TimezoneApiEntry {
  zoneName: string;
  gmtOffset: number;
  timestamp: number;
  dst: string;
}

const ConvertTimeSchema = z.object({
  fromZone: z.string().min(1, 'From timezone is required'),
  toZone: z.string().min(1, 'To timezone is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
});

const timezoneCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const fetchWithCache = async (url: string, cacheKey: string): Promise<any> => {
  const cached = timezoneCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  timezoneCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Current server time (client falls back to local time if this is unreachable)
app.get('/api/current-time', (req: Request, res: Response) => {
  const now = new Date();
  res.json({
    utc: now.toISOString(),
    local: now.toLocaleString(),
    timestamp: now.getTime()
  });
});

// Read timezones from the bundled file (used to populate the picker UI)
app.get('/api/timezones', (req: Request, res: Response) => {
  try {
    const timezoneFile = path.join(__dirname, '../public/timezones.txt');
    const timezoneData = fs.readFileSync(timezoneFile, 'utf8');
    const zones = timezoneData.split('\n').map(z => z.trim()).filter(Boolean);
    res.json({ zones });
  } catch (error) {
    console.error('Error reading timezones file:', error);
    res.status(500).json({ error: 'Failed to load timezones' });
  }
});

// Real time conversion, backed by TimeZoneDB (handles DST correctly)
app.post('/api/convert-time', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!TIMEZONEDB_API_KEY) {
      res.status(503).json({ error: 'Timezone conversion is not configured on the server' });
      return;
    }

    const validation = ConvertTimeSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid input data',
        details: validation.error.issues
      });
      return;
    }

    const { fromZone, toZone, date, time } = validation.data;
    const inputDate = new Date(`${date}T${time}:00`);

    if (isNaN(inputDate.getTime())) {
      res.status(400).json({ error: 'Invalid date or time provided' });
      return;
    }

    const [fromData, toData] = await Promise.all([
      fetchWithCache(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_API_KEY}&format=json&by=zone&zone=${encodeURIComponent(fromZone)}`,
        `zone:${fromZone}`
      ) as Promise<TimezoneApiEntry>,
      fetchWithCache(
        `https://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_API_KEY}&format=json&by=zone&zone=${encodeURIComponent(toZone)}`,
        `zone:${toZone}`
      ) as Promise<TimezoneApiEntry>
    ]);

    const offsetDiff = (toData.gmtOffset - fromData.gmtOffset) * 1000;
    const converted = new Date(inputDate.getTime() + offsetDiff);

    res.json({
      convertedTime: converted.toLocaleString(),
      fromCurrent: new Date(fromData.timestamp * 1000).toLocaleString(),
      toCurrent: new Date(toData.timestamp * 1000).toLocaleString(),
      dst: toData.dst === '1'
    });
  } catch (err) {
    next(err);
  }
});

// Public client config (Firebase web config values are not secret - they're
// protected by Firestore/Auth security rules and authorized-domain checks,
// not by hiding them - but we still serve them from env vars so they're not
// hardcoded across every HTML file).
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    fixerApiKey: process.env.FIXER_API_KEY || null,
    hasFixerApiKey: !!process.env.FIXER_API_KEY,
    firebaseApiKey: process.env.FIREBASE_API_KEY || null,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || null,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || null,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || null,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || null,
    firebaseAppId: process.env.FIREBASE_APP_ID || null,
    hasFirebaseAuth: !!(process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID)
  });
});

// Serve the main page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
