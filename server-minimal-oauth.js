const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://new-pacmac.onrender.com' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static('.'));

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
    console.log('🔐 Google OAuth profile:', profile);
    
    // Create a simple user object
    const user = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      profilePicture: profile.photos[0]?.value,
      isVerified: false,
      ageVerified: false,
      identityVerified: false,
      payoutThreshold: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    console.log('✅ Google user created:', user.email);
    return done(null, user);
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return done(error, null);
  }
}));

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // For minimal server, just return a simple user object
  const user = {
    id: id,
    name: 'Google User',
    email: 'user@google.com',
    isVerified: false,
    ageVerified: false,
    identityVerified: false,
    totalEarnings: 0
  };
  done(null, user);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: 'minimal-oauth-1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.redirect('/marketplace');
});

// OAuth Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/marketplace?error=auth_failed' }),
  (req, res) => {
    // Successful authentication, redirect to home page
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
    const userInfo = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
      isVerified: req.user.isVerified,
      ageVerified: req.user.ageVerified,
      identityVerified: req.user.identityVerified,
      payoutThreshold: req.user.payoutThreshold,
      totalEarnings: req.user.totalEarnings
    };
    console.log('✅ Returning authenticated user:', userInfo.email);
    res.json({ success: true, user: userInfo });
  } else {
    console.log('❌ User not authenticated');
    res.json({ success: false, user: null });
  }
});

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.redirect('/marketplace');
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Minimal OAuth server running on port ${PORT}`);
  console.log(`🔐 OAuth callback URL: ${callbackURL}`);
});

module.exports = app;
