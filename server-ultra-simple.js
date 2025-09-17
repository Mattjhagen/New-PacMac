const http = require('http');
const PORT = process.env.PORT || 3000;

console.log(`Starting ultra-simple server on port ${PORT}`);

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.10',
      port: PORT,
      nodeVersion: process.version
    }));
  } else {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Ultra-simple server working!',
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ultra-simple server running on port ${PORT}`);
  console.log(`📦 Node version: ${process.version}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
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
