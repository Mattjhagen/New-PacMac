const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const PORT = process.env.PORT || 3000;

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Serve static files
function serveStaticFile(filePath, res) {
  const extname = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'File not found',
          path: filePath,
          timestamp: new Date().toISOString()
        }));
      } else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Server error',
          message: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${pathname}`);

  // API Routes
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.8',
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }));
    } else if (pathname === '/api/user/profile') {
      // Mock user profile for admin pages
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: {
          id: 'demo-admin',
          name: 'Admin User',
          email: 'pacmacmobile@gmail.com',
          isAdmin: true,
          avatar: null
        }
      }));
    } else if (pathname === '/api/marketplace/items') {
      // Mock marketplace items for admin pages
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        items: [
          {
            id: 'item_sample_1',
            title: 'iPhone 13 Pro',
            description: 'Excellent condition, 128GB, space gray. Includes original box and charger.',
            price: 650.00,
            category: 'electronics',
            location: 'Downtown Omaha',
            distance: '2.3 miles',
            image: '📱',
            seller: {
              id: 'seller_sample_1',
              name: 'TechTrader',
              rating: 4.8
            },
            bids: [],
            status: 'active',
            auctionStatus: 'not_started',
            currentHighestBid: 0,
            currentHighestBidder: null,
            currentHighestBidderName: null,
            auctionEndTime: null,
            reservePrice: 500.00,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'item_sample_2',
            title: 'Vintage Leather Jacket',
            description: 'Classic brown leather jacket, size M. Great condition with minimal wear.',
            price: 85.00,
            category: 'clothing',
            location: 'Midtown',
            distance: '1.8 miles',
            image: '🧥',
            seller: {
              id: 'seller_sample_2',
              name: 'StyleCollector',
              rating: 4.9
            },
            bids: [],
            status: 'active',
            auctionStatus: 'not_started',
            currentHighestBid: 0,
            currentHighestBidder: null,
            currentHighestBidderName: null,
            auctionEndTime: null,
            reservePrice: 60.00,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        total: 2
      }));
    } else if (pathname === '/api/marketplace/set-reserve' && method === 'POST') {
      // Mock reserve price setting
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Reserve price set successfully (demo mode)',
        item: {
          id: 'demo-item',
          title: 'Demo Item',
          reservePrice: 100.00
        }
      }));
    } else {
      res.writeHead(501, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'API endpoint not implemented in minimal server',
        path: pathname,
        message: 'This endpoint requires the full server with all dependencies',
        timestamp: new Date().toISOString()
      }));
    }
    return;
  }

  // Health check endpoint
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.6',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }));
    return;
  }

  // Test route
  if (pathname === '/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Enhanced minimal server working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      availableRoutes: [
        '/',
        '/health',
        '/test',
        '/marketplace.html',
        '/welcome.html',
        '/home.html',
        '/transaction-test.html',
        '/location-test.html'
      ]
    }));
    return;
  }

  // OAuth routes - return helpful message
  if (pathname.startsWith('/auth/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'OAuth authentication not available in minimal server',
      path: pathname,
      note: 'This requires the full server with Google OAuth configuration',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Static file serving
  let filePath = pathname;
  
  // Default to index.html for root
  if (pathname === '/') {
    filePath = '/index.html';
  }
  
  // Add .html extension if no extension provided and file doesn't exist
  if (!path.extname(filePath)) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
      filePath += '.html';
    }
  }

  // Serve the file
  const fullPath = path.join(__dirname, filePath);
  
  // Security check - prevent directory traversal
  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Forbidden',
      message: 'Directory traversal not allowed',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  serveStaticFile(fullPath, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Enhanced minimal server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Node version: ${process.version}`);
  console.log(`🖥️ Platform: ${process.platform} ${process.arch}`);
  console.log(`🔗 Listening on: 0.0.0.0:${PORT}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
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
