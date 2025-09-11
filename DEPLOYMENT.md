# PacMac Mobile - Deployment Guide 🚀

This guide will help you deploy PacMac Mobile to production with all features fully functional.

## 🎯 Deployment Options

### Option 1: Static Hosting (HTML Only)
**Best for**: Quick demo, testing, or when you don't need real payment processing

**Steps**:
1. Upload these files to your web server:
   - `index.html`
   - `config.js`
   - `Products/` folder (with all images)
   - `pacmac_terms_service.html`
   - `pacmac_privacy_policy.html`

2. The application will run in demo mode with:
   - Simulated payments
   - Console-logged emails
   - All UI functionality working

### Option 2: Full Stack Deployment
**Best for**: Production use with real payment processing and email notifications

## 🔧 Full Stack Setup

### 1. Prerequisites
- Node.js 16+ installed
- Git repository set up
- Domain name configured (optional but recommended)

### 2. Environment Setup

Create a `.env` file in your project root:

```env
# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key

# SendGrid Email Service
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=orders@yourdomain.com

# Server Configuration
PORT=3000
NODE_ENV=production

# Optional APIs (if you have partnerships)
PROGRESSIVE_API_KEY=your_progressive_api_key
NOMAD_API_KEY=your_nomad_api_key
APPLE_TRADE_API_KEY=your_apple_trade_api_key
```

### 3. API Key Setup

#### Stripe Setup
1. Sign up at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy your publishable and secret keys
4. Update `config.js` with your publishable key
5. Set `STRIPE_SECRET_KEY` in your environment

#### SendGrid Setup
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create a new API key with "Mail Send" permissions
4. Set `SENDGRID_API_KEY` in your environment
5. Verify your sender email address in Settings → Sender Authentication

### 4. Installation & Startup

```bash
# Install dependencies
npm install

# Start the server
npm start

# For development with auto-reload
npm run dev
```

## 🌐 Hosting Platforms

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Netlify
```bash
# Build command: npm start
# Publish directory: ./
# Set environment variables in Netlify dashboard
```

### Heroku
```bash
# Create Heroku app
heroku create pacmac-mobile

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set SENDGRID_API_KEY=SG...

# Deploy
git push heroku main
```

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically on push

## 🔒 Security Checklist

### Before Going Live
- [ ] HTTPS enabled
- [ ] Stripe keys switched to live mode
- [ ] SendGrid sender email verified
- [ ] Environment variables secured
- [ ] CORS configured for your domain
- [ ] Error logging set up
- [ ] Backup strategy in place

### SSL/HTTPS Setup
Most hosting platforms provide automatic SSL. For custom servers:

```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

## 📊 Monitoring & Analytics

### Recommended Tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Mixpanel
- **Performance**: Lighthouse, WebPageTest

### Health Check
Your app includes a health check endpoint:
```
GET https://yourdomain.com/api/health
```

## 🧪 Testing Checklist

### Payment Testing
- [ ] Test with Stripe test cards
- [ ] Verify tax calculation
- [ ] Test order confirmation emails
- [ ] Check cart persistence

### Trade-In Testing
- [ ] Test quote generation
- [ ] Verify email notifications
- [ ] Test form validation

### Leasing Testing
- [ ] Test pre-qualification
- [ ] Verify approval/decline logic
- [ ] Test email confirmations

### Internet Services Testing
- [ ] Test coverage checking
- [ ] Verify plan selection
- [ ] Test order placement

## 🚨 Troubleshooting

### Common Issues

**Server Won't Start**
```bash
# Check Node.js version
node --version

# Check port availability
lsof -i :3000

# Check environment variables
echo $STRIPE_SECRET_KEY
```

**Payments Not Working**
- Verify Stripe keys are correct
- Check browser console for errors
- Ensure HTTPS is enabled
- Verify CORS settings

**Emails Not Sending**
- Check SendGrid API key
- Verify sender email is verified
- Check SendGrid dashboard for delivery status
- Review email templates

**Images Not Loading**
- Verify file paths are correct
- Check file permissions
- Ensure Products folder is uploaded
- Test image URLs directly

### Debug Mode
Add `?debug=true` to your URL to enable detailed logging.

## 📈 Performance Optimization

### Frontend
- Images are optimized and compressed
- CSS and JS are minified
- Starfield animation is hardware-accelerated
- LocalStorage for cart persistence

### Backend
- Express.js with compression
- CORS properly configured
- Error handling implemented
- Rate limiting (recommended for production)

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor error logs
- Update dependencies monthly
- Review Stripe dashboard for failed payments
- Check SendGrid delivery reports
- Backup order data (if using database)

### Version Updates
```bash
# Update dependencies
npm update

# Test thoroughly
npm test

# Deploy with zero downtime
# (Use your hosting platform's deployment strategy)
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check server logs
4. Contact support:
   - **Phone**: 402.302.2197
   - **Email**: info@pacmacmobile.com

## 🎉 Go Live Checklist

- [ ] All API keys configured
- [ ] HTTPS enabled
- [ ] Domain configured
- [ ] Email templates customized
- [ ] Legal pages updated
- [ ] Contact information verified
- [ ] Payment testing completed
- [ ] Email delivery confirmed
- [ ] Mobile responsiveness tested
- [ ] Performance optimized
- [ ] Monitoring set up
- [ ] Backup strategy implemented

---

**Ready to launch! 🚀**

Your PacMac Mobile platform is now fully functional and ready for customers.
