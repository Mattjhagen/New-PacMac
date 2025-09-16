const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'minimal-verification-1.0.1',
    verification: 'enabled'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// Simple verification endpoints - NO AUTHENTICATION REQUIRED FOR TESTING
app.post('/api/verification/id/initiate', (req, res) => {
  console.log('🔧 ID Verification endpoint called');
  res.json({
    success: true,
    transactionReference: `demo-${Date.now()}`,
    redirectUrl: 'https://new-pacmac.onrender.com/demo-id-verification.html',
    timestamp: new Date().toISOString(),
    demo: true
  });
});

app.post('/api/verification/bank/create-link-token', (req, res) => {
  console.log('🔧 Bank Verification endpoint called');
  res.json({
    success: true,
    linkToken: `demo-link-token-${Date.now()}`,
    expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    timestamp: new Date().toISOString(),
    demo: true
  });
});

app.post('/api/verification/address', (req, res) => {
  console.log('🔧 Address Verification endpoint called');
  const { street, city, state, zipcode } = req.body;
  
  if (!street || !city || !state || !zipcode) {
    return res.status(400).json({ success: false, error: 'Complete address required' });
  }

  res.json({
    success: true,
    verified: true,
    standardizedAddress: {
      street: street,
      city: city,
      state: state,
      zipcode: zipcode,
      plus4: '0000'
    },
    timestamp: new Date().toISOString(),
    demo: true
  });
});

// Serve static files
app.use(express.static('.'));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal verification server running on port ${PORT}`);
  console.log(`🔧 Verification endpoints enabled`);
});

module.exports = app;
