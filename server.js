const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
// const TwitterStrategy = require('passport-twitter-oauth2').Strategy; // Temporarily disabled
// Initialize Stripe with error handling
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');
  console.log('✅ Stripe initialized');
} catch (error) {
  console.log('⚠️ Stripe initialization failed:', error.message);
  stripe = null;
}

// Initialize SendGrid with error handling
let sgMail;
try {
  sgMail = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid initialized');
  } else {
    console.log('⚠️ SendGrid API key not set');
  }
} catch (error) {
  console.log('⚠️ SendGrid initialization failed:', error.message);
  sgMail = null;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://new-pacmac.onrender.com' 
    : ['http://localhost:3000', 'http://192.168.1.39:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('.'));

// Google domain verification endpoint
app.get('/google-verification-file.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'google-verification-file.html'));
});

// Location verification endpoints
let LocationVerification, locationVerifier;
try {
  LocationVerification = require('./location-verification');
  locationVerifier = new LocationVerification();
  console.log('✅ Location verification system initialized');
} catch (error) {
  console.log('⚠️ Location verification system not available:', error.message);
  locationVerifier = null;
}

// Verify transaction proximity
app.post('/api/verify-transaction-location', async (req, res) => {
  try {
    if (!locationVerifier) {
      return res.status(503).json({
        success: false,
        error: 'Location verification service not available'
      });
    }

    const { transactionId, customerLocation, meetingLocation } = req.body;
    
    if (!customerLocation || !meetingLocation) {
      return res.status(400).json({
        success: false,
        error: 'Customer location and meeting location are required'
      });
    }

    const result = locationVerifier.verifyProximity(customerLocation, meetingLocation);
    
    res.json({
      success: true,
      verified: result.isWithinRange,
      proximity: result,
      transactionId
    });
  } catch (error) {
    console.error('Location verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get directions to meeting location
app.post('/api/get-directions', async (req, res) => {
  try {
    if (!locationVerifier) {
      return res.status(503).json({
        success: false,
        error: 'Location verification service not available'
      });
    }

    const { customerLocation, meetingLocation } = req.body;
    
    if (!customerLocation || !meetingLocation) {
      return res.status(400).json({
        success: false,
        error: 'Customer location and meeting location are required'
      });
    }

    const directions = await locationVerifier.getDirections(customerLocation, meetingLocation);
    
    res.json({
      success: true,
      directions
    });
  } catch (error) {
    console.error('Directions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Geocode address to coordinates
app.post('/api/geocode-address', async (req, res) => {
  try {
    if (!locationVerifier) {
      return res.status(503).json({
        success: false,
        error: 'Location verification service not available'
      });
    }

    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    const result = await locationVerifier.geocodeAddress(address);
    
    res.json(result);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
    // Check if user already exists
    let user = marketplaceData.users.find(u => u.googleId === profile.id);
    
    if (user) {
      // Update last login
      user.lastLogin = new Date().toISOString();
      return done(null, user);
    }
    
    // Create new user
    user = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profilePicture: profile.photos[0]?.value,
      isVerified: false,
      ageVerified: false,
      identityVerified: false,
      payoutThreshold: 0,
      totalEarnings: 0,
      deviceIds: [],
      bannedDevices: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      stats: {
        totalBids: 0,
        totalPurchases: 0,
        totalSales: 0,
        rating: 5.0,
        disputes: 0,
        violations: 0
      },
      verification: {
        photoIdUploaded: false,
        addressVerified: false,
        socialSecurityVerified: false,
        phoneVerified: false
      }
    };
    
    marketplaceData.users.push(user);
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// X (Twitter) OAuth Strategy - Temporarily disabled until package is installed
/*
passport.use('twitter', new TwitterStrategy({
  clientID: process.env.X_CLIENT_ID || 'your_x_client_id',
  clientSecret: process.env.X_CLIENT_SECRET || 'your_x_client_secret',
  callbackURL: process.env.NODE_ENV === 'production' 
    ? 'https://new-pacmac.onrender.com/auth/x/callback'
    : 'http://localhost:3000/auth/x/callback',
  scope: ['tweet.read', 'users.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🐦 X OAuth profile:', profile);
    
    // Check if user already exists
    let user = marketplaceData.users.find(u => u.xId === profile.id);
    
    if (user) {
      // Update last login
      user.lastLogin = new Date().toISOString();
      return done(null, user);
    }
    
    // Create new user
    user = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      xId: profile.id,
      email: profile.emails?.[0]?.value || `${profile.username}@x.com`,
      name: profile.displayName,
      username: profile.username,
      profilePicture: profile.photos[0]?.value,
      isVerified: false,
      ageVerified: false,
      identityVerified: false,
      payoutThreshold: 0,
      totalEarnings: 0,
      deviceIds: [],
      bannedDevices: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      stats: {
        totalBids: 0,
        totalPurchases: 0,
        totalSales: 0,
        rating: 5.0,
        disputes: 0,
        violations: 0
      },
      verification: {
        photoIdUploaded: false,
        addressVerified: false,
        socialSecurityVerified: false,
        phoneVerified: false
      }
    };
    
    marketplaceData.users.push(user);
    console.log('✅ New X user created:', user.username);
    return done(null, user);
  } catch (error) {
    console.error('❌ X OAuth error:', error);
    return done(error, null);
  }
}));
*/

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = marketplaceData.users.find(u => u.id === id);
  done(null, user);
});

// Configure SendGrid
// SendGrid API key already set in initialization above

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, error: 'Authentication required' });
}

// Age verification middleware
function requireAgeVerification(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  
  const user = marketplaceData.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  if (!user.ageVerified) {
    return res.status(403).json({ 
      success: false, 
      error: 'Age verification required',
      requiresAgeVerification: true,
      message: 'You must verify your age before placing bids or cashing out. You must be at least 18 years old (21 in some states).'
    });
  }
  
  // Check if user meets minimum age requirement
  if (user.verification && user.verification.birthDate) {
    const age = Math.floor((new Date() - new Date(user.verification.birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
    const state = user.verification.state;
    const minAge = (state === 'AL' || state === 'NE' || state === 'MS') ? 21 : 18;
    
    if (age < minAge) {
      return res.status(403).json({ 
        success: false, 
        error: 'Age requirement not met',
        requiresAgeVerification: true,
        message: `You must be at least ${minAge} years old to use this platform. Current age: ${age}`
      });
    }
  }
  
  next();
}

// Identity verification middleware for payouts
function requireIdentityVerification(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  
  const user = marketplaceData.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  if (!user.identityVerified) {
    return res.status(403).json({ 
      success: false, 
      error: 'Identity verification required',
      requiresIdentityVerification: true,
      message: 'You must complete identity verification before cashing out. This includes photo ID, address, and social security verification.'
    });
  }
  
  next();
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// OAuth Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth-callback.html?error=auth_failed' }),
  (req, res) => {
    // Successful authentication, redirect to auth callback page with user data
    console.log('✅ Google OAuth callback successful, user:', req.user?.email);
    console.log('✅ Session ID:', req.sessionID);
    
    // Create user data object
    const userData = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=3b82f6&color=fff`,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      isAdmin: req.user.email?.endsWith('@pacmacmobile.com') || false
    };
    
    // Encode user data for URL
    const userParam = encodeURIComponent(JSON.stringify(userData));
    
    // Redirect to auth callback page with user data
    res.redirect(`/auth-callback.html?success=true&user=${userParam}`);
  }
);

// Logout route
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
        return res.status(500).json({ success: false, error: 'Session cleanup failed' });
      }
      
      res.clearCookie('connect.sid');
      console.log('✅ User logged out successfully');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// Get current user status
app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: {
        id: req.user.id,
        name: req.user.displayName,
        email: req.user.email,
        provider: req.user.provider
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// X (Twitter) OAuth Routes - Temporarily disabled until package is installed
/*
app.get('/auth/x', passport.authenticate('twitter', {
  scope: ['tweet.read', 'users.read']
}));

app.get('/auth/x/callback', 
  passport.authenticate('twitter', { failureRedirect: '/marketplace?error=auth_failed' }),
  (req, res) => {
    // Successful authentication, redirect to marketplace
    console.log('✅ X OAuth callback successful, user:', req.user?.username);
    console.log('✅ Session ID:', req.sessionID);
    res.redirect('/home.html?auth=success&provider=x');
  }
);
*/

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.redirect('/home.html');
  });
});

// Test endpoint to manually set a session
app.get('/test-session', (req, res) => {
  console.log('🧪 Test session endpoint called');
  console.log('🧪 Session ID:', req.sessionID);
  console.log('🧪 Is authenticated:', req.isAuthenticated());
  
  // Create a test user and set it in the session
  const testUser = {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@pacmacmobile.com',
    profilePicture: 'https://ui-avatars.com/api/?name=Test+User&background=3b82f6&color=fff',
    isVerified: true,
    ageVerified: true,
    identityVerified: false,
    payoutThreshold: 50,
    totalEarnings: 0,
    stats: { itemsListed: 0, itemsSold: 0, itemsBought: 0 },
    verification: { photoId: false, address: false, social: false }
  };
  
  // Add to marketplace data
  marketplaceData.users.push(testUser);
  
  // Set in session
  req.login(testUser, (err) => {
    if (err) {
      console.error('❌ Login error:', err);
      return res.json({ success: false, error: 'Login failed' });
    }
    console.log('✅ Test user logged in successfully');
    res.json({ success: true, message: 'Test session created', user: testUser });
  });
});

app.get('/auth/user', (req, res) => {
  console.log('🔍 Auth user check - isAuthenticated:', req.isAuthenticated());
  console.log('🔍 Session ID:', req.sessionID);
  console.log('🔍 User:', req.user?.email);
  
  if (req.isAuthenticated()) {
    // Don't send sensitive information
    const userInfo = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
      isVerified: req.user.isVerified,
      ageVerified: req.user.ageVerified,
      identityVerified: req.user.identityVerified,
      payoutThreshold: req.user.payoutThreshold,
      totalEarnings: req.user.totalEarnings,
      stats: req.user.stats,
      verification: req.user.verification
    };
    console.log('✅ Returning authenticated user:', userInfo.email);
    res.json({ success: true, user: userInfo });
  } else {
    console.log('❌ User not authenticated');
    res.json({ success: false, user: null });
  }
});

// Admin sync page
app.get('/admin-sync', (req, res) => {
  res.sendFile(__dirname + '/admin-sync.html');
});

// Payment processing endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;

    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment service not available'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    const msg = {
      to,
      from: {
        email: process.env.FROM_EMAIL || 'orders@pacmacmobile.com',
        name: 'PacMac Mobile'
      },
      subject,
      text,
      html
    };

    await sgMail.send(msg);

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Order management endpoint
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customer, total, paymentIntentId } = req.body;
    
    // Generate order ID
    const orderId = `PMM-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    // Store order (in production, this would go to a database)
    const order = {
      id: orderId,
      items,
      customer,
      total,
      paymentIntentId,
      status: 'confirmed',
      createdAt: new Date(),
      estimatedShipping: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    };

    // Send confirmation email
    if (customer.email) {
      const emailHtml = `
        <h2>Order Confirmed - PacMac Mobile</h2>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total:</strong> $${(total / 100).toFixed(2)}</p>
        <p><strong>Estimated Shipping:</strong> ${order.estimatedShipping.toLocaleDateString()}</p>
        <p>We'll send you tracking information once your order ships.</p>
        <p>Questions? Call us at (947) 225-4327 or email info@pacmacmobile.com</p>
      `;

      const emailText = `
        Order Confirmed!\n\n
        Order ID: ${orderId}\n
        Total: $${(total / 100).toFixed(2)}\n
        Estimated Shipping: ${order.estimatedShipping.toLocaleDateString()}\n\n
        We'll send you tracking information once your order ships.\n
        Questions? Call us at (947) 225-4327 or email info@pacmacmobile.com
      `;

      await sgMail.send({
        to: customer.email,
        from: {
          email: process.env.FROM_EMAIL || 'orders@pacmacmobile.com',
          name: 'PacMac Mobile'
        },
        subject: 'Order Confirmed - PacMac Mobile',
        text: emailText,
        html: emailHtml
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Trade-in submission endpoint
app.post('/api/trade-in', async (req, res) => {
  try {
    const { model, condition, quote, customer } = req.body;
    
    const tradeInId = `TIN-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    const tradeIn = {
      id: tradeInId,
      model,
      condition,
      quote,
      customer,
      status: 'submitted',
      createdAt: new Date(),
      estimatedProcessing: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    // Send confirmation email
    if (customer.email) {
      const emailHtml = `
        <h2>Trade-In Submitted - PacMac Mobile</h2>
        <p>Your trade-in has been submitted successfully!</p>
        <p><strong>Trade-In ID:</strong> ${tradeInId}</p>
        <p><strong>Device:</strong> ${model}</p>
        <p><strong>Condition:</strong> ${condition}</p>
        <p><strong>Estimated Value:</strong> $${quote.amount}</p>
        <p><strong>Estimated Processing:</strong> ${tradeIn.estimatedProcessing.toLocaleDateString()}</p>
        <p>We'll contact you within 24 hours with next steps.</p>
        <p>Questions? Call us at (947) 225-4327 or email info@pacmacmobile.com</p>
      `;

      const emailText = `
        Trade-In Submitted!\n\n
        Trade-In ID: ${tradeInId}\n
        Device: ${model}\n
        Condition: ${condition}\n
        Estimated Value: $${quote.amount}\n
        Estimated Processing: ${tradeIn.estimatedProcessing.toLocaleDateString()}\n\n
        We'll contact you within 24 hours with next steps.\n
        Questions? Call us at (947) 225-4327 or email info@pacmacmobile.com
      `;

      await sgMail.send({
        to: customer.email,
        from: {
          email: process.env.FROM_EMAIL || 'orders@pacmacmobile.com',
          name: 'PacMac Mobile'
        },
        subject: 'Trade-In Submitted - PacMac Mobile',
        text: emailText,
        html: emailHtml
      });
    }

    res.json({
      success: true,
      tradeIn
    });
  } catch (error) {
    console.error('Trade-in submission failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Progressive Leasing endpoint
app.post('/api/progressive-leasing', async (req, res) => {
  try {
    const { customer, items, amount } = req.body;
    
    // Simulate Progressive Leasing API call
    const creditScore = Math.random() * 300 + 500; // 500-800 range
    const approved = creditScore > 580 && Math.random() > 0.3; // 70% approval rate
    
    if (approved) {
      const limit = Math.max(amount * 1.2, 150);
      const monthlyPayment = Math.round(limit / 12);
      
      const leaseId = `PL-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      
      const lease = {
        id: leaseId,
        customer,
        items,
        amount,
        limit: Math.round(limit),
        monthlyPayment,
        terms: '12-month lease-to-own',
        status: 'approved',
        createdAt: new Date()
      };

      // Send approval email
      if (customer.email) {
        const emailHtml = `
          <h2>Lease Application Approved - PacMac Mobile</h2>
          <p>Congratulations! Your lease application has been approved.</p>
          <p><strong>Lease ID:</strong> ${leaseId}</p>
          <p><strong>Credit Limit:</strong> $${lease.limit}</p>
          <p><strong>Monthly Payment:</strong> $${lease.monthlyPayment}</p>
          <p><strong>Terms:</strong> ${lease.terms}</p>
          <p>We'll contact you within 24 hours to complete your order.</p>
          <p>Questions? Call us at (947) 225-4327 or email info@pacmacmobile.com</p>
        `;

        const emailText = `
          Lease Application Approved!\n\n
          Lease ID: ${leaseId}\n
          Credit Limit: $${lease.limit}\n
          Monthly Payment: $${lease.monthlyPayment}\n
          Terms: ${lease.terms}\n\n
          We'll contact you within 24 hours to complete your order.\n
          Questions? Call us at (947) 225-4327 or email info@pacmacmobile.com
        `;

        await sgMail.send({
          to: customer.email,
          from: {
            email: process.env.FROM_EMAIL || 'orders@pacmacmobile.com',
            name: 'PacMac Mobile'
          },
          subject: 'Lease Application Approved - PacMac Mobile',
          text: emailText,
          html: emailHtml
        });
      }

      res.json({
        success: true,
        lease
      });
    } else {
      res.json({
        success: false,
        status: 'declined',
        reason: 'Credit score below minimum requirement',
        suggestions: ['Try a smaller amount', 'Add a co-signer', 'Improve credit score']
      });
    }
  } catch (error) {
    console.error('Progressive Leasing failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Nomad Internet endpoint
app.post('/api/nomad-internet', async (req, res) => {
  try {
    const { planId, customer } = req.body;
    
    const orderId = `NOM-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    const order = {
      id: orderId,
      planId,
      customer,
      status: 'submitted',
      createdAt: new Date(),
      estimatedActivation: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };

    // Send confirmation email
    if (customer.email) {
      const emailHtml = `
        <h2>Nomad Internet Order Confirmed - PacMac Mobile</h2>
        <p>Your Nomad Internet order has been placed successfully!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Plan:</strong> ${planId}</p>
        <p><strong>Estimated Activation:</strong> ${order.estimatedActivation.toLocaleDateString()}</p>
        <p>We'll contact you within 24 hours with activation details.</p>
        <p>Questions? Call us at (947) 225-4327 or email info@pacmacmobile.com</p>
      `;

      const emailText = `
        Nomad Internet Order Confirmed!\n\n
        Order ID: ${orderId}\n
        Plan: ${planId}\n
        Estimated Activation: ${order.estimatedActivation.toLocaleDateString()}\n\n
        We'll contact you within 24 hours with activation details.\n
        Questions? Call us at (947) 225-4327 or email info@pacmacmobile.com
      `;

      await sgMail.send({
        to: customer.email,
        from: {
          email: process.env.FROM_EMAIL || 'orders@pacmacmobile.com',
          name: 'PacMac Mobile'
        },
        subject: 'Nomad Internet Order Confirmed - PacMac Mobile',
        text: emailText,
        html: emailHtml
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Nomad Internet order failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// T-Mobile MVNO Activation endpoint
app.post('/api/activate-mvno', async (req, res) => {
  try {
    const { customer, plan, planId } = req.body;
    
    // Generate order ID
    const orderId = `PMM-MVNO-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    // Simulate T-Mobile MVNO activation
    const activationResult = {
      success: true,
      orderId: orderId,
      plan: plan,
      customer: customer,
      simCardNumber: `890141032111185107${Math.random().toString().slice(2, 10)}`,
      activationDate: new Date(),
      estimatedShipping: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    };
    
    res.json(activationResult);
  } catch (error) {
    console.error('MVNO activation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ElevenLabs AI Voice Generation endpoint
app.post('/api/generate-ai-voice', async (req, res) => {
  try {
    const { voiceId, script, personality } = req.body;
    
    // Simulate ElevenLabs API call
    const aiVoiceResult = {
      success: true,
      voiceId: voiceId,
      audioUrl: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      duration: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
      script: script,
      personality: personality
    };
    
    res.json(aiVoiceResult);
  } catch (error) {
    console.error('AI voice generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Scam Call Handling endpoint
app.post('/api/handle-scam-call', async (req, res) => {
  try {
    const { callerNumber, customerNumber, callTime, riskScore } = req.body;
    
    // Simulate scam call handling
    const callHandlingResult = {
      success: true,
      callId: `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      callerNumber: callerNumber,
      customerNumber: customerNumber,
      callTime: callTime,
      riskScore: riskScore,
      action: riskScore > 70 ? 'intercepted' : 'allowed',
      aiPersonaUsed: riskScore > 70 ? 'grandma' : null,
      callDuration: riskScore > 70 ? Math.floor(Math.random() * 300) + 30 : 0
    };
    
    res.json(callHandlingResult);
  } catch (error) {
    console.error('Scam call handling failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// FCC Complaint Submission endpoint
app.post('/api/submit-fcc-complaint', async (req, res) => {
  try {
    const { callerNumber, callRecording, transcription, category, description } = req.body;
    
    // Simulate FCC complaint submission
    const complaintResult = {
      success: true,
      complaintId: `FCC-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
      callerNumber: callerNumber,
      category: category,
      status: 'submitted',
      submissionDate: new Date(),
      estimatedResponse: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    res.json(complaintResult);
  } catch (error) {
    console.error('FCC complaint submission failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Inventory Management API Endpoints
// Get all products
app.get('/api/products', async (req, res) => {
  try {
    // In production, this would fetch from the backend admin portal
    // For now, we'll use the existing PRODUCTS data structure
    const products = [
      {
        id: 'pm-iphone15',
        name: 'iPhone 15',
        price: 975.00,
        tags: ['5G', '128GB', 'A16 Bionic'],
        img: 'products/iPhone-15.jpg',
        description: 'Latest iPhone with USB-C, Dynamic Island, and 48MP camera',
        specs: {
          'Display': '6.1" Super Retina XDR',
          'Chip': 'A16 Bionic',
          'Storage': '128GB',
          'Camera': '48MP Main + 12MP Ultra Wide',
          'Battery': 'Up to 20 hours video playback',
          'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.3',
          'Colors': 'Black, Blue, Green, Yellow, Pink'
        },
        inStock: true,
        stockCount: 15,
        category: 'main'
      },
      {
        id: 'pm-iphone15plus',
        name: 'iPhone 15 Plus',
        price: 1097.00,
        tags: ['5G', '128GB', '6.7" Display'],
        img: 'products/iPhone15Plus.jpg',
        description: 'Larger display with all iPhone 15 features and extended battery life',
        specs: {
          'Display': '6.7" Super Retina XDR',
          'Chip': 'A16 Bionic',
          'Storage': '128GB',
          'Camera': '48MP Main + 12MP Ultra Wide',
          'Battery': 'Up to 26 hours video playback',
          'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.3',
          'Colors': 'Black, Blue, Green, Yellow, Pink'
        },
        inStock: true,
        stockCount: 8,
        category: 'main'
      },
      {
        id: 'pm-ipad-air',
        name: 'iPad Air 11"',
        price: 610.00,
        tags: ['M2 Chip', '11" Display', 'Wi-Fi'],
        img: 'products/iPadAir11.jpg',
        description: 'Powerful iPad with M2 chip and Liquid Retina display',
        specs: {
          'Display': '11" Liquid Retina',
          'Chip': 'M2',
          'Storage': '64GB',
          'Camera': '12MP Wide',
          'Battery': 'Up to 10 hours',
          'Connectivity': 'Wi-Fi 6E, Bluetooth 5.3',
          'Colors': 'Space Gray, Blue, Pink, Purple'
        },
        inStock: true,
        stockCount: 12,
        category: 'main'
      },
      {
        id: 'pm-samsung-s25',
        name: 'Samsung Galaxy S25',
        price: 800.00,
        tags: ['5G', '128GB', 'Snapdragon 8 Gen 4'],
        img: 'products/SamS25.jpg',
        description: 'Latest Samsung flagship with AI-powered features',
        specs: {
          'Display': '6.2" Dynamic AMOLED 2X',
          'Chip': 'Snapdragon 8 Gen 4',
          'Storage': '128GB',
          'Camera': '50MP Main + 12MP Ultra Wide',
          'Battery': '4000mAh',
          'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.4',
          'Colors': 'Black, White, Purple'
        },
        inStock: true,
        stockCount: 6,
        category: 'main'
      },
      {
        id: 'pm-samsung-s25-plus',
        name: 'Samsung Galaxy S25 Plus',
        price: 1000.00,
        tags: ['5G', '256GB', '6.7" Display'],
        img: 'products/SamS25Plus.jpg',
        description: 'Larger Samsung flagship with enhanced features',
        specs: {
          'Display': '6.7" Dynamic AMOLED 2X',
          'Chip': 'Snapdragon 8 Gen 4',
          'Storage': '256GB',
          'Camera': '50MP Main + 12MP Ultra Wide + 10MP Telephoto',
          'Battery': '4900mAh',
          'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.4',
          'Colors': 'Black, White, Purple'
        },
        inStock: true,
        stockCount: 4,
        category: 'main'
      },
      {
        id: 'pm-samsung-s25-ultra',
        name: 'Samsung Galaxy S25 Ultra',
        price: 1200.00,
        tags: ['5G', '512GB', 'S Pen', '6.8" Display'],
        img: 'products/SamS25Ultra.jpg',
        description: 'Ultimate Samsung flagship with S Pen and premium features',
        specs: {
          'Display': '6.8" Dynamic AMOLED 2X',
          'Chip': 'Snapdragon 8 Gen 4',
          'Storage': '512GB',
          'Camera': '200MP Main + 50MP Periscope + 12MP Ultra Wide',
          'Battery': '5000mAh',
          'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.4',
          'Colors': 'Titanium Black, Titanium Gray, Titanium Violet'
        },
        inStock: true,
        stockCount: 3,
        category: 'main'
      },
      {
        id: 'pm-apple-watch-10',
        name: 'Apple Watch Series 10',
        price: 400.00,
        tags: ['GPS', '45mm', 'Aluminum'],
        img: 'products/AppleWatch10.jpg',
        description: 'Latest Apple Watch with advanced health features',
        specs: {
          'Display': '45mm Always-On Retina',
          'Chip': 'S10',
          'Storage': '32GB',
          'Sensors': 'Heart Rate, ECG, Blood Oxygen, Temperature',
          'Battery': 'Up to 18 hours',
          'Connectivity': 'GPS, Wi-Fi, Bluetooth 5.3',
          'Colors': 'Midnight, Starlight, Pink, Blue'
        },
        inStock: true,
        stockCount: 20,
        category: 'accessory'
      }
    ];

    res.json({
      success: true,
      products: products,
      total: products.length
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // In production, this would fetch from the backend admin portal
    // For now, we'll simulate finding a product
    const products = [
      {
        id: 'pm-iphone15',
        name: 'iPhone 15',
        price: 975.00,
        tags: ['5G', '128GB', 'A16 Bionic'],
        img: 'products/iPhone-15.jpg',
        description: 'Latest iPhone with USB-C, Dynamic Island, and 48MP camera',
        specs: {
          'Display': '6.1" Super Retina XDR',
          'Chip': 'A16 Bionic',
          'Storage': '128GB',
          'Camera': '48MP Main + 12MP Ultra Wide',
          'Battery': 'Up to 20 hours video playback',
          'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.3',
          'Colors': 'Black, Blue, Green, Yellow, Pink'
        },
        inStock: true,
        stockCount: 15,
        category: 'main'
      }
    ];
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product: product
    });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

// Create a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, brand, model, price, description, imageUrl, specs, inStock, stockCount, category } = req.body;
    
    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name and price are required'
      });
    }
    
    // Generate unique ID
    const productId = `pm-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
    
    // Create product object
    const newProduct = {
      id: productId,
      name: name,
      brand: brand || 'Unknown',
      model: model || name,
      price: parseFloat(price),
      description: description || '',
      imageUrl: imageUrl || 'products/placeholder.jpg',
      specs: specs || {},
      inStock: inStock !== undefined ? inStock : true,
      stockCount: parseInt(stockCount) || 0,
      category: category || 'main',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In production, this would save to the backend admin portal database
    console.log('Creating new product:', newProduct);
    
    res.status(201).json({
      success: true,
      product: newProduct,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    // In production, this would update the backend admin portal database
    console.log(`Updating product ${productId}:`, updateData);
    
    // Simulate successful update
    const updatedProduct = {
      id: productId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // In production, this would delete from the backend admin portal database
    console.log(`Deleting product ${productId}`);
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      productId: productId
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

// Update product stock (for order processing)
app.put('/api/products/:id/stock', async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;
    
    // In production, this would update the backend admin portal database
    console.log(`Updating stock for product ${productId}: ${quantity} units`);
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      productId: productId,
      newStock: quantity
    });
  } catch (error) {
    console.error('Failed to update stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock'
    });
  }
});

// Sync with backend admin portal
app.post('/api/sync-inventory', async (req, res) => {
  try {
    // In production, this would sync with the backend admin portal
    // For now, we'll simulate a successful sync
    console.log('Syncing inventory with backend admin portal...');
    
    res.json({
      success: true,
      message: 'Inventory synced successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to sync inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync inventory'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.28'
  });
});

// Test endpoint to verify deployment
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    version: '1.0.26'
  });
});

// Persistent auction timer system
const auctionEndTimes = new Map();

// Initialize persistent auction timers
function initializeAuctionTimers() {
  console.log('🔄 Initializing persistent auction timers...');
  
  // Default auction end times (24 hours from now)
  const defaultEndTimes = {
    'item_1': Date.now() + (24 * 60 * 60 * 1000),
    'item_2': Date.now() + (24 * 60 * 60 * 1000),
    'item_3': Date.now() + (24 * 60 * 60 * 1000),
    'item_4': Date.now() + (24 * 60 * 60 * 1000),
    'item_5': Date.now() + (24 * 60 * 60 * 1000),
    'item_6': Date.now() + (24 * 60 * 60 * 1000),
    'item_7': Date.now() + (24 * 60 * 60 * 1000),
    'item_8': Date.now() + (24 * 60 * 60 * 1000),
    'item_9': Date.now() + (24 * 60 * 60 * 1000) // Demo item
  };
  
  // Load existing end times or use defaults
  Object.entries(defaultEndTimes).forEach(([itemId, endTime]) => {
    auctionEndTimes.set(itemId, endTime);
    console.log(`⏰ Item ${itemId} auction ends at: ${new Date(endTime).toLocaleString()}`);
  });
}

// Get auction end time for an item
function getAuctionEndTime(itemId) {
  return auctionEndTimes.get(`item_${itemId}`) || (Date.now() + 24 * 60 * 60 * 1000);
}

// Set auction end time for an item
function setAuctionEndTime(itemId, endTime) {
  auctionEndTimes.set(`item_${itemId}`, endTime);
  console.log(`⏰ Updated auction end time for item ${itemId}: ${new Date(endTime).toLocaleString()}`);
}

// Initialize timers on server start
initializeAuctionTimers();

// API endpoint to get auction end times
app.get('/api/auction/timers', (req, res) => {
  try {
    const timers = {};
    auctionEndTimes.forEach((endTime, itemId) => {
      const itemNumber = itemId.replace('item_', '');
      timers[itemNumber] = {
        endTime: endTime,
        timeLeft: Math.max(0, endTime - Date.now()),
        isActive: endTime > Date.now()
      };
    });
    
    res.json({
      success: true,
      timers: timers,
      serverTime: Date.now()
    });
  } catch (error) {
    console.error('Error getting auction timers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to update auction end time
app.post('/api/auction/timer/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const { endTime } = req.body;
    
    if (!endTime) {
      return res.status(400).json({
        success: false,
        error: 'End time is required'
      });
    }
    
    setAuctionEndTime(itemId, parseInt(endTime));
    
    res.json({
      success: true,
      itemId: itemId,
      endTime: endTime,
      message: `Auction timer updated for item ${itemId}`
    });
  } catch (error) {
    console.error('Error updating auction timer:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stripe payment intent endpoint
app.post('/api/stripe/create-payment-intent', (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;

    // Validate amount
    if (!amount || amount < 5) { // Minimum $0.05 for demo items
      return res.status(400).json({
        error: 'Invalid amount. Minimum charge is $0.05.'
      });
    }

    // For demo purposes, create a mock payment intent
    const mockPaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      status: 'requires_payment_method',
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        source: 'pacmac-mobile',
      }
    };

    res.json({
      clientSecret: mockPaymentIntent.client_secret,
      paymentIntentId: mockPaymentIntent.id,
      amount: mockPaymentIntent.amount,
      currency: mockPaymentIntent.currency,
      status: mockPaymentIntent.status
    });

  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent'
    });
  }
});

// Create Stripe Checkout Session
app.post('/api/stripe/create-checkout-session', (req, res) => {
  try {
    const { items, success_url, cancel_url, metadata = {} } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Items are required for checkout session'
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.amount || 0);
    }, 0);

    if (totalAmount < 5) { // Minimum $0.05 for demo items
      return res.status(400).json({
        error: 'Invalid amount. Minimum charge is $0.05.'
      });
    }

    // Create mock checkout session
    const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockCheckoutSession = {
      id: sessionId,
      url: `${req.protocol}://${req.get('host')}/stripe-checkout?session_id=${sessionId}`,
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

    res.json({
      sessionId: mockCheckoutSession.id,
      checkoutUrl: mockCheckoutSession.url,
      amount: mockCheckoutSession.amount_total,
      currency: mockCheckoutSession.currency,
      status: mockCheckoutSession.status
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session'
    });
  }
});

// Stripe webhook endpoint
app.post('/api/stripe/webhook', (req, res) => {
  // Mock webhook for demo purposes
  res.json({
    success: true,
    message: 'Webhook received',
    timestamp: new Date().toISOString()
  });
});

// Bidding timer endpoints
app.get('/api/bidding/timer', (req, res) => {
  res.json({
    success: true,
    timers: {},
    serverTime: Date.now(),
    message: 'Bidding timer system active'
  });
});

app.get('/api/bidding/timer/:itemId', (req, res) => {
  const { itemId } = req.params;
  res.json({
    success: true,
    itemId,
    timeLeft: 0,
    isActive: false,
    serverTime: Date.now(),
    message: `Timer for item ${itemId} not found`
  });
});

app.post('/api/bidding/start/:itemId', (req, res) => {
  const { itemId } = req.params;
  const { duration = 24 * 60 * 60 * 1000 } = req.body; // Default 24 hours
  
  res.json({
    success: true,
    itemId,
    endTime: Date.now() + duration,
    duration,
    message: `Bidding timer started for item ${itemId}`
  });
});

// Simple health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.25',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================================
// VERIFICATION & SAFETY ENDPOINTS
// ============================================================================

// Age verification
app.post('/api/verify/age', requireAuth, (req, res) => {
  try {
    const { birthDate, state } = req.body;
    
    if (!birthDate) {
      return res.status(400).json({
        success: false,
        error: 'Birth date is required'
      });
    }
    
    const age = Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
    const minAge = (state === 'AL' || state === 'NE' || state === 'MS') ? 21 : 18;
    
    if (age < minAge) {
      return res.status(400).json({
        success: false,
        error: `You must be at least ${minAge} years old to use this platform`
      });
    }
    
    // Update user age verification
    const user = marketplaceData.users.find(u => u.id === req.user.id);
    if (user) {
      user.ageVerified = true;
      user.verification.birthDate = birthDate;
      user.verification.state = state;
    }
    
    res.json({
      success: true,
      message: 'Age verification successful',
      age: age
    });
  } catch (error) {
    console.error('Error verifying age:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Photo ID upload
app.post('/api/verify/photo-id', requireAuth, (req, res) => {
  try {
    const { imageData, idType, idNumber } = req.body;
    
    if (!imageData || !idType || !idNumber) {
      return res.status(400).json({
        success: false,
        error: 'Image data, ID type, and ID number are required'
      });
    }
    
    // In production, you would:
    // 1. Save the image to secure storage
    // 2. Use OCR to extract information
    // 3. Verify with third-party service
    // 4. Store encrypted data
    
    const user = marketplaceData.users.find(u => u.id === req.user.id);
    if (user) {
      user.verification.photoIdUploaded = true;
      user.verification.idType = idType;
      user.verification.idNumber = idNumber; // In production, encrypt this
      user.verification.photoIdUploadedAt = new Date().toISOString();
    }
    
    res.json({
      success: true,
      message: 'Photo ID uploaded successfully. Verification pending.'
    });
  } catch (error) {
    console.error('Error uploading photo ID:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Address verification
app.post('/api/verify/address', requireAuth, (req, res) => {
  try {
    const { address, city, state, zipCode } = req.body;
    
    if (!address || !city || !state || !zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Complete address information is required'
      });
    }
    
    // In production, verify with USPS API or similar service
    const user = marketplaceData.users.find(u => u.id === req.user.id);
    if (user) {
      user.verification.addressVerified = true;
      user.verification.address = { address, city, state, zipCode };
      user.verification.addressVerifiedAt = new Date().toISOString();
    }
    
    res.json({
      success: true,
      message: 'Address verification successful'
    });
  } catch (error) {
    console.error('Error verifying address:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Social Security verification (last 4 digits)
app.post('/api/verify/social', requireAuth, (req, res) => {
  try {
    const { lastFour } = req.body;
    
    if (!lastFour || lastFour.length !== 4 || !/^\d{4}$/.test(lastFour)) {
      return res.status(400).json({
        success: false,
        error: 'Last 4 digits of Social Security Number are required'
      });
    }
    
    // In production, verify with third-party service
    const user = marketplaceData.users.find(u => u.id === req.user.id);
    if (user) {
      user.verification.socialSecurityVerified = true;
      user.verification.socialLastFour = lastFour; // In production, encrypt this
      user.verification.socialVerifiedAt = new Date().toISOString();
      
      // Check if all verification is complete
      if (user.verification.photoIdUploaded && 
          user.verification.addressVerified && 
          user.verification.socialSecurityVerified) {
        user.identityVerified = true;
        user.isVerified = true;
      }
    }
    
    res.json({
      success: true,
      message: 'Social Security verification successful'
    });
  } catch (error) {
    console.error('Error verifying social security:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Device tracking
app.post('/api/device/register', requireAuth, (req, res) => {
  try {
    const { deviceId, imei, serialNumber, phoneNumber, userAgent, platform } = req.body;
    
    const user = marketplaceData.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if device is banned
    const isBanned = marketplaceData.bannedDevices.some(device => 
      device.deviceId === deviceId || 
      device.imei === imei || 
      device.serialNumber === serialNumber
    );
    
    if (isBanned) {
      return res.status(403).json({
        success: false,
        error: 'This device has been permanently banned from the platform'
      });
    }
    
    // Register device
    const deviceInfo = {
      deviceId,
      imei,
      serialNumber,
      phoneNumber,
      userAgent,
      platform,
      registeredAt: new Date().toISOString(),
      userId: req.user.id
    };
    
    // Add to user's device list if not already present
    const existingDevice = user.deviceIds.find(d => d.deviceId === deviceId);
    if (!existingDevice) {
      user.deviceIds.push(deviceInfo);
    }
    
    res.json({
      success: true,
      message: 'Device registered successfully'
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Content moderation - check for prohibited items
app.post('/api/moderate/content', requireAuth, (req, res) => {
  try {
    const { title, description, category, images } = req.body;
    
    const prohibitedKeywords = [
      'pet', 'pets', 'animal', 'animals', 'dog', 'cat', 'bird', 'fish', 'hamster',
      'living', 'alive', 'breed', 'puppy', 'kitten', 'livestock', 'cattle',
      'horse', 'pony', 'reptile', 'snake', 'lizard', 'turtle', 'rabbit'
    ];
    
    const content = `${title} ${description} ${category}`.toLowerCase();
    const hasProhibitedContent = prohibitedKeywords.some(keyword => 
      content.includes(keyword)
    );
    
    if (hasProhibitedContent) {
      // Log violation
      const user = marketplaceData.users.find(u => u.id === req.user.id);
      if (user) {
        user.stats.violations++;
      }
      
      return res.status(400).json({
        success: false,
        error: 'Prohibited content detected. No pets, animals, or living things are allowed on the platform.',
        violation: true
      });
    }
    
    res.json({
      success: true,
      message: 'Content approved'
    });
  } catch (error) {
    console.error('Error moderating content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Payout threshold check
app.get('/api/payout/status', requireAuth, (req, res) => {
  try {
    const user = marketplaceData.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const canPayout = user.totalEarnings >= 50 && user.identityVerified;
    
    res.json({
      success: true,
      canPayout: canPayout,
      totalEarnings: user.totalEarnings,
      threshold: 50,
      remaining: Math.max(0, 50 - user.totalEarnings),
      identityVerified: user.identityVerified,
      ageVerified: user.ageVerified,
      verificationStatus: {
        ageVerified: user.ageVerified,
        identityVerified: user.identityVerified,
        photoIdUploaded: user.verification?.photoIdUploaded || false,
        addressVerified: user.verification?.addressVerified || false,
        socialSecurityVerified: user.verification?.socialSecurityVerified || false
      }
    });
  } catch (error) {
    console.error('Error checking payout status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Request payout
app.post('/api/payout/request', requireIdentityVerification, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid payout amount is required'
      });
    }
    
    const user = marketplaceData.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user has enough earnings
    if (user.totalEarnings < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient earnings for payout'
      });
    }
    
    // Check minimum payout threshold
    if (amount < 50) {
      return res.status(400).json({
        success: false,
        error: 'Minimum payout amount is $50'
      });
    }
    
    // Create payout request
    const payoutRequest = {
      id: 'payout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'bank_transfer',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      estimatedProcessing: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
    };
    
    // In production, this would be stored in a database
    if (!marketplaceData.payoutRequests) {
      marketplaceData.payoutRequests = [];
    }
    marketplaceData.payoutRequests.push(payoutRequest);
    
    // Update user earnings (in production, this would be handled by the payment processor)
    user.totalEarnings -= amount;
    user.pendingPayouts = (user.pendingPayouts || 0) + amount;
    
    console.log(`✅ Payout requested: $${amount} for user ${user.name}`);
    
    res.json({
      success: true,
      payoutRequest: payoutRequest,
      message: 'Payout request submitted successfully. Processing time: 3-5 business days.',
      remainingEarnings: user.totalEarnings
    });
    
  } catch (error) {
    console.error('Error processing payout request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's payout history
app.get('/api/payout/history', requireAuth, (req, res) => {
  try {
    const user = marketplaceData.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const userPayouts = marketplaceData.payoutRequests ? 
      marketplaceData.payoutRequests.filter(p => p.userId === user.id) : [];
    
    res.json({
      success: true,
      payouts: userPayouts,
      totalEarnings: user.totalEarnings,
      pendingPayouts: user.pendingPayouts || 0
    });
  } catch (error) {
    console.error('Error fetching payout history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// MARKETPLACE API ENDPOINTS
// ============================================================================

// In-memory storage for marketplace data (in production, use a database)
const marketplaceData = {
  items: [],
  transactions: [],
  users: [],
  chats: [],
  bannedDevices: [],
  payoutRequests: [],
  analytics: {
    userBehavior: [],
    purchaseHistory: [],
    searchHistory: [],
    deviceAnalytics: []
  }
};

// Marketplace routes
app.get('/marketplace', (req, res) => {
  res.sendFile(__dirname + '/marketplace.html');
});

// Get items near location
app.get('/api/marketplace/items', (req, res) => {
  try {
    const { location, category, limit = 20 } = req.query;
    
    let items = marketplaceData.items.filter(item => {
      // Filter by location if provided
      if (location && !item.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }
      
      // Filter by category if provided
      if (category && item.category !== category) {
        return false;
      }
      
      return true;
    });
    
    // Sort by newest first
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Limit results
    items = items.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      items: items,
      total: items.length
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new item listing
app.post('/api/marketplace/items', requireAuth, async (req, res) => {
  try {
    const { title, description, price, category, location, sellerId, sellerName } = req.body;
    
    if (!title || !description || !price || !category || !sellerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Content moderation check
    const moderationResponse = await fetch('http://localhost:3000/api/moderate/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie // Forward session cookie
      },
      body: JSON.stringify({ title, description, category })
    });
    
    const moderationResult = await moderationResponse.json();
    if (!moderationResult.success) {
      return res.status(400).json({
        success: false,
        error: moderationResult.error,
        violation: moderationResult.violation
      });
    }
    
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      price: parseFloat(price),
      category,
      location: location || 'Unknown',
      distance: '0.0 miles',
      image: '📦', // Default image, in production would handle file uploads
      seller: {
        id: sellerId,
        name: sellerName || 'Anonymous',
        rating: 5.0
      },
      bids: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    marketplaceData.items.push(newItem);
    
    res.json({
      success: true,
      item: newItem
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Place bid on item (Auction-style - no payment required until winning)
app.post('/api/marketplace/bid', requireAgeVerification, async (req, res) => {
  try {
    const { itemId, bidderId, bidderName, amount } = req.body;
    
    if (!itemId || !bidderId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: itemId, bidderId, amount'
      });
    }
    
    const item = marketplaceData.items.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    // Check if auction is still active
    if (item.auctionEndTime && new Date() > new Date(item.auctionEndTime)) {
      return res.status(400).json({
        success: false,
        error: 'Auction has ended'
      });
    }
    
    // Check if bid amount is higher than current highest bid
    const currentHighestBid = item.bids.length > 0 ? Math.max(...item.bids.map(b => b.amount)) : 0;
    if (amount <= currentHighestBid) {
      return res.status(400).json({
        success: false,
        error: `Bid must be higher than current highest bid of $${currentHighestBid}`
      });
    }
    
    // Check if bid meets reserve price (if set)
    if (item.reservePrice && amount < item.reservePrice) {
      return res.status(400).json({
        success: false,
        error: `Bid must be at least $${item.reservePrice} to meet the reserve price`,
        reservePrice: item.reservePrice
      });
    }
    
    // Create bid record (no payment required yet)
    const bid = {
      id: 'bid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      bidderId: bidderId,
      bidderName: bidderName || 'Anonymous',
      amount: parseFloat(amount),
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    // Add bid to item
    item.bids.push(bid);
    
    // Update item with current highest bid
    item.currentHighestBid = amount;
    item.currentHighestBidder = bidderId;
    item.currentHighestBidderName = bidderName || 'Anonymous';
    
    // If this is the first bid, set auction end time (24 hours from now)
    if (item.bids.length === 1) {
      item.auctionEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      item.auctionStatus = 'active';
    }
    
    // Extend auction by 5 minutes if bid is placed in last 5 minutes
    if (item.auctionEndTime) {
      const timeLeft = new Date(item.auctionEndTime) - new Date();
      if (timeLeft <= 5 * 60 * 1000) { // 5 minutes
        item.auctionEndTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      }
    }
    
    console.log(`✅ Bid placed: $${amount} on ${item.title} by ${bidderName}`);
    
    res.json({
      success: true,
      bid: bid,
      item: {
        id: item.id,
        title: item.title,
        currentHighestBid: item.currentHighestBid,
        currentHighestBidder: item.currentHighestBidderName,
        auctionEndTime: item.auctionEndTime,
        bidsCount: item.bids.length
      },
      message: 'Bid placed successfully!'
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process auction completion and create payment for winning bidder
app.post('/api/marketplace/process-auction', async (req, res) => {
  try {
    const { itemId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'Item ID is required'
      });
    }
    
    const item = marketplaceData.items.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    // Check if auction has ended
    if (!item.auctionEndTime || new Date() < new Date(item.auctionEndTime)) {
      return res.status(400).json({
        success: false,
        error: 'Auction has not ended yet'
      });
    }
    
    // Check if auction is already processed
    if (item.auctionStatus === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Auction already processed'
      });
    }
    
    // Find winning bid
    if (item.bids.length === 0) {
      item.auctionStatus = 'no_bids';
      return res.json({
        success: true,
        message: 'Auction ended with no bids',
        auctionStatus: 'no_bids'
      });
    }
    
    const winningBid = item.bids.reduce((highest, bid) => 
      bid.amount > highest.amount ? bid : highest
    );
    
    // Check if winning bid meets reserve price
    if (item.reservePrice && winningBid.amount < item.reservePrice) {
      item.auctionStatus = 'reserve_not_met';
      return res.json({
        success: true,
        message: `Auction ended but reserve price of $${item.reservePrice} not met. Highest bid was $${winningBid.amount}`,
        auctionStatus: 'reserve_not_met',
        reservePrice: item.reservePrice,
        highestBid: winningBid.amount
      });
    }
    
    // Create payment intent for winning bidder
    const flatFee = 3.00; // $3 flat fee
    const percentageFee = winningBid.amount * 0.03; // 3% of bid amount
    const totalFee = flatFee + percentageFee;
    const totalAmount = Math.round((winningBid.amount + totalFee) * 100); // Convert to cents
    
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment service not available'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      description: `Winning bid on ${item.title}`,
      metadata: {
        type: 'auction_win',
        itemId: itemId,
        bidderId: winningBid.bidderId,
        bidAmount: winningBid.amount.toString(),
        flatFee: flatFee.toString(),
        percentageFee: percentageFee.toString(),
        totalFee: totalFee.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Create transaction record for winning bid
    const transaction = {
      id: 'auction_txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: 'auction_win',
      itemId: itemId,
      itemTitle: item.title,
      buyerId: winningBid.bidderId,
      buyerName: winningBid.bidderName,
      sellerId: item.seller.id,
      sellerName: item.seller.name,
      amount: winningBid.amount,
      flatFee: flatFee,
      percentageFee: percentageFee,
      totalFee: totalFee,
      totalAmount: winningBid.amount + totalFee,
      status: 'pending_payment',
      paymentIntentId: paymentIntent.id,
      createdAt: new Date().toISOString(),
      countdownEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours to pay
      chatEnabled: true,
      meetupEnabled: true,
      auctionEndTime: item.auctionEndTime,
      winningBidId: winningBid.id
    };
    
    marketplaceData.transactions.push(transaction);
    
    // Update item status
    item.auctionStatus = 'completed';
    item.winningBidId = winningBid.id;
    item.winningTransactionId = transaction.id;
    item.status = 'sold';
    item.soldTo = winningBid.bidderId;
    item.soldAt = new Date().toISOString();
    
    console.log(`✅ Auction completed: ${item.title} won by ${winningBid.bidderName} for $${winningBid.amount} - v1.0.7`);
    
    res.json({
      success: true,
      transaction: transaction,
      clientSecret: paymentIntent.client_secret,
      winningBid: winningBid,
      message: 'Auction completed! Winner has 24 hours to pay.',
      paymentDeadline: transaction.countdownEnd
    });
    
  } catch (error) {
    console.error('Error processing auction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Set reserve price for an item (Admin only)
app.post('/api/marketplace/set-reserve', requireAuth, async (req, res) => {
  try {
    const { itemId, reservePrice } = req.body;
    const user = req.user;
    
    // Check if user is admin
    if (!user.isAdmin && !(user.email && (user.email.endsWith('@pacmacmobile.com') || user.email === 'pacmacmobile@gmail.com'))) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    if (!itemId || reservePrice === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Item ID and reserve price are required'
      });
    }
    
    const item = marketplaceData.items.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    // Check if auction has already started
    if (item.auctionStatus === 'active' || item.bids.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot set reserve price after auction has started'
      });
    }
    
    item.reservePrice = parseFloat(reservePrice);
    item.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: `Reserve price set to $${item.reservePrice}`,
      item: {
        id: item.id,
        title: item.title,
        reservePrice: item.reservePrice
      }
    });
  } catch (error) {
    console.error('Error setting reserve price:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get auction status for an item
app.get('/api/marketplace/auction/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = marketplaceData.items.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    const now = new Date();
    const auctionEndTime = item.auctionEndTime ? new Date(item.auctionEndTime) : null;
    const timeLeft = auctionEndTime ? auctionEndTime - now : 0;
    
    res.json({
      success: true,
      auction: {
        itemId: item.id,
        title: item.title,
        currentHighestBid: item.currentHighestBid || 0,
        currentHighestBidder: item.currentHighestBidderName || null,
        auctionEndTime: item.auctionEndTime,
        timeLeft: Math.max(0, timeLeft),
        isActive: timeLeft > 0,
        bidsCount: item.bids.length,
        auctionStatus: item.auctionStatus || 'not_started',
        reservePrice: item.reservePrice || null,
        reserveMet: item.reservePrice ? (item.currentHighestBid || 0) >= item.reservePrice : true,
        bids: item.bids.map(bid => ({
          id: bid.id,
          bidderName: bid.bidderName,
          amount: bid.amount,
          createdAt: bid.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error getting auction status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Demo purchase endpoint (no auth required for testing)
app.post('/api/marketplace/demo-purchase', async (req, res) => {
  try {
    const { itemId, buyerId, buyerName, amount = 1.00 } = req.body;
    
    if (!itemId || !buyerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Create a demo item if it doesn't exist
    let item = marketplaceData.items.find(i => i.id === itemId);
    if (!item) {
      item = {
        id: itemId,
        title: 'iPhone 15 Pro',
        description: 'Demo iPhone for testing',
        price: amount,
        category: 'Electronics',
        sellerId: 'demo-seller',
        sellerName: 'Demo Seller',
        location: 'Demo Location',
        images: ['demo-image.jpg'],
        status: 'available'
      };
      marketplaceData.items.push(item);
    }
    
    // Create demo transaction (no real Stripe payment)
    const transaction = {
      id: 'demo-tx-' + Date.now(),
      itemId: itemId,
      buyerId: buyerId,
      buyerName: buyerName,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      amount: amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentIntentId: 'demo_pi_' + Date.now(),
      chatMessages: []
    };
    
    marketplaceData.transactions.push(transaction);
    
    console.log('✅ Demo purchase created:', transaction.id);
    
    res.json({
      success: true,
      transaction: transaction,
      message: 'Demo purchase successful!'
    });
    
  } catch (error) {
    console.error('❌ Demo purchase error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Purchase item (heart action)
app.post('/api/marketplace/purchase', requireAuth, async (req, res) => {
  try {
    const { itemId, buyerId, buyerName, amount = 1.00 } = req.body;
    
    if (!itemId || !buyerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const item = marketplaceData.items.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    
    // Create escrow payment intent for purchase amount + $3 flat fee + 3% fee
    const flatFee = 3.00; // $3 flat fee
    const percentageFee = amount * 0.03; // 3% of purchase amount
    const totalFee = flatFee + percentageFee;
    const totalAmount = Math.round((amount + totalFee) * 100); // Convert to cents
    
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment service not available'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      description: `Purchase ${item.title}`,
      metadata: {
        type: 'marketplace_purchase',
        itemId: itemId,
        buyerId: buyerId,
        purchaseAmount: amount.toString(),
        flatFee: flatFee.toString(),
        percentageFee: percentageFee.toString(),
        totalFee: totalFee.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Create transaction record
    const transaction = {
      id: 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: 'purchase',
      itemId: itemId,
      itemTitle: item.title,
      buyerId: buyerId,
      buyerName: buyerName || 'Anonymous',
      sellerId: item.seller.id,
      sellerName: item.seller.name,
      amount: amount,
      flatFee: flatFee,
      percentageFee: percentageFee,
      totalFee: totalFee,
      totalAmount: amount + totalFee,
      status: 'pending_payment',
      paymentIntentId: paymentIntent.id,
      createdAt: new Date().toISOString(),
      countdownEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      chatEnabled: true,
      meetupEnabled: true
    };
    
    marketplaceData.transactions.push(transaction);
    
    // Mark item as sold
    item.status = 'sold';
    item.soldTo = buyerId;
    item.soldAt = new Date().toISOString();
    
    res.json({
      success: true,
      transaction: transaction,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Confirm payment and release escrow
app.post('/api/marketplace/confirm-payment', async (req, res) => {
  try {
    const { transactionId, paymentIntentId } = req.body;
    
    if (!transactionId || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const transaction = marketplaceData.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Verify payment intent with Stripe
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: 'Payment service not available'
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }
    
    // Update transaction status
    transaction.status = 'paid';
    transaction.paidAt = new Date().toISOString();
    
    // Determine fund holding period based on user transaction history
    const userTransactions = marketplaceData.transactions.filter(t => 
      (t.buyerId === transaction.buyerId || t.bidderId === transaction.buyerId) && 
      t.status === 'paid'
    );
    
    const isFirstFiveTransactions = userTransactions.length <= 5;
    const holdPeriod = isFirstFiveTransactions ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000; // 24 hours or 15 minutes
    
    transaction.fundReleaseAt = new Date(Date.now() + holdPeriod).toISOString();
    
    res.json({
      success: true,
      transaction: transaction,
      fundReleaseAt: transaction.fundReleaseAt,
      holdPeriod: isFirstFiveTransactions ? '24 hours' : '15 minutes'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user transactions
app.get('/api/marketplace/transactions/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const userTransactions = marketplaceData.transactions.filter(t => 
      t.buyerId === userId || t.bidderId === userId || t.sellerId === userId
    );
    
    res.json({
      success: true,
      transactions: userTransactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Chat endpoints
app.get('/api/marketplace/chat/:transactionId', (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const messages = marketplaceData.chats.filter(c => c.transactionId === transactionId);
    
    res.json({
      success: true,
      messages: messages
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/marketplace/chat', (req, res) => {
  try {
    const { transactionId, senderId, senderName, message } = req.body;
    
    if (!transactionId || !senderId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const chatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      transactionId: transactionId,
      senderId: senderId,
      senderName: senderName || 'Anonymous',
      message: message,
      createdAt: new Date().toISOString()
    };
    
    marketplaceData.chats.push(chatMessage);
    
    res.json({
      success: true,
      message: chatMessage
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Proximity completion endpoint
app.post('/api/marketplace/proximity-check', (req, res) => {
  try {
    const { transactionId, buyerLocation, sellerLocation, threshold = 50 } = req.body;
    
    if (!transactionId || !buyerLocation || !sellerLocation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: transactionId, buyerLocation, sellerLocation'
      });
    }
    
    // Find the transaction
    const transaction = marketplaceData.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      buyerLocation.lat, buyerLocation.lng,
      sellerLocation.lat, sellerLocation.lng
    );
    
    const isInProximity = distance <= threshold; // threshold in meters
    
    // If in proximity and payment is complete, mark transaction as ready for completion
    if (isInProximity && transaction.status === 'paid') {
      transaction.status = 'in_proximity';
      transaction.proximityDetectedAt = new Date().toISOString();
      transaction.distance = distance;
      
      // Start countdown for transaction completion (5 minutes)
      const completionDeadline = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      transaction.completionDeadline = completionDeadline;
    }
    
    res.json({
      success: true,
      inProximity: isInProximity,
      distance: Math.round(distance),
      threshold: threshold,
      canComplete: isInProximity && transaction.status === 'paid',
      transaction: transaction
    });
  } catch (error) {
    console.error('Error checking proximity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Complete transaction endpoint (when both parties confirm)
app.post('/api/marketplace/complete-transaction', (req, res) => {
  try {
    const { transactionId, completedBy, confirmationCode } = req.body;
    
    if (!transactionId || !completedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const transaction = marketplaceData.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Check if transaction is in valid state for completion
    if (transaction.status !== 'in_proximity' && transaction.status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Transaction not ready for completion'
      });
    }
    
    // Track completion confirmations
    if (!transaction.completionConfirmations) {
      transaction.completionConfirmations = [];
    }
    
    // Add confirmation if not already confirmed by this user
    const existingConfirmation = transaction.completionConfirmations.find(c => c.userId === completedBy);
    if (!existingConfirmation) {
      transaction.completionConfirmations.push({
        userId: completedBy,
        confirmedAt: new Date().toISOString(),
        confirmationCode: confirmationCode
      });
    }
    
    // Check if both parties have confirmed
    const buyerConfirmed = transaction.completionConfirmations.some(c => c.userId === transaction.buyerId);
    const sellerConfirmed = transaction.completionConfirmations.some(c => c.userId === transaction.sellerId);
    
    if (buyerConfirmed && sellerConfirmed) {
      // Complete the transaction
      transaction.status = 'completed';
      transaction.completedAt = new Date().toISOString();
      
      // Release funds to seller (in a real app, this would trigger Stripe transfer)
      const seller = marketplaceData.users.find(u => u.id === transaction.sellerId);
      if (seller) {
        seller.totalEarnings += transaction.amount;
      }
      
      // Update buyer stats
      const buyer = marketplaceData.users.find(u => u.id === transaction.buyerId);
      if (buyer) {
        buyer.stats.totalPurchases++;
      }
      
      // Update seller stats
      if (seller) {
        seller.stats.totalSales++;
      }
    }
    
    res.json({
      success: true,
      transaction: transaction,
      completed: transaction.status === 'completed',
      pendingConfirmations: {
        buyer: !buyerConfirmed,
        seller: !sellerConfirmed
      }
    });
  } catch (error) {
    console.error('Error completing transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres
  return d;
}

// Dispute system
app.post('/api/marketplace/dispute', (req, res) => {
  try {
    const { transactionId, disputerId, reason, description } = req.body;
    
    if (!transactionId || !disputerId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const transaction = marketplaceData.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Create dispute
    const dispute = {
      id: 'dispute_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      transactionId: transactionId,
      disputerId: disputerId,
      reason: reason,
      description: description,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    
    // Update transaction status
    transaction.status = 'disputed';
    transaction.disputeId = dispute.id;
    
    res.json({
      success: true,
      dispute: dispute
    });
  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize sample data
function initializeMarketplaceData() {
  // Add some sample items with auction support
  marketplaceData.items = [
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
      reservePrice: 500.00, // Reserve price for iPhone 13 Pro
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
      reservePrice: 60.00, // Reserve price for leather jacket
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'item_sample_3',
      title: 'MacBook Pro 14" M3',
      description: 'Brand new MacBook Pro 14" with M3 chip, 16GB RAM, 512GB SSD. Still in original packaging.',
      price: 1999.00,
      category: 'electronics',
      location: 'West Omaha',
      distance: '5.2 miles',
      image: '💻',
      seller: {
        id: 'seller_sample_3',
        name: 'AppleReseller',
        rating: 4.9
      },
      bids: [],
      status: 'active',
      auctionStatus: 'not_started',
      currentHighestBid: 0,
      currentHighestBidder: null,
      currentHighestBidderName: null,
      auctionEndTime: null,
      reservePrice: 1500.00, // Reserve price for MacBook Pro
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  console.log('📦 Marketplace sample data initialized with auction support');
}

// Auto-posting system integration
const AutoPoster = require('./auto-poster');
const autoPoster = new AutoPoster();

// Auto-posting API endpoints
app.get('/api/auto-poster/status', (req, res) => {
  try {
    const status = autoPoster.getStatus();
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    console.error('Error getting auto-poster status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/auto-poster/start', (req, res) => {
  try {
    autoPoster.startPosting();
    res.json({
      success: true,
      message: 'Auto-posting started'
    });
  } catch (error) {
    console.error('Error starting auto-poster:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/auto-poster/stop', (req, res) => {
  try {
    autoPoster.stopPosting();
    res.json({
      success: true,
      message: 'Auto-posting stopped'
    });
  } catch (error) {
    console.error('Error stopping auto-poster:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/auto-poster/schedule', (req, res) => {
  try {
    if (autoPoster.inventoryData) {
      res.json({
        success: true,
        schedule: autoPoster.inventoryData.postingSchedule
      });
    } else {
      res.json({
        success: false,
        error: 'No inventory data loaded'
      });
    }
  } catch (error) {
    console.error('Error getting posting schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize auto-poster on startup
autoPoster.run();

// Initialize marketplace data on startup
initializeMarketplaceData();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PacMac Marketplace server running on port ${PORT}`);
  console.log(`📱 Marketplace: http://localhost:${PORT}/marketplace`);
  console.log(`🔐 OAuth: http://localhost:${PORT}/auth/google`);
  console.log(`💳 Stripe: ${stripe ? 'Available' : 'Not available'}`);
  console.log(`📧 SendGrid: ${sgMail ? 'Available' : 'Not available'}`);
  console.log(`🗺️ Location Services: ${locationVerifier ? 'Available' : 'Not available'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.NODE_ENV === 'production' ? (process.env.RENDER_EXTERNAL_URL || 'https://pacmac-marketplace.onrender.com') : 'http://localhost:3000'}`);
  console.log(`💚 Health check available at http://localhost:${PORT}/health`);
  console.log(`📱 Network access: http://192.168.1.39:${PORT}/demo-flow.html`);
  console.log(`📱 Network access: http://192.168.1.39:${PORT}/marketplace.html`);
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
