const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.RENDER_EXTERNAL_URL || 'https://pacmac-marketplace.onrender.com' : 'http://localhost:3000',
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
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: process.env.NODE_ENV === 'production' 
    ? (process.env.RENDER_EXTERNAL_URL || 'https://pacmac-marketplace.onrender.com') + '/auth/google/callback'
    : 'http://localhost:3000/auth/google/callback'
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

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = marketplaceData.users.find(u => u.id === id);
  done(null, user);
});

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'SG.your_sendgrid_api_key');

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, error: 'Authentication required' });
}

// Routes
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
    // Successful authentication, redirect to marketplace
    res.redirect('/marketplace?auth=success');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.redirect('/marketplace');
  });
});

app.get('/auth/user', (req, res) => {
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
    res.json({ success: true, user: userInfo });
  } else {
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
    version: '1.0.0'
  });
});

// Simple health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
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
      identityVerified: user.identityVerified
    });
  } catch (error) {
    console.error('Error checking payout status:', error);
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

// Place bid on item
app.post('/api/marketplace/bid', requireAuth, async (req, res) => {
  try {
    const { itemId, bidderId, bidderName, amount = 0.05 } = req.body;
    
    if (!itemId || !bidderId) {
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
    
    // Create escrow payment intent for bid amount + $3 flat fee + 3% fee
    const flatFee = 3.00; // $3 flat fee
    const percentageFee = amount * 0.03; // 3% of bid amount
    const totalFee = flatFee + percentageFee;
    const totalAmount = Math.round((amount + totalFee) * 100); // Convert to cents
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      description: `Bid on ${item.title}`,
      metadata: {
        type: 'marketplace_bid',
        itemId: itemId,
        bidderId: bidderId,
        bidAmount: amount.toString(),
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
      type: 'bid',
      itemId: itemId,
      itemTitle: item.title,
      bidderId: bidderId,
      bidderName: bidderName || 'Anonymous',
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
      countdownEnd: null
    };
    
    marketplaceData.transactions.push(transaction);
    
    // Add bid to item
    item.bids.push({
      id: transaction.id,
      bidderId: bidderId,
      bidderName: bidderName || 'Anonymous',
      amount: amount,
      createdAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      transaction: transaction,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error placing bid:', error);
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
  // Add some sample items
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  console.log('📦 Marketplace sample data initialized');
}

// Initialize marketplace data on startup
initializeMarketplaceData();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PacMac Marketplace server running on port ${PORT}`);
  console.log(`📱 Marketplace: http://localhost:${PORT}/marketplace`);
  console.log(`🔐 OAuth: http://localhost:${PORT}/auth/google`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.NODE_ENV === 'production' ? (process.env.RENDER_EXTERNAL_URL || 'https://pacmac-marketplace.onrender.com') : 'http://localhost:3000'}`);
  console.log(`💚 Health check available at http://localhost:${PORT}/health`);
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
