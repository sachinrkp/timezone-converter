import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { z } from 'zod';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface TimezoneData {
  zoneName: string;
  gmtOffset: number;
  timestamp: number;
  dst: string;
}

interface TimezoneResponse {
  zones: TimezoneData[];
}

interface ConvertTimeRequest {
  fromZone: string;
  toZone: string;
  date: string;
  time: string;
}

interface ConvertTimeResponse {
  convertedTime: string;
  fromCurrent: string;
  toCurrent: string;
  dst: boolean;
}

// Validation schemas
const ConvertTimeSchema = z.object({
  fromZone: z.string().min(1, 'From timezone is required'),
  toZone: z.string().min(1, 'To timezone is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
});

// Cache for timezone data
const timezoneCache = new Map<string, any>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const app = express();
const API_KEY = process.env.TIMEZONEDB_API_KEY;

if (!API_KEY) {
  console.error('❌ TIMEZONEDB_API_KEY is required');
  process.exit(1);
}

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Rate limiting middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  const clientData = requestCounts.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }

  if (clientData.count >= RATE_LIMIT) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }

  clientData.count++;
  next();
};

app.use(rateLimit);

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Utility functions
const fetchWithCache = async (url: string, cacheKey: string): Promise<any> => {
  const cached = timezoneCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    timezoneCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

// Routes
app.get('/api/resolve-city', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { city } = req.query;
    
    if (!city || typeof city !== 'string') {
      res.status(400).json({ error: 'City parameter is required' });
      return;
    }

    const url = `https://api.timezonedb.com/v2.1/list-time-zone?key=${API_KEY}&format=json`;
    const data = await fetchWithCache(url, 'timezones') as TimezoneResponse;
    
    const match = data.zones.find(z => 
      z.zoneName.toLowerCase().includes(city.toLowerCase())
    );
    
    if (match) {
      res.json({ zone: match.zoneName });
    } else {
      res.status(404).json({ error: 'City not found in timezone list' });
    }
  } catch (err) {
    next(err);
  }
});

app.post('/api/convert-time', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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

    const [fromRes, toRes] = await Promise.all([
      fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=${fromZone}`),
      fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=${toZone}`)
    ]);

    if (!fromRes.ok || !toRes.ok) {
      res.status(502).json({ error: 'Timezone API unavailable' });
      return;
    }

    const fromData = await fromRes.json() as TimezoneData;
    const toData = await toRes.json() as TimezoneData;

    const offsetDiff = (toData.gmtOffset - fromData.gmtOffset) * 1000;
    const converted = new Date(inputDate.getTime() + offsetDiff);

    const response: ConvertTimeResponse = {
      convertedTime: converted.toLocaleString(),
      fromCurrent: new Date(fromData.timestamp * 1000).toLocaleString(),
      toCurrent: new Date(toData.timestamp * 1000).toLocaleString(),
      dst: toData.dst === '1'
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

app.get('/api/timezones', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const url = `https://api.timezonedb.com/v2.1/list-time-zone?key=${API_KEY}&format=json`;
    const data = await fetchWithCache(url, 'timezones') as TimezoneResponse;

    if (!data.zones || !Array.isArray(data.zones)) {
      res.status(502).json({ error: 'Invalid response from TimeZoneDB' });
      return;
    }

    const zones = data.zones.map(z => z.zoneName);
    res.json({ zones });
  } catch (err) {
    next(err);
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
});

export default app;
