// API Proxy for PacMac Mobile Frontend
// This handles CORS and proxies requests to the admin backend

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Admin backend URL
const ADMIN_API_URL = 'https://admin.pacmacmobile.com/api';

// Proxy all API requests to admin backend
app.use('/api', async (req, res) => {
  try {
    const url = `${ADMIN_API_URL}${req.path}`;
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    };

    if (req.method !== 'GET' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Proxy running on port ${PORT}`);
});
