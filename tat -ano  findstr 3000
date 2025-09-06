// src/server.js

import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const API_KEY = process.env.TIMEZONEDB_API_KEY;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Resolve city to timezone
app.get('/api/resolve-city', async (req, res) => {
  try {
    const city = req.query.city;
    const url = `https://api.timezonedb.com/v2.1/list-time-zone?key=${API_KEY}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    const match = data.zones.find(z => z.zoneName.toLowerCase().includes(city.toLowerCase()));
    if (match) {
      res.json({ zone: match.zoneName });
    } else {
      res.status(404).json({ error: 'City not found in timezone list' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error while resolving city' });
  }
});

// Convert time between zones
app.post('/api/convert-time', async (req, res) => {
  try {
    const { fromZone, toZone, date, time } = req.body;
    const inputDate = new Date(`${date}T${time}:00`);

    const [fromRes, toRes] = await Promise.all([
      fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=${fromZone}`),
      fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=${toZone}`)
    ]);

    const fromData = await fromRes.json();
    const toData = await toRes.json();

    const offsetDiff = (toData.gmtOffset - fromData.gmtOffset) * 1000;
    const converted = new Date(inputDate.getTime() + offsetDiff);

    res.json({
      convertedTime: converted.toLocaleString(),
      fromCurrent: new Date(fromData.timestamp * 1000).toLocaleString(),
      toCurrent: new Date(toData.timestamp * 1000).toLocaleString(),
      dst: toData.dst === '1'
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during time conversion' });
  }
});

// Serve timezone list to frontend
app.get('/api/timezones', async (req, res) => {
  try {
    const url = `https://api.timezonedb.com/v2.1/list-time-zone?key=${API_KEY}&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.zones || !Array.isArray(data.zones)) {
      return res.status(500).json({ error: 'Invalid response from TimeZoneDB' });
    }

    const zones = data.zones.map(z => z.zoneName);
    res.json({ zones });
  } catch (err) {
    console.error('Error fetching timezones:', err);
    res.status(500).json({ error: 'Failed to fetch timezones' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));


