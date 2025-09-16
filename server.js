
// âŒ REMOVE THESE HARDCODED VALUES:
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '1053950032683-igseosamup9cej3bn1o8lj5kqdok1t1b.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
  callbackURL: callbackURL
```

**Fix:** Replace with proper error handling:
```javascript
// âœ… SECURE VERSION:
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('âŒ STRIPE_SECRET_KEY environment variable is required');
  process.exit(1);
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('âŒ Google OAuth environment variables are required');
  process.exit(1);
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: callbackURL
```

### 2. Fix Self-Referencing API Call
**Issue:** Line ~1300 makes HTTP request to itself
```javascript
// âŒ PROBLEMATIC CODE:
const moderationResponse = await fetch('http://localhost:3000/api/moderate/content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': req.headers.cookie
  },
  body: JSON.stringify({ title, description, category })
});
```

**Fix:** Call function directly:
```javascript
// âœ… DIRECT FUNCTION CALL:
const moderationResult = moderateContent({ title, description, category });
if (!moderationResult.success) {
  return res.status(400).json({
    success: false,
    error: moderationResult.error,
    violation: moderationResult.violation
  });
}

// Move moderation logic to separate function:
function moderateContent({ title, description, category }) {
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
    return {
      success: false,
      error: 'Prohibited content detected. No pets, animals, or living things are allowed on the platform.',
      violation: true
    };
  }
  
  return { success: true, message: 'Content approved' };
}
```

### 3. Fix CORS Configuration
**Issue:** Lines 14-18 have hardcoded IP address
```javascript
// âŒ HARDCODED IP:
origin: process.env.NODE_ENV === 'production' 
  ? 'https://new-pacmac.onrender.com' 
  : ['http://localhost:3000', 'http://192.168.1.39:3000'],
```

**Fix:** Use environment variable:
```javascript
// âœ… DYNAMIC ORIGIN:
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.RENDER_EXTERNAL_URL || 'https://new-pacmac.onrender.com';
  }
  
  const origins = ['http://localhost:3000'];
  if (process.env.DEV_IP) {
    origins.push(`http://${process.env.DEV_IP}:3000`);
  }
  return origins;
};

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true
}));
```

## ðŸ”§ DEPLOYMENT FIXES

### 4. Enhanced Error Handling for Stripe
```javascript
// âœ… ADD COMPREHENSIVE ERROR HANDLING:
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
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
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        error: 'Your card was declined.'
      });
    }
    
    if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({
        success: false,
        error: 'Too many requests made to the API too quickly'
      });
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters were supplied to Stripe API'
      });
    }
    
    if (error.type === 'StripeAPIError') {
      return res.status(500).json({
        success: false,
        error: 'An error occurred with Stripe API'
      });
    }
    
    if (error.type === 'StripeConnectionError') {
      return res.status(500).json({
        success: false,
        error: 'A network error occurred'
      });
    }
    
    if (error.type === 'StripeAuthenticationError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication with Stripe API failed'
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});
```

### 5. Environment Variable Validation
Add this at the top of server.js:
```javascript
// âœ… VALIDATE REQUIRED ENVIRONMENT VARIABLES:
function validateEnvironment() {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'SESSION_SECRET',
    'STRIPE_SECRET_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('âŒ Missing required environment variables:', missing);
    console.error('ðŸ’¡ Please set these variables in your Render dashboard');
    process.exit(1);
  }
  
  console.log('âœ… All required environment variables are set');
}

// Call validation on startup
if (process.env.NODE_ENV === 'production') {
  validateEnvironment();
}
```

## ðŸ“ Updated render.yaml

```yaml
services:
  - type: web
    name: pacmac-marketplace
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
    # NOTE: Add these environment variables in Render dashboard:
    # GOOGLE_CLIENT_ID
    # GOOGLE_CLIENT_SECRET  
    # SESSION_SECRET
    # STRIPE_SECRET_KEY
    # STRIPE_PUBLISHABLE_KEY
    # SENDGRID_API_KEY
    # FROM_EMAIL
```

## ðŸŽ¯ DEPLOYMENT CHECKLIST

### Before Deployment:
1. âœ… Remove all hardcoded secrets from code
2. âœ… Fix self-referencing API call  
3. âœ… Add comprehensive error handling
4. âœ… Update CORS configuration
5. âœ… Add environment variable validation

### In Render Dashboard:
1. Set all required environment variables:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret  
   - `SESSION_SECRET`: Random 32+ character string
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (sk_live_... or sk_test_...)
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `SENDGRID_API_KEY`: Your SendGrid API key (optional)
   - `FROM_EMAIL`: Your sender email address (optional)

2. Configure Google OAuth redirect URLs:
   - Add `https://your-app-name.onrender.com/auth/google/callback`

### Testing:
1. Test health check endpoint: `/health`
2. Test OAuth flow: `/auth/google`  
3. Test marketplace functionality: `/marketplace`
4. Check server logs for any errors

## ðŸ›¡ï¸ SECURITY IMPROVEMENTS

### 1. Session Security
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    httpOnly: true
  }
}));
```

### 2. Rate Limiting (optional but recommended)
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

## ðŸš€ PERFORMANCE OPTIMIZATIONS

### 1. Static File Organization
Create a `public` directory and move static files:
```javascript
// Replace: app.use(express.static('.'));
// With:
app.use(express.static('public'));
```

### 2. Compression (optional)
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

This comprehensive fix addresses all critical bugs and deployment issues. The application should deploy successfully on Render after implementing these changes.
