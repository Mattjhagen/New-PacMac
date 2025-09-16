const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'basic-1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// Serve static files
app.use(express.static('.'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Basic server running on port ${PORT}`);
});

module.exports = app;
