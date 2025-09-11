// Configuration for PacMac Mobile
const CONFIG = {
    // API endpoints
    apiBaseUrl: window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : 'https://admin.pacmacmobile.com/api',
    
    // Product display settings
    productsPerPage: 12,
    showOutOfStock: true,
    
    // Image settings
    defaultImage: '/images/no-image.png',
    imageQuality: 'high',
    
    // Display settings
    currency: 'USD',
    currencySymbol: '$',
    
    // Features
    enableSearch: true,
    enableFilters: true,
    enableSorting: true
};

// Make config globally available
window.CONFIG = CONFIG;