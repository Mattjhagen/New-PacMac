const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
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

// Keep-alive ping mechanism to prevent Render from sleeping
function keepAlivePing() {
  const url = process.env.RENDER_EXTERNAL_URL || 'https://new-pacmac.onrender.com';
  console.log(`🔄 Sending keep-alive ping to ${url}`);
  
  const options = {
    method: 'GET',
    timeout: 10000,
    headers: {
      'User-Agent': 'PacMac-KeepAlive/1.0'
    }
  };
  
  const req = https.request(url + '/health', options, (res) => {
    console.log(`✅ Keep-alive ping successful: ${res.statusCode}`);
  });
  
  req.on('error', (error) => {
    console.log(`❌ Keep-alive ping failed: ${error.message}`);
  });
  
  req.on('timeout', () => {
    console.log(`⏰ Keep-alive ping timeout`);
    req.destroy();
  });
  
  req.end();
}

// Start keep-alive ping every 5 minutes (300000ms)
setInterval(keepAlivePing, 5 * 60 * 1000);

// Send initial ping after 30 seconds
setTimeout(keepAlivePing, 30000);

console.log('🔄 Keep-alive ping system initialized (every 5 minutes)');

// Persistent bidding timer system
const biddingTimers = new Map();

function startBiddingTimer(itemId, endTime) {
  const now = Date.now();
  const timeLeft = endTime - now;
  
  if (timeLeft <= 0) {
    console.log(`⏰ Bidding timer for item ${itemId} has already ended`);
    return;
  }
  
  console.log(`⏰ Starting bidding timer for item ${itemId}, ends in ${Math.round(timeLeft / 1000)}s`);
  
  const timer = setTimeout(() => {
    console.log(`🔔 Bidding ended for item ${itemId}`);
    biddingTimers.delete(itemId);
    // Here you would typically update the database to mark the auction as ended
  }, timeLeft);
  
  biddingTimers.set(itemId, {
    timer,
    endTime,
    startTime: now
  });
}

function getBiddingTimeLeft(itemId) {
  const biddingData = biddingTimers.get(itemId);
  if (!biddingData) {
    return null;
  }
  
  const timeLeft = biddingData.endTime - Date.now();
  return timeLeft > 0 ? timeLeft : 0;
}

// Restore bidding timers on server restart (in a real app, this would come from database)
function restoreBiddingTimers() {
  console.log('🔄 Restoring bidding timers...');
  // Example: restore some active auctions
  const activeAuctions = [
    { id: 'demo_item_1', endTime: Date.now() + (2 * 60 * 60 * 1000) }, // 2 hours
    { id: 'demo_item_2', endTime: Date.now() + (1 * 60 * 60 * 1000) }  // 1 hour
  ];
  
  activeAuctions.forEach(auction => {
    startBiddingTimer(auction.id, auction.endTime);
  });
}

// Restore timers after 5 seconds
setTimeout(restoreBiddingTimers, 5000);

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
        version: '1.0.24',
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
          postedToday: 2,
          pendingPosts: 4
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
    } else if (req.url === '/api/auto-poster/start' && req.method === 'POST') {
      // Mock start auto-posting
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Auto-posting started successfully'
      }));
    } else if (req.url === '/api/auto-poster/stop' && req.method === 'POST') {
      // Mock stop auto-posting
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'Auto-posting stopped successfully'
      }));
    } else if (req.url === '/api/auto-poster/schedule') {
      // Mock schedule data
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        schedule: [
          {
            day: 'Monday',
            products: ['iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra'],
            status: 'completed',
            postedCount: 2
          },
          {
            day: 'Tuesday',
            products: ['MacBook Pro 14"'],
            status: 'pending',
            postedCount: 0
          },
          {
            day: 'Wednesday',
            products: ['iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra'],
            status: 'pending',
            postedCount: 0
          },
          {
            day: 'Thursday',
            products: ['MacBook Pro 14"'],
            status: 'pending',
            postedCount: 0
          },
          {
            day: 'Friday',
            products: ['iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra'],
            status: 'pending',
            postedCount: 0
          },
          {
            day: 'Saturday',
            products: ['MacBook Pro 14"'],
            status: 'pending',
            postedCount: 0
          },
          {
            day: 'Sunday',
            products: ['iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra'],
            status: 'pending',
            postedCount: 0
          }
        ]
      }));
    } else if (req.url === '/api/bidding/timer' && req.method === 'GET') {
      // Get bidding timer status for all items
      const timers = {};
      biddingTimers.forEach((data, itemId) => {
        const timeLeft = getBiddingTimeLeft(itemId);
        timers[itemId] = {
          timeLeft,
          endTime: data.endTime,
          isActive: timeLeft > 0
        };
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        timers,
        serverTime: Date.now()
      }));
    } else if (req.url.startsWith('/api/bidding/timer/') && req.method === 'GET') {
      // Get bidding timer for specific item
      const itemId = req.url.split('/').pop();
      const timeLeft = getBiddingTimeLeft(itemId);
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        itemId,
        timeLeft,
        isActive: timeLeft > 0,
        serverTime: Date.now()
      }));
    } else if (req.url.startsWith('/api/bidding/start/') && req.method === 'POST') {
      // Start bidding timer for item
      const itemId = req.url.split('/').pop();
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const duration = data.duration || (24 * 60 * 60 * 1000); // Default 24 hours
          const endTime = Date.now() + duration;
          
          startBiddingTimer(itemId, endTime);
          
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            itemId,
            endTime,
            duration,
            message: `Bidding timer started for item ${itemId}`
          }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid request data'
          }));
        }
      });
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
        version: '1.0.25',
      port: PORT,
      nodeVersion: process.version
    }));
    return;
  }

  // Create Stripe Checkout Session
  if (req.method === 'POST' && req.url === '/api/stripe/create-checkout-session') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { items, success_url, cancel_url, metadata = {} } = JSON.parse(body);
        
        if (!items || !Array.isArray(items) || items.length === 0) {
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(400);
          res.end(JSON.stringify({
            error: 'Items are required for checkout session'
          }));
          return;
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => {
          return sum + (item.amount || 0);
        }, 0);

        if (totalAmount < 5) { // Minimum $0.05 for demo items
          res.setHeader('Content-Type', 'application/json');
          res.writeHead(400);
          res.end(JSON.stringify({
            error: 'Invalid amount. Minimum charge is $0.05.'
          }));
          return;
        }

        // Create mock checkout session
        const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const mockCheckoutSession = {
          id: sessionId,
          url: `${req.headers.host ? 'https://' + req.headers.host : 'https://new-pacmac.onrender.com'}/stripe-checkout?session_id=${sessionId}`,
          amount_total: Math.round(totalAmount * 100), // Convert to cents
          currency: 'usd',
          status: 'open',
          payment_status: 'unpaid',
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            source: 'pacmac-mobile',
            items: JSON.stringify(items)
          }
        };

        console.log('Created Stripe checkout session:', sessionId);
        console.log('Checkout URL:', mockCheckoutSession.url);

        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
          sessionId: mockCheckoutSession.id,
          checkoutUrl: mockCheckoutSession.url,
          amount: mockCheckoutSession.amount_total,
          currency: mockCheckoutSession.currency,
          status: mockCheckoutSession.status
        }));
      } catch (error) {
        console.error('Stripe checkout session error:', error);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(500);
        res.end(JSON.stringify({
          error: 'Failed to create checkout session'
        }));
      }
    });
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
