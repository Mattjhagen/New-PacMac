# PacMac Mobile - Fully Functional E-commerce Platform 🚀

A complete, production-ready e-commerce platform for mobile devices, trade-ins, leasing, and internet services. Built with modern web technologies and integrated with real payment processing and email services.

## ✨ Features

### 🛍️ **E-commerce**
- **Product Catalog**: iPhone, iPad, Apple Watch, Samsung Galaxy devices
- **Shopping Cart**: Persistent cart with localStorage
- **Secure Checkout**: Stripe payment processing with tax calculation
- **Order Management**: Complete order lifecycle with email confirmations

### 🔄 **Trade-In Services**
- **Phobio Integration**: Realistic trade-in pricing based on device condition
- **Apple Authorized Repairs**: Trade-in and repair services
- **Email Confirmations**: Automatic trade-in submission confirmations

### 💳 **Financing Options**
- **Progressive Leasing**: Lease-to-own financing with pre-qualification
- **Credit Checks**: Simulated credit scoring and approval process
- **Flexible Terms**: 12-month lease-to-own options

### 🌐 **Internet Services**
- **Nomad Internet**: Home and travel unlimited internet plans
- **Coverage Checking**: ZIP code-based availability verification
- **Plan Management**: Multiple plan options with setup fees

### 🎨 **User Experience**
- **Responsive Design**: Mobile-first, Apple-inspired interface
- **Animated Starfield**: Interactive parallax background
- **Real-time Validation**: Form validation and error handling
- **Professional UI**: Clean, modern design with smooth animations

## 🚀 Quick Start

### Option 1: Simple HTML (No Backend)
```bash
# Just open the HTML file in your browser
open index.html
```

### Option 2: Full Stack with Backend
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the server
npm start

# Open http://localhost:3000
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# SendGrid Email Service
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=orders@pacmacmobile.com

# Server Configuration
PORT=3000
NODE_ENV=production
```

### API Keys Setup

#### 1. **Stripe** (Payment Processing)
1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from the dashboard
3. Update `config.js` with your publishable key
4. Set `STRIPE_SECRET_KEY` in your environment

#### 2. **SendGrid** (Email Service)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key with mail send permissions
3. Set `SENDGRID_API_KEY` in your environment
4. Verify your sender email address

#### 3. **Progressive Leasing** (Optional)
1. Contact Progressive Leasing for partner API access
2. Update the API endpoint in `config.js`
3. Set your partner credentials

#### 4. **Nomad Internet** (Optional)
1. Contact Nomad Internet for reseller API access
2. Update the API endpoint in `config.js`
3. Set your reseller credentials

## 📁 Project Structure

```
New-PacMac/
├── index.html              # Main application (single-page)
├── config.js               # Enhanced configuration & utilities
├── server.js               # Node.js backend server
├── package.json            # Dependencies and scripts
├── Products/               # Product images
│   ├── iPhone-15.jpg
│   ├── iPhone15Plus.jpg
│   ├── iPadAir11.jpg
│   ├── AppleWatch10.jpg
│   ├── SamS25.jpg
│   └── SamS25Ultra.jpg
├── pacmac_terms_service.html    # Legal terms
├── pacmac_privacy_policy.html   # Privacy policy
├── CNAME                   # Domain configuration
└── README.md               # This file
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# The app will be available at http://localhost:3000
```

### Production Deployment

#### Option 1: Static Hosting (HTML Only)
- Upload `index.html`, `config.js`, and `Products/` folder
- No backend required for basic functionality
- Demo mode for payments and emails

#### Option 2: Full Stack Deployment
```bash
# Build for production
npm install --production

# Set environment variables
export STRIPE_SECRET_KEY=sk_live_...
export SENDGRID_API_KEY=SG.live_...

# Start production server
npm start
```

### Recommended Hosting Platforms
- **Vercel**: Easy deployment with environment variables
- **Netlify**: Static hosting with serverless functions
- **Heroku**: Full-stack deployment
- **DigitalOcean**: VPS hosting for full control

## 🔌 API Endpoints

When running with the backend server, these endpoints are available:

### Payment Processing
- `POST /api/create-payment-intent` - Create Stripe payment intent

### Email Services
- `POST /api/send-email` - Send emails via SendGrid

### Order Management
- `POST /api/orders` - Create and manage orders
- `POST /api/trade-in` - Submit trade-in requests
- `POST /api/progressive-leasing` - Process lease applications
- `POST /api/nomad-internet` - Place internet orders

### Health Check
- `GET /api/health` - Server health status

## 🎯 Customization

### Adding New Products
Edit the `PRODUCTS` array in `index.html`:

```javascript
const PRODUCTS = [
  {
    id: 'pm-new-product',
    name: 'New Product',
    price: 999.00,
    tags: ['5G', '128GB'],
    img: 'Products/new-product.jpg',
    description: 'Product description here'
  }
  // ... existing products
];
```

### Modifying Trade-In Pricing
Update the pricing in `config.js`:

```javascript
tradeInPricing: {
  'iPhone 15': { 'Like New': 650, 'Good': 520, 'Fair': 360, 'Broken': 130 },
  'New Device': { 'Like New': 500, 'Good': 400, 'Fair': 300, 'Broken': 100 }
}
```

### Customizing Email Templates
Edit the email templates in `server.js` or `config.js` to match your branding.

## 🔒 Security Features

- **HTTPS Required**: All payment processing requires HTTPS
- **Input Validation**: Client and server-side validation
- **CORS Protection**: Configured for production use
- **Environment Variables**: Sensitive data stored securely
- **Stripe Security**: PCI-compliant payment processing

## 📧 Email Notifications

The system automatically sends emails for:
- Order confirmations
- Trade-in submissions
- Lease application approvals
- Internet service orders
- Payment confirmations

## 🧪 Testing

### Demo Mode
When API keys are not configured, the system runs in demo mode:
- Payments are simulated
- Emails are logged to console
- All functionality works without external dependencies

### Production Testing
1. Set up real API keys
2. Test with Stripe test cards
3. Verify email delivery
4. Test all user flows

## 🚨 Troubleshooting

### Common Issues

**Payment Processing Fails**
- Check Stripe API keys
- Verify HTTPS is enabled
- Check browser console for errors

**Emails Not Sending**
- Verify SendGrid API key
- Check sender email verification
- Review SendGrid dashboard for delivery status

**Images Not Loading**
- Ensure `Products/` folder is uploaded
- Check file paths and permissions
- Verify image file formats

### Debug Mode
Add `?debug=true` to the URL to enable detailed logging.

## 📞 Support

- **Phone**: 402.302.2197
- **Email**: info@pacmacmobile.com
- **Address**: 1402 Jones Street, Omaha, NE 68901

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with Code, Coffee and Jesus.** ☕✝️

*PacMac Mobile LLC - Making mobile technology accessible to everyone.*
