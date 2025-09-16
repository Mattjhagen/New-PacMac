const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'ultra-stable-1.0.0'
  });
});

// Root endpoint - redirect to home
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// Serve static files
app.use(express.static('.'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ultra stable server running on port ${PORT}`);
});

module.exports = app;
