const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.3',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    nodeVersion: process.version
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>PacMac Marketplace - Ultra Minimal Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          .status { color: #28a745; font-weight: bold; }
          .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 PacMac Marketplace - Ultra Minimal Test Server</h1>
          <p class="status">✅ Server is running successfully!</p>
          
          <div class="info">
            <h3>Server Information:</h3>
            <p><strong>Version:</strong> 1.0.3</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Port:</strong> ${PORT}</p>
            <p><strong>Node Version:</strong> ${process.version}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <h3>Test Links:</h3>
          <ul>
            <li><a href="/health">Health Check</a></li>
            <li><a href="/test">Test Route</a></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: 'Test route working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ultra minimal server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Node version: ${process.version}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});