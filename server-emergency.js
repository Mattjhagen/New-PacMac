const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('.'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: 'emergency-1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'PacMac Marketplace Emergency Server',
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Emergency server running on port ${PORT}`);
});

module.exports = app;
