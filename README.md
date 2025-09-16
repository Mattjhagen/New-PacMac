# 📱 PacMac Marketplace - Proximity-Based Trading Platform

## 🎯 **Concept Overview**

PacMac Marketplace is a **proximity-based trading platform** that combines the best features of eBay, Tinder, and Facebook Marketplace. Users can discover, bid on, and purchase items in their local area through an intuitive swipe-based interface with secure escrow protection.

### **Core Concept:**
- **Swipe Right (💰)**: Bid $0.05 on an item
- **Heart (❤️)**: Buy item for $1.00
- **Swipe Left (❌)**: Pass on the item
- **Location-Based**: Items are filtered by proximity to user
- **Escrow Protection**: All payments held securely until transaction completion

---

## 🏗️ **System Architecture**

### **Frontend:**
- **HTML/CSS/JavaScript**: Vanilla implementation for maximum compatibility
- **OAuth Splash Screen**: Professional authentication flow with Google OAuth
- **Swipe Interface**: Tinder-like card-based item discovery
- **Real-time Chat**: In-app messaging for buyer-seller communication
- **Responsive Design**: Mobile-first approach with desktop optimization

### **Backend:**
- **Node.js + Express**: RESTful API server
- **Google OAuth**: Passport.js integration for user authentication
- **Stripe Integration**: Payment processing with escrow system
- **Session Management**: Express-session for user state
- **In-Memory Database**: marketplaceData object for development

### **Payment System:**
- **Stripe**: Payment processing and escrow
- **Fee Structure**: $3.00 flat fee + 3% of transaction amount
- **Fund Holding**: 24 hours for first 5 transactions, 15 minutes after
- **Payout Threshold**: $50 minimum before payout initiation

---

## 🔄 **User Flow & Experience**

### **1. Initial Access**
```
User visits site → OAuth Splash Screen → Authentication → Main Marketplace
```

**OAuth Splash Screen Features:**
- Beautiful gradient background (purple to blue)
- Professional welcome section with feature highlights
- Google OAuth integration with loading states
- Demo mode for testing without authentication
- Responsive design for all devices

### **2. Authentication Options**
- **Google OAuth**: Full authentication with profile data
- **Demo Mode**: Instant access for testing and exploration
- **Session Persistence**: Automatic login on return visits

### **3. Main Marketplace Interface**
```
Header Navigation → Swipe Area → Sidebar (Profile/Transactions)
```

**Swipe Area:**
- Large item card with image, title, price, description
- Location display with distance from user
- Three action buttons: Pass (❌), Bid (💰), Buy (❤️)

**Sidebar:**
- User profile with avatar and stats
- Active transactions with status
- Recent activity feed
- Quick access to listings and profile

### **4. Transaction Flow**

#### **Bidding Process:**
1. User swipes right on item → Bid $0.05
2. Stripe payment intent created ($0.05 + $3.00 + $0.00 = $3.05)
3. Payment processed and held in escrow
4. Transaction recorded with 24-hour countdown
5. Chat and meetup options become available

#### **Purchase Process:**
1. User hearts item → Buy $1.00
2. Stripe payment intent created ($1.00 + $3.00 + $0.03 = $4.03)
3. Payment processed and held in escrow
4. Transaction recorded with 24-hour countdown
5. Chat and meetup options become available
6. Item marked as sold

#### **Transaction Completion:**
1. Buyer and seller coordinate meetup via chat
2. Physical exchange of item and verification
3. Transaction confirmed in app
4. Funds released based on user history:
   - **First 5 transactions**: 24-hour hold
   - **After 5 transactions**: 15-minute hold
5. Seller receives payout (minus platform fees)

---

## 💰 **Payment & Fee Structure**

### **Fee Calculation:**
```javascript
const flatFee = 3.00; // $3 flat fee
const percentageFee = amount * 0.03; // 3% of transaction
const totalFee = flatFee + percentageFee;
const totalAmount = amount + totalFee;
```

### **Examples:**
- **Bid $0.05**: Total = $3.05 ($0.05 + $3.00 + $0.00)
- **Purchase $1.00**: Total = $4.03 ($1.00 + $3.00 + $0.03)
- **Item $10.00**: Total = $13.30 ($10.00 + $3.00 + $0.30)
- **Item $100.00**: Total = $106.00 ($100.00 + $3.00 + $3.00)

### **Fund Holding Periods:**
- **New Users (First 5 transactions)**: 24-hour hold
- **Established Users**: 15-minute hold
- **Payout Threshold**: $50 minimum before payout initiation

---

## 🔐 **Security & Verification**

### **User Verification:**
- **Age Verification**: 18+ (21+ in some states)
- **Photo ID Upload**: Required after $50 payout threshold
- **Address Verification**: Real address confirmation
- **Social Security**: Last 4 digits verification
- **Device Tracking**: IMEI, serial number, device ID tracking

### **Content Moderation:**
- **Prohibited Items**: No pets, animals, or living things
- **Keyword Filtering**: Automatic content screening
- **User Reporting**: Built-in dispute system
- **Device Banning**: Lifetime bans for violations

### **Dispute Resolution:**
- **In-App Disputes**: Built-in dispute system
- **Email Support**: disputes@pacmacmobile.com
- **Phone Support**: (947) 225-4327
- **Automated System**: AI-powered dispute handling

---

## 🛠️ **Technical Implementation**

### **File Structure:**
```
/Users/matty/New-PacMac/
├── marketplace.html          # Main marketplace interface
├── server.js                 # Node.js backend server
├── intro-splash.html         # Introduction splash screen
├── index.html               # Redirects to marketplace
├── config.js                # Configuration settings
├── package.json             # Dependencies
├── env.example              # Environment variables template
├── render.yaml              # Deployment configuration
├── test-stripe-fees.js      # Fee calculation tests
├── test-stripe-integration.js # Stripe integration tests
└── Products/                # Product images
    ├── iPhone-15.jpg
    ├── iPadAir11.jpg
    └── ...
```

### **Key Dependencies:**
```json
{
  "express": "^4.18.2",
  "stripe": "^14.0.0",
  "passport": "^0.6.0",
  "passport-google-oauth20": "^2.0.0",
  "express-session": "^1.17.3",
  "@sendgrid/mail": "^8.1.0"
}
```

### **Environment Variables:**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-session-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Contact Information
DISPUTE_EMAIL=disputes@pacmacmobile.com
DISPUTE_PHONE=(947) 225-4327

# Server
PORT=3000
NODE_ENV=production
```

---

## 🚀 **API Endpoints**

### **Authentication:**
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback handler
- `GET /auth/logout` - User logout
- `GET /auth/user` - Get current user data

### **Marketplace:**
- `GET /marketplace` - Serve marketplace interface
- `GET /api/marketplace/items` - Fetch items by location/category
- `POST /api/marketplace/items` - Create new item listing
- `POST /api/marketplace/bid` - Place bid on item
- `POST /api/marketplace/purchase` - Purchase item
- `POST /api/marketplace/confirm-payment` - Confirm payment completion

### **Transactions:**
- `GET /api/marketplace/transactions/:userId` - Get user transactions
- `POST /api/marketplace/chat` - Send chat message
- `GET /api/marketplace/chat/:transactionId` - Get chat history
- `POST /api/marketplace/dispute` - Create dispute

### **Verification:**
- `POST /api/verify/age` - Verify user age
- `POST /api/verify/photo-id` - Upload photo ID
- `POST /api/verify/address` - Verify address
- `POST /api/verify/social` - Verify SSN last 4
- `POST /api/device/register` - Register device ID

### **System:**
- `GET /health` - Health check endpoint
- `GET /api/health` - API health check
- `POST /api/moderate/content` - Content moderation
- `GET /api/payout/status` - Check payout eligibility

---

## 🎨 **Design System**

### **Color Palette:**
```css
:root {
  --bg: #000;                    /* Dark background */
  --fg: #eaeaea;                 /* Light text */
  --muted: #9aa0a6;              /* Muted text */
  --accent: #6aa7ff;             /* Primary blue */
  --accent-2: #8affd1;           /* Secondary green */
  --success: #10b981;            /* Success green */
  --warning: #f59e0b;            /* Warning orange */
  --error: #ef4444;              /* Error red */
  --card: #0b0b0b;               /* Card background */
  --ring: #1f2937;               /* Border color */
}
```

### **Typography:**
- **Font Family**: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Segoe UI, Roboto, Helvetica, Arial, sans-serif
- **Font Weight**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Line Height**: 1.45 (body), 1.2 (headings)

### **Spacing System:**
- **Base Unit**: 4px
- **Common Spacing**: 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
- **Border Radius**: 8px (small), 12px (medium), 18px (large), 50% (circular)

### **Component Styles:**
- **Cards**: Dark background with subtle borders and shadows
- **Buttons**: Rounded corners with hover effects and transitions
- **Forms**: Clean inputs with focus states and validation
- **Modals**: Overlay with backdrop blur and smooth animations

---

## 📱 **User Interface Components**

### **OAuth Splash Screen:**
- **Gradient Background**: Purple to blue gradient
- **Welcome Section**: Large title with feature highlights
- **Auth Card**: Clean white card with Google OAuth button
- **Demo Mode**: Alternative authentication for testing
- **Responsive Design**: Mobile-first with desktop optimization

### **Main Marketplace:**
- **Header Navigation**: Brand logo and user menu
- **Swipe Area**: Large item card with action buttons
- **Sidebar**: User profile, transactions, and activity
- **Modals**: Add item, chat, verification, and settings

### **Item Cards:**
- **Image Display**: Product photo with fallback
- **Title & Price**: Clear item information
- **Description**: Detailed item description
- **Location**: Distance from user with map icon
- **Action Buttons**: Pass, Bid, and Buy options

---

## 🔧 **Development Setup**

### **Prerequisites:**
- Node.js 18+
- npm or yarn
- Google OAuth credentials
- Stripe account and API keys

### **Installation:**
```bash
# Clone repository
git clone https://github.com/Mattjhagen/New-PacMac.git
cd New-PacMac

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your API keys

# Start development server
npm start
```

### **Development Commands:**
```bash
npm start          # Start server on port 3000
npm test           # Run test suite
npm run dev        # Start with nodemon for development
```

### **Testing:**
```bash
# Test Stripe fee calculations
node test-stripe-fees.js

# Test Stripe integration
node test-stripe-integration.js
```

---

## 🚀 **Deployment**

### **Render.com Deployment:**
- **Platform**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check**: `/health`
- **Environment Variables**: Set in Render dashboard

### **Environment Setup:**
1. Set all required environment variables in Render
2. Configure Google OAuth redirect URIs
3. Set up Stripe webhook endpoints
4. Configure domain and SSL certificates

### **Production Checklist:**
- [ ] Environment variables configured
- [ ] Google OAuth credentials set
- [ ] Stripe keys configured
- [ ] Domain and SSL setup
- [ ] Health checks working
- [ ] Error logging configured

---

## 📊 **Data Models**

### **User Object:**
```javascript
{
  id: "user_123",
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://...",
  location: {
    city: "New York",
    state: "NY",
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  ageVerified: true,
  identityVerified: false,
  totalEarnings: 0,
  transactionCount: 0,
  rating: 5.0,
  createdAt: "2024-01-01T00:00:00Z"
}
```

### **Item Object:**
```javascript
{
  id: "item_123",
  title: "iPhone 15 Pro Max",
  description: "Like new condition...",
  price: 1000,
  image: "https://...",
  category: "electronics",
  condition: "like_new",
  location: {
    city: "New York",
    state: "NY",
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  seller: {
    id: "user_456",
    name: "Jane Smith",
    rating: 4.8
  },
  status: "active",
  bids: [],
  createdAt: "2024-01-01T00:00:00Z"
}
```

### **Transaction Object:**
```javascript
{
  id: "txn_123",
  type: "purchase", // or "bid"
  itemId: "item_123",
  itemTitle: "iPhone 15 Pro Max",
  buyerId: "user_123",
  buyerName: "John Doe",
  sellerId: "user_456",
  sellerName: "Jane Smith",
  amount: 1000,
  flatFee: 3.00,
  percentageFee: 30.00,
  totalFee: 33.00,
  totalAmount: 1033.00,
  status: "pending_payment",
  paymentIntentId: "pi_123",
  createdAt: "2024-01-01T00:00:00Z",
  countdownEnd: "2024-01-02T00:00:00Z",
  chatEnabled: true,
  meetupLocation: null
}
```

---

## 🔮 **Future Enhancements**

### **Phase 2 Features:**
- **Real-time Location**: GPS-based proximity matching
- **Push Notifications**: Transaction updates and new items
- **Advanced Search**: Filters by price, category, distance
- **User Reviews**: Rating system for buyers and sellers
- **Image Upload**: Direct photo upload for listings
- **Payment Methods**: Multiple payment options beyond Stripe

### **Phase 3 Features:**
- **Mobile App**: Native iOS and Android applications
- **AI Recommendations**: Machine learning for item suggestions
- **Social Features**: User profiles and social connections
- **Analytics Dashboard**: User and transaction analytics
- **Multi-language**: Internationalization support
- **Advanced Moderation**: AI-powered content screening

### **Technical Improvements:**
- **Database Migration**: Move from in-memory to PostgreSQL/MongoDB
- **Caching Layer**: Redis for improved performance
- **CDN Integration**: CloudFlare for static assets
- **Monitoring**: Application performance monitoring
- **Testing**: Comprehensive test suite with Jest
- **CI/CD**: Automated deployment pipeline

---

## 📞 **Support & Contact**

### **Technical Support:**
- **Email**: support@pacmacmobile.com
- **GitHub**: https://github.com/Mattjhagen/New-PacMac
- **Documentation**: This README file

### **Dispute Resolution:**
- **Email**: disputes@pacmacmobile.com
- **Phone**: (947) 225-4327
- **In-App**: Built-in dispute system

### **Business Inquiries:**
- **Email**: business@pacmacmobile.com
- **Partnership**: partnerships@pacmacmobile.com

---

## 📄 **Legal & Compliance**

### **Terms of Service:**
- Users must be 18+ (21+ in some states)
- No pets, animals, or living things allowed
- Device tracking for safety and consistency
- Lifetime device bans for violations
- Platform fees: $3 + 3% per transaction

### **Privacy Policy:**
- Google OAuth for authentication
- Device ID, IMEI, serial number tracking
- Purchase history for algorithm training
- Cookie collection for user experience
- Data retention and deletion policies

### **Payment Terms:**
- Stripe escrow for all transactions
- 24-hour hold for first 5 transactions
- 15-minute hold for established users
- $50 minimum payout threshold
- Identity verification required for payouts

---

## 🎯 **Success Metrics**

### **Key Performance Indicators:**
- **User Acquisition**: New user registrations
- **Transaction Volume**: Total transactions processed
- **Revenue**: Platform fees collected
- **User Retention**: Monthly active users
- **Transaction Success Rate**: Completed vs. cancelled transactions
- **Average Transaction Value**: Mean transaction amount
- **Geographic Coverage**: Cities and regions served

### **Technical Metrics:**
- **Uptime**: Server availability percentage
- **Response Time**: API endpoint performance
- **Error Rate**: Failed requests percentage
- **Payment Success Rate**: Stripe transaction success
- **Authentication Success Rate**: OAuth completion rate

---

**Built with ❤️ by the PacMac Mobile team**

*Last Updated: January 2025*
*Version: 1.0.0*
*Status: Production Ready*