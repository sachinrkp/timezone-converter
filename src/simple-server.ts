import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';
import session from 'express-session';
import { EncryptionService } from './services/encryptionService.js';

// Import routes
// Temporarily disabled for testing
// import authRoutes from './routes/auth.js';
// import calendarRoutes from './routes/calendar.js';
// import notesRoutes from './routes/notes.js';

// Import services - Temporarily disabled for testing
// import { database } from './database/database.js';
// import { holidayService } from './services/holidayService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://timezone-converter-pi.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Current time endpoint
app.get('/api/current-time', (req, res) => {
  const now = new Date();
  const utcTime = now.toISOString();
  const localTime = now.toLocaleString();
  
  res.json({
    utc: utcTime,
    local: localTime,
    timestamp: now.getTime()
  });
});

// Read timezones from file
app.get('/api/timezones', (req, res) => {
  try {
    const timezoneFile = path.join(__dirname, '../public/timezones.txt');
    const timezoneData = fs.readFileSync(timezoneFile, 'utf8');
    const zones = timezoneData.split('\n').filter(zone => zone.trim() !== '');
    
    console.log(`📋 Loaded ${zones.length} timezones from file`);
    res.json({ zones });
  } catch (error) {
    console.error('❌ Error reading timezones file:', error);
    // Fallback to basic timezones
    const fallbackZones = [
      'America/New_York', 'America/Los_Angeles', 'Europe/London', 
      'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney', 'UTC'
    ];
    res.json({ zones: fallbackZones });
  }
});

// API Routes - Temporarily disabled for testing
// app.use('/api/auth', authRoutes);
// app.use('/api/calendar', calendarRoutes);
// app.use('/api/notes', notesRoutes);

// Simple authentication endpoints for testing
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, country, timezone } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, password, and name are required' 
      });
    }
    
    // Mock successful registration
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: Math.floor(Math.random() * 10000),
        email,
        name,
        country: country || 'US',
        timezone: timezone || 'UTC'
      },
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Mock successful login
    return res.json({
      message: 'Login successful',
      user: {
        id: Math.floor(Math.random() * 10000),
        email,
        name: 'Test User',
        country: 'US',
        timezone: 'UTC'
      },
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/firebase-sync', (req, res) => {
  try {
    const { uid, email, displayName, photoURL, country, timezone, providerId, idToken } = req.body;
    
    console.log('Firebase sync request:', { uid, email, displayName, country, timezone });
    
    // Mock Firebase sync - create or update user
    const user = {
      id: uid || Math.floor(Math.random() * 10000),
      email: email || 'firebase@example.com',
      name: displayName || 'Firebase User',
      country: country || 'IN',
      timezone: timezone || 'Asia/Kolkata',
      photoURL: photoURL || null,
      providerId: providerId || 'firebase',
      createdAt: new Date().toISOString()
    };
    
    return res.json({
      message: 'Firebase sync successful',
      user: user,
      token: 'mock-jwt-token-' + Date.now()
    });
  } catch (error) {
    console.error('Firebase sync error:', error);
    return res.status(500).json({ error: 'Firebase sync failed' });
  }
});

// File-based storage for notes data (in production, use a real database)

const NOTES_DATA_FILE = path.join(__dirname, 'notes-data.json');
const ENCRYPTED_NOTES_FILE = path.join(__dirname, 'encrypted-notes.dat');

// Encryption configuration
const MASTER_ENCRYPTION_KEY = process.env.MASTER_ENCRYPTION_KEY || EncryptionService.generateKey();
console.log('📁 Notes data file path:', NOTES_DATA_FILE);
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Load existing data from file (try encrypted first, fallback to plain text)
let notesStorage = new Map();
loadEncryptedNotesData();

// ⚠️  SECURITY WARNING: Current implementation stores user data in plain text
// This is NOT secure for production use. User notes are visible in:
// 1. File system (dist/notes-data.json)
// 2. Developer tools (network requests)
// 3. Server logs
// 
// RECOMMENDED SECURITY IMPROVEMENTS:
// 1. Encrypt all user data with AES-256 before storage
// 2. Use proper database (PostgreSQL/MongoDB) instead of JSON files
// 3. Implement proper access controls and authentication
// 4. Add data validation and sanitization
// 5. Use HTTPS in production
// 6. Implement proper session management

// Save data to file (encrypted)
function saveNotesToFile() {
  try {
    // Ensure directory exists
    const dir = path.dirname(ENCRYPTED_NOTES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('📁 Created directory:', dir);
    }
    
    // Encrypt the data before saving
    const data = Object.fromEntries(notesStorage);
    const encryptedData = EncryptionService.encryptObject(data, MASTER_ENCRYPTION_KEY);
    
    fs.writeFileSync(ENCRYPTED_NOTES_FILE, encryptedData);
    console.log('💾 Encrypted notes data saved to file:', ENCRYPTED_NOTES_FILE);
    console.log('💾 File size:', fs.statSync(ENCRYPTED_NOTES_FILE).size, 'bytes');
    
    // Also save a backup in plain text for development (remove in production)
    if (process.env.NODE_ENV === 'development') {
      fs.writeFileSync(NOTES_DATA_FILE, JSON.stringify(data, null, 2));
      console.log('💾 Development backup saved to:', NOTES_DATA_FILE);
    }
  } catch (error) {
    console.error('❌ Error saving notes data:', error);
  }
}

// Load encrypted data from file
function loadEncryptedNotesData() {
  try {
    if (fs.existsSync(ENCRYPTED_NOTES_FILE)) {
      const encryptedData = fs.readFileSync(ENCRYPTED_NOTES_FILE, 'utf8');
      const data = EncryptionService.decryptObject(encryptedData, MASTER_ENCRYPTION_KEY);
      notesStorage = new Map(Object.entries(data as Record<string, any>));
      console.log('📁 Loaded encrypted notes data from file:', ENCRYPTED_NOTES_FILE);
      console.log('📁 Loaded', notesStorage.size, 'entries');
    } else {
      console.log('📁 No encrypted notes data file found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading encrypted notes data:', error);
    // Fallback to plain text file if encryption fails
    loadPlainTextNotesData();
  }
}

// Fallback function to load plain text data
function loadPlainTextNotesData() {
  try {
    if (fs.existsSync(NOTES_DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(NOTES_DATA_FILE, 'utf8'));
      notesStorage = new Map(Object.entries(data));
      console.log('📁 Loaded plain text notes data from file:', NOTES_DATA_FILE);
      console.log('📁 Loaded', notesStorage.size, 'entries');
    } else {
      console.log('📁 No existing notes data file found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading notes data:', error);
    notesStorage = new Map();
  }
}

// Simple notes storage endpoint for testing
app.get('/api/notes', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No auth token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid auth token' });
    }
    
    // Extract UID from query parameter or use token as fallback
    const uid = req.query?.uid || token;
    
    const userData = notesStorage.get(uid) || {
      notebooks: [],
      sections: [],
      pages: []
    };
    
    console.log('📝 Notes data requested for UID:', uid);
    console.log('📊 Returning data:', {
      notebooks: userData.notebooks?.length || 0,
      sections: userData.sections?.length || 0,
      pages: userData.pages?.length || 0
    });
    
    return res.json(userData);
  } catch (error) {
    console.error('Notes fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No auth token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid auth token' });
    }
    
    const { notebooks, sections, pages, uid } = req.body;
    
    // Use UID from request body, fallback to token
    const userUid = uid || token;
    
    // Check if this is empty data (all arrays are empty)
    const isEmptyData = (!notebooks || notebooks.length === 0) && 
                       (!sections || sections.length === 0) && 
                       (!pages || pages.length === 0);
    
    // Only save if we have actual data, or if this is the first time (no existing data)
    const existingData = notesStorage.get(userUid);
    const hasExistingData = existingData && 
                           (existingData.notebooks?.length > 0 || 
                            existingData.sections?.length > 0 || 
                            existingData.pages?.length > 0);
    
    if (isEmptyData && hasExistingData) {
      console.log('⚠️ Ignoring empty data - keeping existing data for UID:', userUid);
      return res.json({ success: true, message: 'Empty data ignored - existing data preserved' });
    }
    
    const userData = {
      notebooks: notebooks || [],
      sections: sections || [],
      pages: pages || []
    };
    
    // Store data with user's UID as key
    notesStorage.set(userUid, userData);
    
    // Save to file
    saveNotesToFile();
    
    console.log('💾 Notes data saved for UID:', userUid);
    console.log('📊 Stored data:', {
      notebooks: userData.notebooks?.length || 0,
      sections: userData.sections?.length || 0,
      pages: userData.pages?.length || 0
    });
    
    return res.json({ success: true, message: 'Notes saved successfully' });
  } catch (error) {
    console.error('Notes save error:', error);
    return res.status(500).json({ error: 'Failed to save notes' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    console.log('👋 User logged out');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// API configuration endpoint
app.get('/api/config', (req, res) => {
  const config = {
    fixerApiKey: process.env.FIXER_API_KEY || null,
    hasFixerApiKey: !!process.env.FIXER_API_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    microsoftClientId: process.env.MICROSOFT_CLIENT_ID || null,
    hasGoogleAuth: !!process.env.GOOGLE_CLIENT_ID,
    hasMicrosoftAuth: !!process.env.MICROSOFT_CLIENT_ID,
    // Firebase configuration
    firebaseApiKey: process.env.FIREBASE_API_KEY || null,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || null,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || null,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || null,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || null,
    firebaseAppId: process.env.FIREBASE_APP_ID || null,
    hasFirebaseAuth: !!(process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID)
  };
  
  res.json(config);
});

// Holiday API endpoints - Temporarily disabled
// app.get('/api/holidays/:country', async (req, res) => {
//   try {
//     const { country } = req.params;
//     const { year } = req.query;
//     const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
//     
//     const holidays = await holidayService.getHolidays(country, currentYear);
//     
//     res.json({
//       country: country.toUpperCase(),
//       year: currentYear,
//       holidays: holidays.map(holiday => ({
//         id: holiday.id,
//         name: holiday.holiday_name,
//         date: holiday.holiday_date,
//         type: holiday.holiday_type
//       }))
//     });
//   } catch (error) {
//     console.error('Get holidays error:', error);
//     res.status(500).json({ error: 'Failed to fetch holidays' });
//   }
// });

// app.get('/api/holidays/:country/upcoming', async (req, res) => {
//   try {
//     const { country } = req.params;
//     const { limit } = req.query;
//     const limitNum = limit ? parseInt(limit as string) : 10;
//     
//     const holidays = await holidayService.getUpcomingHolidays(country, limitNum);
//     
//     res.json({
//       country: country.toUpperCase(),
//       upcomingHolidays: holidays.map(holiday => ({
//         id: holiday.id,
//         name: holiday.holiday_name,
//         date: holiday.holiday_date,
//         type: holiday.holiday_type
//       }))
//     });
//   } catch (error) {
//     console.error('Get upcoming holidays error:', error);
//     res.status(500).json({ error: 'Failed to fetch upcoming holidays' });
//   }
// });

// app.get('/api/holidays/supported-countries', (req, res) => {
//   const countries = holidayService.getSupportedCountries();
//   res.json({ countries });
// });

// Mock conversion endpoint (keeping existing functionality)
app.post('/api/convert-time', (req, res) => {
  const { fromZone, toZone, date, time } = req.body;
  
  // Simple mock conversion
  const inputDate = new Date(`${date}T${time}:00`);
  const convertedDate = new Date(inputDate.getTime() + 5 * 60 * 60 * 1000); // Add 5 hours as mock
  
  res.json({
    convertedTime: convertedDate.toLocaleString(),
    fromCurrent: new Date().toLocaleString(),
    toCurrent: new Date().toLocaleString(),
    dst: false
  });
});

// Database statistics endpoint - Temporarily disabled
// app.get('/api/stats', async (req, res) => {
//   try {
//     const stats = await database.getDatabaseStats();
//     const holidayStats = await holidayService.getHolidayStats();
//     
//     res.json({
//       database: stats,
//       holidays: holidayStats
//     });
//   } catch (error) {
//     console.error('Get stats error:', error);
//     res.status(500).json({ error: 'Failed to fetch statistics' });
//   }
// });

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize database and cleanup expired sessions - Temporarily disabled
  // try {
  //   await database.cleanupExpiredSessions();
  //   console.log('🧹 Cleaned up expired sessions');
  // } catch (error) {
  //   console.error('❌ Error during startup cleanup:', error);
  // }
});

export default app;
