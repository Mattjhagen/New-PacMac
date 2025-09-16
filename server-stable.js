const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
// Simple verification services without external dependencies
const app = express();
const PORT = process.env.PORT || 3000;

// Simple verification service functions
const createVerificationSession = async (userId, userInfo) => {
  console.log('🔧 ID Verification - Demo Mode');
  return {
    success: true,
    transactionReference: `demo-${Date.now()}`,
    redirectUrl: `${process.env.BASE_URL || 'https://new-pacmac.onrender.com'}/demo-id-verification.html`,
    timestamp: new Date().toISOString(),
    demo: true
  };
};

const createLinkToken = async (userId) => {
  console.log('🔧 Bank Verification - Demo Mode');
  return {
    success: true,
    linkToken: `demo-link-token-${Date.now()}`,
    expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    timestamp: new Date().toISOString(),
    demo: true
  };
};

const verifyAddress = async (address) => {
  console.log('🔧 Address Verification - Demo Mode');
  return {
    success: true,
    verified: true,
    standardizedAddress: {
      street: address.street,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      plus4: '0000'
    },
    timestamp: new Date().toISOString(),
    demo: true
  };
};

// Admin system - in-memory storage (replace with database in production)
const adminData = {
  users: new Map(),
  chats: new Map(),
  deviceBans: new Set(),
  suspendedUsers: new Set(),
  adminActions: []
};

// Helper function to check if user is admin
function isAdmin(user) {
  return user && user.email && user.email.endsWith('@pacmacmobile.com');
}

// Helper function to log admin actions
function logAdminAction(adminId, action, targetId, details) {
  const logEntry = {
    id: Date.now(),
    adminId,
    action,
    targetId,
    details,
    timestamp: new Date().toISOString()
  };
  adminData.adminActions.push(logEntry);
  console.log('🔧 Admin Action:', logEntry);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://new-pacmac.onrender.com' 
    : 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'pacmac-marketplace-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    httpOnly: true
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
const callbackURL = process.env.NODE_ENV === 'production'
  ? 'https://new-pacmac.onrender.com/auth/google/callback'
  : 'http://localhost:3000/auth/google/callback';

console.log('🔐 OAuth Configuration:');
console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Using fallback'}`);
console.log(`   Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Using fallback'}`);
console.log(`   Callback URL: ${callbackURL}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '1053950032683-igseosamup9cej3bn1o8lj5kqdok1t1b.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
  callbackURL: callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 Google OAuth profile received:', profile.displayName, profile.emails[0].value);
    
    const user = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=3b82f6&color=fff`,
      provider: 'google',
      ageVerified: true,
      identityVerified: false,
      totalEarnings: 0,
      isOAuth: true,
      isAdmin: isAdmin({ email: profile.emails[0].value }),
      deviceId: null, // Will be set by client
      lastLogin: new Date().toISOString()
    };
    
    // Store user data for admin system
    adminData.users.set(user.id, user);
    
    if (user.isAdmin) {
      console.log('🔧 Admin user detected:', user.email);
    }
    
    return done(null, user);
  } catch (error) {
    console.error('❌ OAuth error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'stable-1.0.0',
    oauth: 'enabled'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// OAuth routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/home.html?error=auth_failed' }),
  (req, res) => {
    console.log('✅ Google OAuth callback successful, user:', req.user?.email);
    console.log('✅ Session ID:', req.sessionID);
    res.redirect('/home.html?auth=success&provider=google');
  }
);

app.get('/auth/user', (req, res) => {
  console.log('🔍 Auth user check - isAuthenticated:', req.isAuthenticated());
  console.log('🔍 Session ID:', req.sessionID);
  console.log('🔍 User:', req.user?.email);
  
  if (req.isAuthenticated()) {
    // Update user data in admin system
    adminData.users.set(req.user.id, req.user);
    
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.json({
      success: false,
      user: null
    });
  }
});

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  
  if (!isAdmin(req.user)) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  
  next();
}

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/home.html');
  });
});

// Admin Endpoints
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  try {
    const stats = {
      totalUsers: adminData.users.size,
      suspendedUsers: adminData.suspendedUsers.size,
      bannedDevices: adminData.deviceBans.size,
      totalChats: adminData.chats.size,
      recentActions: adminData.adminActions.slice(-10).reverse()
    };
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const users = Array.from(adminData.users.values()).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuspended: adminData.suspendedUsers.has(user.id),
      deviceId: user.deviceId,
      lastLogin: user.lastLogin,
      totalEarnings: user.totalEarnings || 0
    }));
    
    res.json({
      success: true,
      users,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:userId/suspend', requireAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;
    
    if (adminData.suspendedUsers.has(userId)) {
      return res.status(400).json({ success: false, error: 'User already suspended' });
    }
    
    adminData.suspendedUsers.add(userId);
    logAdminAction(req.user.id, 'SUSPEND_USER', userId, { reason, duration });
    
    res.json({
      success: true,
      message: 'User suspended successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin suspend error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:userId/unsuspend', requireAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!adminData.suspendedUsers.has(userId)) {
      return res.status(400).json({ success: false, error: 'User not suspended' });
    }
    
    adminData.suspendedUsers.delete(userId);
    logAdminAction(req.user.id, 'UNSUSPEND_USER', userId, {});
    
    res.json({
      success: true,
      message: 'User unsuspended successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin unsuspend error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:userId/kick', requireAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    logAdminAction(req.user.id, 'KICK_USER', userId, { reason });
    
    res.json({
      success: true,
      message: 'User kicked successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin kick error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/admin/devices/:deviceId/ban', requireAdmin, (req, res) => {
  try {
    const { deviceId } = req.params;
    const { reason } = req.body;
    
    if (adminData.deviceBans.has(deviceId)) {
      return res.status(400).json({ success: false, error: 'Device already banned' });
    }
    
    adminData.deviceBans.add(deviceId);
    logAdminAction(req.user.id, 'BAN_DEVICE', deviceId, { reason });
    
    res.json({
      success: true,
      message: 'Device banned successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin device ban error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/admin/devices/:deviceId/unban', requireAdmin, (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!adminData.deviceBans.has(deviceId)) {
      return res.status(400).json({ success: false, error: 'Device not banned' });
    }
    
    adminData.deviceBans.delete(deviceId);
    logAdminAction(req.user.id, 'UNBAN_DEVICE', deviceId, {});
    
    res.json({
      success: true,
      message: 'Device unbanned successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin device unban error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/admin/chats', requireAdmin, (req, res) => {
  try {
    const chats = Array.from(adminData.chats.values());
    
    res.json({
      success: true,
      chats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin chats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/admin/chats/:chatId', requireAdmin, (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = adminData.chats.get(chatId);
    
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    
    res.json({
      success: true,
      chat,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin chat details error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/admin/actions', requireAdmin, (req, res) => {
  try {
    const actions = adminData.adminActions.slice(-50).reverse();
    
    res.json({
      success: true,
      actions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin actions error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Verification Endpoints
app.post('/api/verification/id/initiate', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const result = await createVerificationSession(req.user.id, req.user);
    
    if (result.success) {
      res.json({
        success: true,
        redirectUrl: result.redirectUrl,
        transactionReference: result.transactionReference,
        demo: result.demo
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('ID Verification Initiate Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/verification/id/status/:transactionReference', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const result = await idVerification.getVerificationStatus(req.params.transactionReference);
    res.json(result);
  } catch (error) {
    console.error('ID Verification Status Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/verification/bank/create-link-token', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const result = await createLinkToken(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Plaid Link Token Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/verification/bank/exchange-token', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { publicToken } = req.body;
    if (!publicToken) {
      return res.status(400).json({ success: false, error: 'Public token required' });
    }

    const result = await bankVerification.exchangePublicToken(publicToken, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Plaid Exchange Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/verification/address', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { street, city, state, zipcode } = req.body;
    if (!street || !city || !state || !zipcode) {
      return res.status(400).json({ success: false, error: 'Complete address required' });
    }

    const result = await verifyAddress({ street, city, state, zipcode });
    res.json(result);
  } catch (error) {
    console.error('Address Verification Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Verification callback endpoints
app.post('/api/verification/callback', (req, res) => {
  console.log('ID Verification Callback:', req.body);
  // Handle ID verification webhook
  res.status(200).json({ received: true });
});

app.post('/api/plaid/webhook', (req, res) => {
  console.log('Plaid Webhook:', req.body);
  // Handle Plaid webhook
  res.status(200).json({ received: true });
});

// Serve static files
app.use(express.static('.'));

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Stable server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 OAuth enabled: Google`);
});

module.exports = app;
