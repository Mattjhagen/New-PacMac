const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      server: 'running',
      database: 'in-memory',
      oauth: 'disabled'
    },
    timestamp: new Date().toISOString()
  });
});

// Serve marketplace
app.get('/marketplace', (req, res) => {
  res.sendFile(path.join(__dirname, 'marketplace.html'));
});

// Serve main page
app.get('/', (req, res) => {
  res.redirect('/marketplace');
});

// Basic API endpoints (without OAuth for now)
app.get('/api/marketplace/items', (req, res) => {
  res.json({
    success: true,
    items: [
      {
        id: 'demo-item-1',
        title: 'iPhone 15 Pro Max',
        description: 'Like new condition, 256GB storage',
        price: 1000,
        image: 'https://via.placeholder.com/300x200?text=iPhone+15+Pro+Max',
        category: 'electronics',
        condition: 'like_new',
        location: {
          city: 'New York',
          state: 'NY',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        seller: {
          id: 'demo-seller',
          name: 'Demo Seller',
          rating: 4.8
        },
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Mock auth endpoint
app.get('/auth/user', (req, res) => {
  res.json({
    success: false,
    message: 'OAuth not configured - using demo mode'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PacMac Marketplace (Simple) running on port ${PORT}`);
  console.log(`📱 Marketplace: http://localhost:${PORT}/marketplace`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Demo mode: OAuth disabled for testing`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
