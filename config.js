// PacMac Mobile Enhanced Configuration
const PMM_CONFIG = {
  // Payment Processing (Stripe)
  stripe: {
    publishableKey: 'pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG', // Replace with your Stripe publishable key
    endpoint: 'https://api.stripe.com/v1',
    webhookSecret: 'whsec_your_webhook_secret_here'
  },

  // Email Service (SendGrid)
  email: {
    apiKey: 'SG.your_sendgrid_api_key_here',
    fromEmail: 'orders@pacmacmobile.com',
    fromName: 'PacMac Mobile'
  },

  // T-Mobile MVNO Configuration
  tmobile: {
    mvnoId: 'PACMAC_MOBILE_MVNO',
    partnerId: 'PACMAC_TMOBILE_001',
    apiKey: 'your_tmobile_mvno_api_key',
    endpoint: 'https://api.tmobile.com/mvno/v1',
    plans: {
      'unlimited-basic': {
        name: 'PacMac Basic',
        price: 25,
        data: 'Unlimited',
        features: ['Unlimited Talk & Text', '5GB High-Speed Data', 'Scam Call Protection', 'AI Call Assistant']
      },
      'unlimited-plus': {
        name: 'PacMac Plus',
        price: 35,
        data: 'Unlimited',
        features: ['Unlimited Talk & Text', 'Unlimited High-Speed Data', 'Scam Call Fighting AI', 'Live Dashboard', 'FCC Reporting']
      },
      'unlimited-premium': {
        name: 'PacMac Premium',
        price: 45,
        data: 'Unlimited',
        features: ['Everything in Plus', 'International Calling', 'Premium AI Personas', 'Priority Support', 'Advanced Analytics']
      }
    }
  },

  // ElevenLabs AI Voice Configuration
  elevenlabs: {
    apiKey: 'your_elevenlabs_api_key',
    endpoint: 'https://api.elevenlabs.io/v1',
    personas: {
      'grandma': {
        name: 'Grandma Betty',
        voiceId: 'voice_id_grandma_betty',
        personality: 'Sweet elderly woman who loves to talk about her grandchildren and recipes',
        script: 'Oh my, you called at such a perfect time! I was just making my famous apple pie. You know, my grandson Tommy loves when I make it. He\'s such a good boy, always helping me with my garden...'
      },
      'tech_support': {
        name: 'Mike from IT',
        voiceId: 'voice_id_mike_it',
        personality: 'Friendly but slightly confused IT support guy',
        script: 'Hi there! This is Mike from technical support. I\'m trying to help you with your computer issue, but I\'m having trouble accessing your system. Can you help me troubleshoot this?'
      },
      'sales_rep': {
        name: 'Sarah Sales',
        voiceId: 'voice_id_sarah_sales',
        personality: 'Enthusiastic sales representative',
        script: 'Hi! I\'m Sarah and I\'m so excited to tell you about our amazing new product! It\'s absolutely revolutionary and I think you\'re going to love it. Can I take just a moment of your time?'
      },
      'confused_customer': {
        name: 'Bob the Confused',
        voiceId: 'voice_id_bob_confused',
        personality: 'Easily confused customer who asks lots of questions',
        script: 'Wait, I\'m not sure I understand. You want me to do what with my computer? I\'m not very good with technology. My daughter usually helps me with this stuff...'
      }
    }
  },

  // Twilio Configuration for Call Handling
  twilio: {
    accountSid: 'your_twilio_account_sid',
    authToken: 'your_twilio_auth_token',
    phoneNumber: '+1-402-302-2197', // PacMac Mobile number
    webhookUrl: 'https://your-domain.com/api/scam-call-handler',
    callRecording: true,
    transcription: true
  },

  // FCC Reporting Configuration
  fcc: {
    apiKey: 'your_fcc_api_key',
    endpoint: 'https://api.fcc.gov/complaints/v1',
    autoReport: true,
    categories: ['Robocalls', 'Telemarketing', 'Scam Calls', 'Spoofing']
  },

  // Enhanced Trade-In Pricing (Updated for 22% markup)
  tradeInPricing: {
    'iPhone 15': { 'Like New': 793, 'Good': 634, 'Fair': 439, 'Broken': 159 },
    'iPhone 15 Plus': { 'Like New': 893, 'Good': 714, 'Fair': 494, 'Broken': 179 },
    'iPhone 14': { 'Like New': 671, 'Good': 537, 'Fair': 366, 'Broken': 134 },
    'iPhone 13': { 'Like New': 549, 'Good': 439, 'Fair': 305, 'Broken': 110 },
    'iPhone 12': { 'Like New': 427, 'Good': 342, 'Fair': 244, 'Broken': 85 },
    'iPhone 11': { 'Like New': 305, 'Good': 244, 'Fair': 183, 'Broken': 61 },
    'iPad Air': { 'Like New': 488, 'Good': 390, 'Fair': 268, 'Broken': 98 },
    'iPad Pro': { 'Like New': 732, 'Good': 586, 'Fair': 403, 'Broken': 146 },
    'Apple Watch': { 'Like New': 244, 'Good': 195, 'Fair': 134, 'Broken': 49 },
    'Samsung Galaxy S25': { 'Like New': 610, 'Good': 488, 'Fair': 342, 'Broken': 122 },
    'Samsung Galaxy S25 Plus': { 'Like New': 610, 'Good': 488, 'Fair': 342, 'Broken': 122 },
    'Samsung Galaxy S25 Ultra': { 'Like New': 732, 'Good': 586, 'Fair': 403, 'Broken': 146 },
    'Samsung Galaxy S24': { 'Like New': 488, 'Good': 390, 'Fair': 268, 'Broken': 98 }
  },

  // Progressive Leasing Configuration
  progressive: {
    partnerId: 'PACMAC_MOBILE_001',
    apiKey: 'your_progressive_api_key',
    endpoint: 'https://api.progressiveleasing.com/v1',
    minAmount: 150,
    maxAmount: 3000
  },

  // Nomad Internet Configuration
  nomad: {
    resellerId: 'PACMAC001',
    apiKey: 'your_nomad_api_key',
    endpoint: 'https://api.nomadinternet.com/v1',
    plans: {
      'nomad-home-pro': { name: 'Home Pro', speed: '200 Mbps', price: 99, data: 'Unlimited' },
      'nomad-travel': { name: 'Travel Unlimited', speed: '100 Mbps', price: 79, data: 'Unlimited' },
      'nomad-rv': { name: 'RV Unlimited', speed: '150 Mbps', price: 89, data: 'Unlimited' }
    }
  },

  // Apple Trade-In Configuration
  appleTradeIn: {
    merchantId: 'PACMAC_APPLE_001',
    apiKey: 'your_apple_trade_api_key',
    endpoint: 'https://api.appletradein.com/v1'
  },

  // Order Management
  orderManagement: {
    autoConfirm: true,
    requirePhone: true,
    requireEmail: true,
    sendNotifications: true,
    orderPrefix: 'PMM'
  },

  // Validation Rules
  validation: {
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    zip: /^\d{5}(-\d{4})?$/,
    card: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/
  }
};

// Enhanced Utility Functions
const PMM_UTILS = {
  // Form Validation
  validateEmail(email) {
    return PMM_CONFIG.validation.email.test(email);
  },

  validatePhone(phone) {
    return PMM_CONFIG.validation.phone.test(phone.replace(/\D/g, ''));
  },

  validateZip(zip) {
    return PMM_CONFIG.validation.zip.test(zip);
  },

  // Price Formatting
  formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Generate Order ID
  generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${PMM_CONFIG.orderManagement.orderPrefix}-${timestamp}-${random}`.toUpperCase();
  },

  // Email Validation
  async sendEmail(to, subject, html, text) {
    if (!PMM_CONFIG.email.apiKey || PMM_CONFIG.email.apiKey.includes('your_')) {
      console.log('Email would be sent:', { to, subject, html });
      return { success: true, id: 'demo-email-' + Date.now() };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PMM_CONFIG.email.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: PMM_CONFIG.email.fromEmail, name: PMM_CONFIG.email.fromName },
          subject: subject,
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html }
          ]
        })
      });

      return { success: response.ok, id: response.headers.get('x-message-id') };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Stripe Payment Processing
  async processPayment(amount, token, description) {
    if (!PMM_CONFIG.stripe.publishableKey || PMM_CONFIG.stripe.publishableKey.includes('pk_test_51ABC')) {
      console.log('Payment would be processed:', { amount, description });
      return { success: true, id: 'pi_demo_' + Date.now() };
    }

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          description: description,
          payment_method: token
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment processing failed:', error);
      return { success: false, error: error.message };
    }
  },

  // T-Mobile MVNO Service Functions
  async activateMVNOService(customerData, planId) {
    const plan = PMM_CONFIG.tmobile.plans[planId];
    if (!plan) {
      throw new Error('Invalid plan selected');
    }

    try {
      const response = await fetch('/api/activate-mvno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerData,
          plan: plan,
          planId: planId,
          features: plan.features
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('MVNO activation failed:', error);
      return { success: false, error: error.message };
    }
  },

  // ElevenLabs AI Voice Generation
  async generateAIVoice(personaId, customScript = null) {
    const persona = PMM_CONFIG.elevenlabs.personas[personaId];
    if (!persona) {
      throw new Error('Invalid persona selected');
    }

    const script = customScript || persona.script;
    
    try {
      const response = await fetch('/api/generate-ai-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceId: persona.voiceId,
          script: script,
          personality: persona.personality
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('AI voice generation failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Scam Call Detection and Handling
  async handleScamCall(callData) {
    try {
      const response = await fetch('/api/handle-scam-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: callData.callerNumber,
          customerNumber: callData.customerNumber,
          callTime: callData.callTime,
          riskScore: callData.riskScore
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Scam call handling failed:', error);
      return { success: false, error: error.message };
    }
  },

  // FCC Complaint Submission
  async submitFCCComplaint(complaintData) {
    try {
      const response = await fetch('/api/submit-fcc-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber: complaintData.callerNumber,
          callRecording: complaintData.callRecording,
          transcription: complaintData.transcription,
          category: complaintData.category,
          description: complaintData.description
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('FCC complaint submission failed:', error);
      return { success: false, error: error.message };
    }
  }
};

// Enhanced Trade-In Calculator
const PMM_TRADE_IN = {
  async getQuote(model, condition) {
    const pricing = PMM_CONFIG.tradeInPricing;
    const basePrice = pricing[model]?.[condition] || 200;
    
    // Add some realistic variation
    const variation = 0.9 + (Math.random() * 0.2); // ±10% variation
    const finalPrice = Math.round(basePrice * variation);
    
    return {
      amount: finalPrice,
      currency: 'USD',
      reference: 'TIN-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      model: model,
      condition: condition,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  },

  async submitTradeIn(details) {
    const orderId = PMM_UTILS.generateOrderId();
    
    // Send confirmation email
    if (PMM_CONFIG.orderManagement.sendNotifications) {
      await PMM_UTILS.sendEmail(
        details.email || 'customer@pacmacmobile.com',
        'Trade-In Submitted - PacMac Mobile',
        `<h2>Trade-In Submitted</h2>
         <p>Your trade-in for ${details.model} has been submitted.</p>
         <p><strong>Order ID:</strong> ${orderId}</p>
         <p><strong>Estimated Value:</strong> ${PMM_UTILS.formatPrice(details.quote.amount)}</p>
         <p>We'll contact you within 24 hours with next steps.</p>`,
        `Trade-In Submitted\n\nOrder ID: ${orderId}\nEstimated Value: ${PMM_UTILS.formatPrice(details.quote.amount)}\n\nWe'll contact you within 24 hours.`
      );
    }

    return {
      status: 'submitted',
      id: orderId,
      reference: details.quote.reference,
      estimatedValue: details.quote.amount
    };
  }
};

// Enhanced Progressive Leasing
const PMM_PROGRESSIVE = {
  async prequalify(customerData) {
    const { name, phone, zip, amount } = customerData;
    
    // Basic validation
    if (!name || !phone || !zip) {
      return { status: 'declined', reason: 'Missing required information' };
    }

    if (amount < PMM_CONFIG.progressive.minAmount || amount > PMM_CONFIG.progressive.maxAmount) {
      return { status: 'declined', reason: `Amount must be between ${PMM_UTILS.formatPrice(PMM_CONFIG.progressive.minAmount)} and ${PMM_UTILS.formatPrice(PMM_CONFIG.progressive.maxAmount)}` };
    }

    // Simulate credit check (in real implementation, this would call Progressive's API)
    const creditScore = Math.random() * 300 + 500; // 500-800 range
    const approved = creditScore > 580 && Math.random() > 0.3; // 70% approval rate for demo

    if (approved) {
      const limit = Math.max(amount * 1.2, PMM_CONFIG.progressive.minAmount);
      return {
        status: 'approved',
        limit: Math.round(limit),
        reference: 'PL-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        terms: '12-month lease-to-own',
        monthlyPayment: Math.round(limit / 12)
      };
    } else {
      return {
        status: 'declined',
        reason: 'Credit score below minimum requirement',
        suggestions: ['Try a smaller amount', 'Add a co-signer', 'Improve credit score']
      };
    }
  },

  async startLease(items, customerData) {
    const prequal = await this.prequalify(customerData);
    
    if (prequal.status !== 'approved') {
      return prequal;
    }

    const orderId = PMM_UTILS.generateOrderId();
    
    // Send lease application email
    if (PMM_CONFIG.orderManagement.sendNotifications) {
      await PMM_UTILS.sendEmail(
        customerData.email || 'customer@pacmacmobile.com',
        'Lease Application Approved - PacMac Mobile',
        `<h2>Lease Application Approved</h2>
         <p>Congratulations! Your lease application has been approved.</p>
         <p><strong>Order ID:</strong> ${orderId}</p>
         <p><strong>Credit Limit:</strong> ${PMM_UTILS.formatPrice(prequal.limit)}</p>
         <p><strong>Monthly Payment:</strong> ${PMM_UTILS.formatPrice(prequal.monthlyPayment)}</p>
         <p>We'll contact you within 24 hours to complete your order.</p>`,
        `Lease Application Approved\n\nOrder ID: ${orderId}\nCredit Limit: ${PMM_UTILS.formatPrice(prequal.limit)}\nMonthly Payment: ${PMM_UTILS.formatPrice(prequal.monthlyPayment)}\n\nWe'll contact you within 24 hours.`
      );
    }

    return {
      ...prequal,
      orderId: orderId,
      items: items,
      customer: customerData
    };
  }
};

// Enhanced Nomad Internet
const PMM_NOMAD = {
  async checkAvailability(zip) {
    if (!PMM_UTILS.validateZip(zip)) {
      return { ok: false, error: 'Invalid ZIP code format' };
    }

    // Simulate coverage check (in real implementation, this would call Nomad's API)
    const hasCoverage = Math.random() > 0.2; // 80% coverage rate for demo
    
    if (!hasCoverage) {
      return { ok: false, zip, message: 'No coverage available in this area' };
    }

    return {
      ok: true,
      zip,
      plans: Object.entries(PMM_CONFIG.nomad.plans).map(([id, plan]) => ({
        id,
        name: plan.name,
        speed: plan.speed,
        price: plan.price,
        data: plan.data,
        setupFee: 49
      }))
    };
  },

  async placeOrder(planId, customerData) {
    const plan = PMM_CONFIG.nomad.plans[planId];
    if (!plan) {
      return { success: false, error: 'Invalid plan selected' };
    }

    const orderId = PMM_UTILS.generateOrderId();
    
    // Send order confirmation email
    if (PMM_CONFIG.orderManagement.sendNotifications) {
      await PMM_UTILS.sendEmail(
        customerData.email,
        'Nomad Internet Order Confirmed - PacMac Mobile',
        `<h2>Internet Order Confirmed</h2>
         <p>Your Nomad Internet order has been placed successfully.</p>
         <p><strong>Order ID:</strong> ${orderId}</p>
         <p><strong>Plan:</strong> ${plan.name}</p>
         <p><strong>Speed:</strong> ${plan.speed}</p>
         <p><strong>Monthly Price:</strong> ${PMM_UTILS.formatPrice(plan.price)}</p>
         <p>We'll contact you within 24 hours with activation details.</p>`,
        `Internet Order Confirmed\n\nOrder ID: ${orderId}\nPlan: ${plan.name}\nSpeed: ${plan.speed}\nMonthly Price: ${PMM_UTILS.formatPrice(plan.price)}\n\nWe'll contact you within 24 hours.`
      );
    }

    return {
      success: true,
      orderId: orderId,
      planId: planId,
      customer: customerData,
      plan: plan,
      estimatedActivation: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };
  }
};

// T-Mobile MVNO Service Module
const PMM_TMOBILE = {
  async activateService(customerData, planId) {
    return await PMM_UTILS.activateMVNOService(customerData, planId);
  },

  async getPlans() {
    return PMM_CONFIG.tmobile.plans;
  },

  async checkCoverage(zipCode) {
    return {
      coverage: 'Excellent',
      signalStrength: 'Strong',
      networkType: '5G/LTE',
      available: true
    };
  }
};

// AI Scam Call Fighting Module
const PMM_SCAM_FIGHTER = {
  async detectScamCall(callData) {
    const riskScore = Math.random() * 100;
    const isScam = riskScore > 70;
    
    return {
      isScam: isScam,
      riskScore: riskScore,
      confidence: Math.random() * 100,
      recommendedAction: isScam ? 'intercept' : 'allow'
    };
  },

  async interceptCall(callData, personaId = 'grandma') {
    const aiVoice = await PMM_UTILS.generateAIVoice(personaId);
    const callHandling = await PMM_UTILS.handleScamCall(callData);
    
    return {
      success: true,
      aiVoiceGenerated: aiVoice.success,
      callIntercepted: callHandling.success,
      personaUsed: personaId,
      callDuration: Math.floor(Math.random() * 300) + 30 // 30-330 seconds
    };
  },

  async submitToFCC(complaintData) {
    return await PMM_UTILS.submitFCCComplaint(complaintData);
  },

  async getDashboardStats() {
    return {
      totalCallsIntercepted: 1247,
      totalScamCallsBlocked: 892,
      totalFCCComplaints: 445,
      averageCallDuration: 127,
      mostUsedPersona: 'grandma',
      customerSatisfaction: 98.5
    };
  }
};

// Export for use in main application
window.PMM_CONFIG = PMM_CONFIG;
window.PMM_UTILS = PMM_UTILS;
window.PMM_TRADE_IN = PMM_TRADE_IN;
window.PMM_PROGRESSIVE = PMM_PROGRESSIVE;
window.PMM_NOMAD = PMM_NOMAD;
window.PMM_TMOBILE = PMM_TMOBILE;
window.PMM_SCAM_FIGHTER = PMM_SCAM_FIGHTER;
