const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const { IDVerificationService, BankVerificationService, AddressVerificationService } = require('./verification-service');
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize verification services
const idVerification = new IDVerificationService();
const bankVerification = new BankVerificationService();
const addressVerification = new AddressVerificationService();

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
      isOAuth: true
    };
    
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

// Verification Endpoints
app.post('/api/verification/id/initiate', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const result = await idVerification.createVerificationSession(req.user.id, req.user);
    
    if (result.success) {
      res.json({
        success: true,
        redirectUrl: result.redirectUrl,
        transactionReference: result.transactionReference
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

    const result = await bankVerification.createLinkToken(req.user.id);
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

    const result = await addressVerification.verifyAddress({ street, city, state, zipcode });
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
