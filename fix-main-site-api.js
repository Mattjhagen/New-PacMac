// Fixed version of the main site's JavaScript
// This should replace the problematic initializeProducts function

async function initializeProducts() {
  try {
    console.log('🔄 Initializing products from API...');
    
    // Check if inventoryAPI is available
    if (!window.inventoryAPI) {
      console.error('❌ inventoryAPI not available, using fallback');
      PRODUCTS = FALLBACK_PRODUCTS || [];
      return;
    }
    
    // Try to get products using the correct method
    let products = [];
    
    if (typeof window.inventoryAPI.getProducts === 'function') {
      products = await window.inventoryAPI.getProducts();
    } else if (typeof window.inventoryAPI.fetchProducts === 'function') {
      products = await window.inventoryAPI.fetchProducts();
    } else {
      console.error('❌ No valid product fetching method found');
      products = FALLBACK_PRODUCTS || [];
    }
    
    PRODUCTS = products;
    console.log(`✅ Loaded ${PRODUCTS.length} products`);
    
    // Update the product grid if it exists
    if (typeof updateProductGrid === 'function') {
      updateProductGrid();
    }
    
    // Update any product-related UI elements
    if (typeof updateProductUI === 'function') {
      updateProductUI();
    }
    
    // Show products
    if (typeof showProducts === 'function') {
      showProducts();
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize products:', error);
    // Fallback to static products
    PRODUCTS = FALLBACK_PRODUCTS || [];
    console.log('🔄 Using fallback static products');
    
    // Still try to show products
    if (typeof showProducts === 'function') {
      showProducts();
    }
  }
}

// Function to refresh products from API
async function refreshProducts() {
  try {
    console.log('🔄 Refreshing products from API...');
    
    if (!window.inventoryAPI) {
      console.error('❌ inventoryAPI not available');
      return;
    }
    
    let products = [];
    
    if (typeof window.inventoryAPI.getProducts === 'function') {
      products = await window.inventoryAPI.getProducts();
    } else if (typeof window.inventoryAPI.fetchProducts === 'function') {
      products = await window.inventoryAPI.fetchProducts();
    } else {
      console.error('❌ No valid product fetching method found');
      return;
    }
    
    PRODUCTS = products;
    console.log(`✅ Refreshed ${PRODUCTS.length} products`);
    
    // Update the product grid if it exists
    if (typeof updateProductGrid === 'function') {
      updateProductGrid();
    }
    
    // Update any product-related UI elements
    if (typeof updateProductUI === 'function') {
      updateProductUI();
    }
    
  } catch (error) {
    console.error('❌ Failed to refresh products:', error);
  }
}

// Fallback static products
const FALLBACK_PRODUCTS = [
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
    }
  }
];

// Make sure the functions are available globally
window.initializeProducts = initializeProducts;
window.refreshProducts = refreshProducts;
