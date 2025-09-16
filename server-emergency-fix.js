const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'emergency-fix-1.0.0'
  });
});

// Root endpoint - must be before static files
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// Serve static files
app.use(express.static('.'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Emergency fix server running on port ${PORT}`);
  console.log(`📁 Serving static files from current directory`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
