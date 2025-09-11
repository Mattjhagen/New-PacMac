# PacMac Mobile - Tinder-Style Tech Marketplace

## Overview
A modern Tinder-style frontend for finding tech devices nearby with secure escrow protection. Users can swipe through tech products, match with sellers, and complete secure transactions.

## Architecture

### Frontend (New-PacMac Repository)
- **Entry Point**: `splash.html` → `app.html`
- **Main App**: Tinder-style swiping interface
- **Authentication**: User registration and login
- **API Integration**: Communicates with admin backend

### Backend (admin-pacmacmobile Repository)
- **Admin Panel**: Manage products, users, and transactions
- **API Endpoints**: Serve product data and handle user actions
- **User Management**: Ban users, remove products, monitor activity

## Features

### 🎯 **Tinder-Style Interface**
- **Swipe Navigation**: Swipe left (pass), right (like), up (super like)
- **Card Stack**: Multiple product cards with smooth animations
- **Touch & Mouse Support**: Works on mobile and desktop
- **Visual Feedback**: Smooth animations and transitions

### 👤 **User Authentication**
- **Registration**: Name, email, password, location
- **Login**: Email and password authentication
- **Session Management**: Persistent login with localStorage
- **User Profile**: Avatar and basic info display

### 📱 **Product Discovery**
- **Dynamic Loading**: Fetches products from admin backend
- **Rich Product Cards**: Images, specs, pricing, seller info
- **Smart Filtering**: Location-based product recommendations
- **Empty States**: Graceful handling when no products available

### 🛡️ **Escrow System**
- **Secure Transactions**: Protected payment processing
- **Match Notifications**: Real-time match alerts
- **Chat Integration**: Direct communication with sellers
- **Transaction History**: Track all interactions

## File Structure

```
New-PacMac/
├── splash.html          # Entry splash screen
├── app.html             # Main Tinder-style app
├── config.js            # API configuration
├── api-proxy.js         # CORS proxy for development
├── package.json         # Dependencies
└── TINDER_APP_README.md # This file
```

## Getting Started

### 1. **Development Setup**
```bash
# Install dependencies
npm install

# Start API proxy (for local development)
npm run dev-api

# Start main server
npm run dev
```

### 2. **Production Deployment**
- **Frontend**: Deploy to GitHub Pages or Vercel
- **Backend**: Already deployed on Vercel (admin.pacmacmobile.com)
- **API**: Configure CORS for production domains

### 3. **Configuration**
Update `config.js` to point to your admin backend:
```javascript
apiBaseUrl: 'https://admin.pacmacmobile.com/api'
```

## User Flow

### 1. **Entry Experience**
1. User visits site → sees splash screen
2. Clicks "Start Swiping" → enters main app
3. Sees login/register screen

### 2. **Authentication**
1. **New User**: Registers with name, email, password, location
2. **Returning User**: Logs in with email and password
3. **Session**: Automatically logged in on return visits

### 3. **Product Discovery**
1. **Loading**: App fetches products from admin backend
2. **Swiping**: User swipes through product cards
3. **Actions**: Pass, Like, or Super Like products
4. **Matches**: Real-time notifications for mutual likes

### 4. **Transaction Process**
1. **Match**: User and seller both like the product
2. **Chat**: Direct communication opens
3. **Escrow**: Secure payment processing
4. **Completion**: Transaction finalized

## API Integration

### **Product Endpoints**
```javascript
// Get all products
GET /api/public/products

// Swipe action
POST /api/products/{id}/swipe
{
  "userId": "user123",
  "action": "like" | "pass" | "super_like"
}
```

### **Authentication Endpoints**
```javascript
// User login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// User registration
POST /api/auth/register
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "location": { "city": "New York", "state": "NY" }
}
```

## Admin Backend Integration

### **Product Management**
- **Add Products**: Admin adds new tech devices
- **Update Inventory**: Real-time product updates
- **Remove Products**: Admin can remove inappropriate items

### **User Management**
- **Monitor Activity**: Track user behavior and interactions
- **Ban Users**: Remove users who violate terms
- **Analytics**: View usage statistics and popular products

### **Transaction Oversight**
- **Escrow Monitoring**: Track all secure transactions
- **Dispute Resolution**: Handle transaction disputes
- **Payment Processing**: Manage Stripe integration

## Technical Features

### **Responsive Design**
- **Mobile First**: Optimized for mobile devices
- **Touch Gestures**: Native swipe interactions
- **Desktop Support**: Mouse drag and click support
- **Cross-Platform**: Works on iOS, Android, and desktop

### **Performance**
- **Lazy Loading**: Products load as needed
- **Smooth Animations**: 60fps CSS transitions
- **Efficient Rendering**: Only visible cards in DOM
- **Caching**: Local storage for user sessions

### **Security**
- **HTTPS**: Secure communication
- **Input Validation**: Client and server-side validation
- **CORS**: Proper cross-origin configuration
- **Escrow**: Secure payment processing

## Customization

### **Styling**
- **CSS Variables**: Easy color and theme changes
- **Responsive Breakpoints**: Mobile and desktop layouts
- **Animation Timing**: Customizable transition speeds
- **Brand Colors**: Update primary and accent colors

### **Functionality**
- **Swipe Thresholds**: Adjust swipe sensitivity
- **Card Stack Size**: Number of visible cards
- **API Endpoints**: Customize backend integration
- **Features**: Enable/disable specific functionality

## Deployment

### **GitHub Pages**
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch
4. Configure custom domain (optional)

### **Vercel**
1. Connect GitHub repository to Vercel
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push

### **Environment Variables**
```bash
# Production
NODE_ENV=production
API_BASE_URL=https://admin.pacmacmobile.com/api

# Development
NODE_ENV=development
API_BASE_URL=http://localhost:3001/api
```

## Monitoring & Analytics

### **User Analytics**
- **Swipe Patterns**: Track user preferences
- **Popular Products**: Identify trending items
- **User Engagement**: Monitor app usage
- **Conversion Rates**: Track matches to transactions

### **Performance Monitoring**
- **Load Times**: Monitor app performance
- **Error Tracking**: Catch and fix issues
- **API Response Times**: Backend performance
- **User Experience**: Track user satisfaction

## Support & Maintenance

### **Regular Updates**
- **Product Inventory**: Keep product data fresh
- **User Management**: Monitor and moderate users
- **Security Updates**: Keep dependencies current
- **Feature Enhancements**: Add new functionality

### **Troubleshooting**
- **API Issues**: Check backend connectivity
- **User Problems**: Handle support requests
- **Performance**: Monitor and optimize
- **Security**: Regular security audits

## Future Enhancements

### **Planned Features**
- **Video Product Previews**: Enhanced product display
- **AI Recommendations**: Smart product suggestions
- **Social Features**: User reviews and ratings
- **Advanced Filters**: More detailed search options

### **Technical Improvements**
- **PWA Support**: Offline functionality
- **Push Notifications**: Real-time updates
- **Advanced Analytics**: Detailed user insights
- **Multi-language**: International support

---

## 🚀 **Ready to Launch!**

Your Tinder-style tech marketplace is now ready! Users can:
1. **Discover** tech devices through intuitive swiping
2. **Connect** with verified sellers
3. **Transact** securely with escrow protection
4. **Chat** directly with sellers

The admin backend provides complete control over products, users, and transactions, ensuring a safe and moderated marketplace experience.

**Next Steps:**
1. Deploy the frontend to your hosting platform
2. Configure the admin backend API endpoints
3. Test the complete user flow
4. Launch and monitor user engagement

Happy swiping! 📱✨
