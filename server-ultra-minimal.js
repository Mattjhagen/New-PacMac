const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'ultra-minimal-1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ultra minimal server running on port ${PORT}`);
});

module.exports = app;
