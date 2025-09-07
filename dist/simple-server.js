import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));
app.use(express.json());
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
    }
    catch (error) {
        console.error('❌ Error reading timezones file:', error);
        // Fallback to basic timezones
        const fallbackZones = [
            'America/New_York', 'America/Los_Angeles', 'Europe/London',
            'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney', 'UTC'
        ];
        res.json({ zones: fallbackZones });
    }
});
// API configuration endpoint
app.get('/api/config', (req, res) => {
    const config = {
        fixerApiKey: process.env.FIXER_API_KEY || null,
        hasFixerApiKey: !!process.env.FIXER_API_KEY
    };
    res.json(config);
});
// Mock conversion endpoint
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
// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
export default app;
//# sourceMappingURL=simple-server.js.map