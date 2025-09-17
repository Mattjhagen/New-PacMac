const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle different routes
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.5',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      url: req.url,
      method: req.method
    }));
  } else if (req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Absolute minimal server working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    }));
  } else if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PacMac Marketplace - Absolute Minimal Test</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              min-height: 100vh; 
              color: white;
            }
            .container { 
              background: rgba(255,255,255,0.1); 
              padding: 30px; 
              border-radius: 10px; 
              backdrop-filter: blur(10px);
              max-width: 800px; 
              margin: 0 auto; 
            }
            h1 { color: white; text-align: center; }
            .status { color: #4CAF50; font-weight: bold; text-align: center; font-size: 1.2em; }
            .info { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; margin: 20px 0; }
            .links { text-align: center; margin: 20px 0; }
            .links a { 
              display: inline-block; 
              margin: 10px; 
              padding: 10px 20px; 
              background: rgba(255,255,255,0.2); 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              border: 1px solid rgba(255,255,255,0.3);
            }
            .links a:hover { background: rgba(255,255,255,0.3); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 PacMac Marketplace - Absolute Minimal Test</h1>
            <p class="status">✅ Server is running successfully!</p>
            
            <div class="info">
              <h3>Server Information:</h3>
              <p><strong>Version:</strong> 1.0.5</p>
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
            </div>
            
            <div class="info">
              <h3>Debugging Information:</h3>
              <p>This is the most minimal possible Node.js server using only the built-in <code>http</code> module.</p>
              <p>If this doesn't work, the issue is likely:</p>
              <ul>
                <li>Render service configuration</li>
                <li>Node.js version compatibility</li>
                <li>Port binding issues</li>
                <li>Network/firewall restrictions</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Not found',
      path: req.url,
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Absolute minimal server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Node version: ${process.version}`);
  console.log(`🖥️ Platform: ${process.platform} ${process.arch}`);
  console.log(`🔗 Listening on: 0.0.0.0:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});