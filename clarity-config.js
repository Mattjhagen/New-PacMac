// Microsoft Clarity Configuration for PacMac Marketplace
// This file contains the Clarity setup and initialization

// Clarity Project ID - Replace with your actual project ID from Clarity dashboard
const CLARITY_PROJECT_ID = "YOUR_CLARITY_PROJECT_ID"; // Replace with actual project ID

// Initialize Microsoft Clarity
function initializeClarity() {
  // Check if Clarity is already loaded
  if (window.clarity) {
    console.log('✅ Clarity already initialized');
    return;
  }

  // Load Clarity script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = `
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
  `;
  
  document.head.appendChild(script);
  
  console.log('✅ Microsoft Clarity initialized for PacMac Marketplace');
}

// Identify user for Clarity tracking
function identifyUser(userId, sessionId = null, pageId = null, friendlyName = null) {
  if (window.clarity) {
    window.clarity('identify', userId, sessionId, pageId, friendlyName);
    console.log('✅ User identified in Clarity:', userId);
  }
}

// Set custom tags for Clarity
function setClarityTag(key, value) {
  if (window.clarity) {
    window.clarity('set', key, value);
    console.log('✅ Clarity tag set:', key, '=', value);
  }
}

// Track custom events
function trackClarityEvent(eventName) {
  if (window.clarity) {
    window.clarity('event', eventName);
    console.log('✅ Clarity event tracked:', eventName);
  }
}

// Set cookie consent
function setClarityConsent(consent = true) {
  if (window.clarity) {
    window.clarity('consent', consent);
    console.log('✅ Clarity consent set:', consent);
  }
}

// Upgrade session for priority recording
function upgradeClaritySession(reason) {
  if (window.clarity) {
    window.clarity('upgrade', reason);
    console.log('✅ Clarity session upgraded:', reason);
  }
}

// PacMac-specific Clarity tracking functions
const PacMacClarity = {
  // Track user authentication
  trackLogin: function(userId, userType = 'customer') {
    identifyUser(userId, null, null, userType);
    setClarityTag('user_type', userType);
    trackClarityEvent('user_login');
  },

  // Track product views
  trackProductView: function(productId, productTitle, category) {
    setClarityTag('product_id', productId);
    setClarityTag('product_category', category);
    trackClarityEvent('product_view');
  },

  // Track bidding activity
  trackBid: function(itemId, bidAmount) {
    setClarityTag('bid_item', itemId);
    setClarityTag('bid_amount', bidAmount.toString());
    trackClarityEvent('bid_placed');
  },

  // Track auction wins
  trackAuctionWin: function(itemId, winningBid) {
    setClarityTag('winning_item', itemId);
    setClarityTag('winning_bid', winningBid.toString());
    trackClarityEvent('auction_won');
    upgradeClaritySession('auction_winner');
  },

  // Track cart actions
  trackAddToCart: function(itemId, itemTitle, price) {
    setClarityTag('cart_item', itemId);
    trackClarityEvent('add_to_cart');
  },

  // Track checkout process
  trackCheckoutStart: function(cartValue, itemCount) {
    setClarityTag('checkout_value', cartValue.toString());
    setClarityTag('checkout_items', itemCount.toString());
    trackClarityEvent('checkout_started');
    upgradeClaritySession('checkout_process');
  },

  // Track payment completion
  trackPaymentComplete: function(transactionId, amount, paymentMethod) {
    setClarityTag('transaction_id', transactionId);
    setClarityTag('payment_method', paymentMethod);
    trackClarityEvent('payment_completed');
    upgradeClaritySession('payment_success');
  },

  // Track admin actions
  trackAdminAction: function(action, details = '') {
    setClarityTag('admin_action', action);
    trackClarityEvent('admin_' + action);
  },

  // Track auto-poster activity
  trackAutoPost: function(productCount) {
    setClarityTag('auto_post_count', productCount.toString());
    trackClarityEvent('auto_poster_activity');
  },

  // Track page navigation
  trackPageView: function(pageName, userType = 'customer') {
    setClarityTag('page_name', pageName);
    setClarityTag('user_type', userType);
    trackClarityEvent('page_view');
  }
};

// Initialize Clarity when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if we have a valid project ID
  if (CLARITY_PROJECT_ID && CLARITY_PROJECT_ID !== "YOUR_CLARITY_PROJECT_ID") {
    initializeClarity();
    
    // Set cookie consent (assuming users consent to analytics)
    setTimeout(() => {
      setClarityConsent(true);
    }, 1000);
    
    // Track initial page view
    const pageName = document.title || window.location.pathname;
    PacMacClarity.trackPageView(pageName);
  } else {
    console.log('⚠️ Clarity not initialized - Please set your CLARITY_PROJECT_ID');
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PacMacClarity, initializeClarity, identifyUser, setClarityTag, trackClarityEvent };
}
