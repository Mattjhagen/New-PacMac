const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

console.log(`Starting ultra-simple server with static file serving on port ${PORT}`);

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
  '.ico': 'image/x-icon'
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
  console.log(`${req.method} ${req.url}`);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // API Routes
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.20',
        port: PORT,
        nodeVersion: process.version
      }));
    } else if (req.url === '/api/user/profile') {
      // Mock user profile for admin pages
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        user: {
          id: 'demo-admin',
          name: 'Demo Admin',
          email: 'pacmacmobile@gmail.com',
          isAdmin: true,
          avatar: null
        }
      }));
    } else if (req.url === '/api/marketplace/items') {
      // Mock marketplace items for admin pages
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        items: [
          {
            id: 'demo_item_1',
            title: 'iPhone 13 Pro',
            description: 'Excellent condition, 128GB, space gray.',
            price: 650.00,
            category: 'electronics',
            location: 'Downtown Omaha',
            distance: '2.3 miles',
            image: '📱',
            seller: {
              id: 'demo_seller_1',
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
            id: 'demo_item_2',
            title: 'Vintage Leather Jacket',
            description: 'Classic brown leather jacket, size M.',
            price: 85.00,
            category: 'clothing',
            location: 'Midtown',
            distance: '1.8 miles',
            image: '🧥',
            seller: {
              id: 'demo_seller_2',
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
    } else if (req.url === '/api/marketplace/set-reserve' && req.method === 'POST') {
      // Mock reserve price setting
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Reserve price set successfully (demo mode)',
        item: {
          id: 'demo-item',
          title: 'Demo Item',
          reservePrice: 100.00
        }
      }));
    } else if (req.url === '/api/inventory/products') {
      // Mock inventory products with reserve prices
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        products: [
          {
            id: 'prod_1',
            name: 'iPhone 15 Pro Max',
            price: 1099.00,
            reservePrice: 1099.00,
            category: 'Main Product',
            description: 'Latest iPhone with Pro features',
            specifications: '{"storage": "256GB", "color": "Natural Titanium", "condition": "New"}',
            tags: 'iphone,apple,pro,max',
            image: '📱',
            status: 'active',
            postedToday: false,
            pendingPosts: 3
          },
          {
            id: 'prod_2',
            name: 'Samsung Galaxy S24 Ultra',
            price: 1199.00,
            reservePrice: 1199.00,
            category: 'Main Product',
            description: 'Premium Android flagship',
            specifications: '{"storage": "512GB", "color": "Titanium Black", "condition": "New"}',
            tags: 'samsung,galaxy,ultra',
            image: '📱',
            status: 'active',
            postedToday: true,
            pendingPosts: 2
          },
          {
            id: 'prod_3',
            name: 'MacBook Pro 14"',
            price: 1999.00,
            reservePrice: 1999.00,
            category: 'Main Product',
            description: 'Professional laptop for creators',
            specifications: '{"processor": "M3 Pro", "memory": "18GB", "storage": "512GB SSD"}',
            tags: 'macbook,apple,pro',
            image: '💻',
            status: 'active',
            postedToday: false,
            pendingPosts: 1
          }
        ],
        stats: {
          totalProducts: 3,
          totalValue: 4297.00,
          postedToday: 1,
          pendingPosts: 6
        }
      }));
    } else if (req.url === '/api/inventory/set-reserve' && req.method === 'POST') {
      // Handle setting reserve prices for inventory products
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: `Reserve price set to $${data.reservePrice} for product ${data.productId}`,
            productId: data.productId,
            reservePrice: data.reservePrice
          }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid request data'
          }));
        }
      });
    } else if (req.url === '/api/inventory/auto-posting/status') {
      // Mock auto-posting status
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        isRunning: false,
        lastRun: null,
        nextRun: null,
        totalProcessed: 0,
        errors: []
      }));
    } else if (req.url === '/api/inventory/auto-posting/start' && req.method === 'POST') {
      // Mock start auto-posting
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Auto-posting started successfully'
      }));
    } else if (req.url === '/api/inventory/auto-posting/stop' && req.method === 'POST') {
      // Mock stop auto-posting
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Auto-posting stopped successfully'
      }));
    } else {
      res.writeHead(501);
      res.end(JSON.stringify({
        error: 'API endpoint not implemented',
        path: req.url,
        message: 'This endpoint requires the full server',
        timestamp: new Date().toISOString()
      }));
    }
    return;
  }
  
  // Health check endpoint
  if (req.url === '/health') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
        version: '1.0.20',
      port: PORT,
      nodeVersion: process.version
    }));
    return;
  }
  
  // Static file serving
  let filePath = req.url;
  
  // Remove query parameters from URL
  if (filePath.includes('?')) {
    filePath = filePath.split('?')[0];
  }
  
  // Default to index.html for root
  if (filePath === '/') {
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
  console.log(`🚀 Ultra-simple server running on port ${PORT} - Clean deployment`);
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
