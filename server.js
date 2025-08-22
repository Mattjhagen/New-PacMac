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
