import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

interface CachedWeather {
  data: unknown;
  timestamp: number;
}

// Simple in-memory cache for weather data
const weatherCache: Map<string, CachedWeather> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Weather API endpoint with caching
  app.get('/api/weather/:location', async (req, res) => {
    const location = req.params.location;
    const cacheKey = `weather-${location}`;
    
    // Check cache
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.split(',')[0]}&longitude=${location.split(',')[1]}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );
      const data = await response.json();
      
      // Cache the result
      weatherCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  // Weather alerts endpoint
  app.get('/api/weather-alerts/:location', async (req, res) => {
    const location = req.params.location;
    const cacheKey = `alerts-${location}`;
    
    // Check cache
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.VITE_OPENWEATHER_API_KEY}&units=metric`
      );
      const data = await response.json();
      
      // Cache the result
      weatherCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch weather alerts' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Cache cleanup interval (every hour)
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of weatherCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        weatherCache.delete(key);
      }
    }
  }, 60 * 60 * 1000);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
