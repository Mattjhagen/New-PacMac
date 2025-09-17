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
    version: '1.0.4',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>PacMac Marketplace - Render Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
          .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); max-width: 800px; margin: 0 auto; }
          h1 { color: #333; text-align: center; }
          .status { color: #28a745; font-weight: bold; text-align: center; font-size: 1.2em; }
          .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .links { text-align: center; margin: 20px 0; }
          .links a { display: inline-block; margin: 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .links a:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 PacMac Marketplace - Render Test Server</h1>
          <p class="status">✅ Server is running successfully on Render!</p>
          
          <div class="info">
            <h3>Server Information:</h3>
            <p><strong>Version:</strong> 1.0.4</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Port:</strong> ${PORT}</p>
            <p><strong>Node Version:</strong> ${process.version}</p>
            <p><strong>Platform:</strong> ${process.platform}</p>
            <p><strong>Architecture:</strong> ${process.arch}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <div class="links">
            <a href="/health">Health Check</a>
            <a href="/test">Test Route</a>
            <a href="/marketplace.html">Marketplace</a>
            <a href="/welcome.html">Welcome Page</a>
          </div>
          
          <div class="info">
            <h3>Next Steps:</h3>
            <p>If you can see this page, the basic server is working. The 502 error was likely caused by:</p>
            <ul>
              <li>Missing environment variables</li>
              <li>External service initialization failures</li>
              <li>Vercel-specific dependencies</li>
            </ul>
            <p>We can now gradually add back features to identify the exact cause.</p>
          </div>
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
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
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
  console.log(`🚀 Render test server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Node version: ${process.version}`);
  console.log(`🖥️ Platform: ${process.platform} ${process.arch}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
