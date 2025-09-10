const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'SG.your_sendgrid_api_key');

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
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
        <p>Questions? Call us at 402.302.2197 or email info@pacmacmobile.com</p>
      `;

      const emailText = `
        Order Confirmed!\n\n
        Order ID: ${orderId}\n
        Total: $${(total / 100).toFixed(2)}\n
        Estimated Shipping: ${order.estimatedShipping.toLocaleDateString()}\n\n
        We'll send you tracking information once your order ships.\n
        Questions? Call us at 402.302.2197 or email info@pacmacmobile.com
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
        <p>Questions? Call us at 402.302.2197 or email info@pacmacmobile.com</p>
      `;

      const emailText = `
        Trade-In Submitted!\n\n
        Trade-In ID: ${tradeInId}\n
        Device: ${model}\n
        Condition: ${condition}\n
        Estimated Value: $${quote.amount}\n
        Estimated Processing: ${tradeIn.estimatedProcessing.toLocaleDateString()}\n\n
        We'll contact you within 24 hours with next steps.\n
        Questions? Call us at 402.302.2197 or email info@pacmacmobile.com
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
          <p>Questions? Call us at 402.302.2197 or email info@pacmacmobile.com</p>
        `;

        const emailText = `
          Lease Application Approved!\n\n
          Lease ID: ${leaseId}\n
          Credit Limit: $${lease.limit}\n
          Monthly Payment: $${lease.monthlyPayment}\n
          Terms: ${lease.terms}\n\n
          We'll contact you within 24 hours to complete your order.\n
          Questions? Call us at 402.302.2197 or email info@pacmacmobile.com
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
        <p>Questions? Call us at 402.302.2197 or email info@pacmacmobile.com</p>
      `;

      const emailText = `
        Nomad Internet Order Confirmed!\n\n
        Order ID: ${orderId}\n
        Plan: ${planId}\n
        Estimated Activation: ${order.estimatedActivation.toLocaleDateString()}\n\n
        We'll contact you within 24 hours with activation details.\n
        Questions? Call us at 402.302.2197 or email info@pacmacmobile.com
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PacMac Mobile server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to view the application`);
  console.log(`🔧 API endpoints available at http://localhost:${PORT}/api/`);
});

module.exports = app;
