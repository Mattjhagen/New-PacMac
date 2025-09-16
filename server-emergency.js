const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static('.'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: 'emergency-1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'PacMac Marketplace Emergency Server',
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// OAuth routes (minimal implementation)
app.get('/auth/google', (req, res) => {
  // Redirect to Google OAuth with your new credentials
  const clientId = '1053950032683-igseosamup9cej3bn1o8lj5kqdok1t1b.apps.googleusercontent.com';
  const redirectUri = encodeURIComponent('https://new-pacmac.onrender.com/auth/google/callback');
  const scope = encodeURIComponent('profile email');
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  
  res.redirect(googleAuthUrl);
});

app.get('/auth/google/callback', (req, res) => {
  // Handle OAuth callback
  const { code, error } = req.query;
  
  if (error) {
    console.log('OAuth error:', error);
    return res.redirect('/marketplace.html?auth=error&message=' + encodeURIComponent(error));
  }
  
  if (!code) {
    console.log('No authorization code received');
    return res.redirect('/marketplace.html?auth=error&message=No authorization code');
  }
  
  console.log('OAuth callback received code:', code);
  
  // For now, redirect to marketplace with success
  // In a full implementation, we'd exchange the code for tokens
  res.redirect('/marketplace.html?auth=success&code=' + code);
});

app.get('/auth/user', (req, res) => {
  // Return demo user for testing
  res.json({
    success: true,
    user: {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@pacmacmobile.com',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff'
    }
  });
});

app.get('/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Emergency server running on port ${PORT}`);
});

module.exports = app;
