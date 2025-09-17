const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('.'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.2',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>PacMac Marketplace - Test</title></head>
      <body>
        <h1>PacMac Marketplace - Minimal Test Server</h1>
        <p>Server is running successfully!</p>
        <p>Version: 1.0.2</p>
        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        <p>Port: ${PORT}</p>
        <p><a href="/health">Health Check</a></p>
      </body>
    </html>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Minimal test server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
