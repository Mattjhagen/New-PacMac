const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

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
      isAdmin: profile.emails[0].value.endsWith('@pacmacmobile.com'),
      deviceId: null,
      lastLogin: new Date().toISOString()
    };
    
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
    version: 'verification-fix-1.0.0',
    oauth: 'enabled',
    verification: 'enabled'
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

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/home.html');
  });
});

// Simple verification endpoints
app.post('/api/verification/id/initiate', async (req, res) => {
  try {
    console.log('🔧 ID Verification endpoint called');
    
    // For demo purposes, we'll allow this without authentication
    const result = {
      success: true,
      transactionReference: `demo-${Date.now()}`,
      redirectUrl: `${process.env.BASE_URL || 'https://new-pacmac.onrender.com'}/demo-id-verification.html`,
      timestamp: new Date().toISOString(),
      demo: true
    };
    
    console.log('🔧 ID Verification result:', result);
    res.json(result);
  } catch (error) {
    console.error('ID Verification Initiate Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/verification/bank/create-link-token', async (req, res) => {
  try {
    console.log('🔧 Bank Verification endpoint called');
    
    const result = {
      success: true,
      linkToken: `demo-link-token-${Date.now()}`,
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      timestamp: new Date().toISOString(),
      demo: true
    };
    
    console.log('🔧 Bank Verification result:', result);
    res.json(result);
  } catch (error) {
    console.error('Bank Verification Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/verification/address', async (req, res) => {
  try {
    console.log('🔧 Address Verification endpoint called');
    
    const { street, city, state, zipcode } = req.body;
    if (!street || !city || !state || !zipcode) {
      return res.status(400).json({ success: false, error: 'Complete address required' });
    }

    const result = {
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
    };
    
    console.log('🔧 Address Verification result:', result);
    res.json(result);
  } catch (error) {
    console.error('Address Verification Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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
  console.log(`🚀 Verification fix server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 OAuth enabled: Google`);
  console.log(`🔧 Verification endpoints enabled`);
});

module.exports = app;
