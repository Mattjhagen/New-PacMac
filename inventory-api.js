/**
 * PacMac Mobile Inventory API Integration
 * Handles communication between frontend and backend inventory management system
 */

class InventoryAPI {
  constructor() {
    this.baseURL = window.location.origin;
    this.products = [];
    this.lastSync = null;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch all products from the API
   * @returns {Promise<Array>} Array of products
   */
  async fetchProducts() {
    try {
      // Check cache first
      const cacheKey = 'products';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('📦 Using cached products');
        return cached;
      }

      console.log('🔄 Fetching products from API...');
      const response = await fetch(`${this.baseURL}/api/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.products = data.products;
        this.lastSync = new Date();
        this.setCache(cacheKey, this.products);
        console.log(`✅ Loaded ${this.products.length} products from API`);
        return this.products;
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      
      // Fallback to static products if API fails
      console.log('🔄 Falling back to static products...');
      return this.getStaticProducts();
    }
  }

  /**
   * Fetch a single product by ID
   * @param {string} productId - The product ID
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  async fetchProduct(productId) {
    try {
      // Check cache first
      const cacheKey = `product_${productId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(`${this.baseURL}/api/products/${productId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.setCache(cacheKey, data.product);
        return data.product;
      } else {
        throw new Error(data.error || 'Failed to fetch product');
      }
    } catch (error) {
      console.error(`❌ Failed to fetch product ${productId}:`, error);
      
      // Fallback to static products
      const staticProducts = this.getStaticProducts();
      return staticProducts.find(p => p.id === productId) || null;
    }
  }

  /**
   * Update product stock (for order processing)
   * @param {string} productId - The product ID
   * @param {number} quantity - New stock quantity
   * @returns {Promise<boolean>} Success status
   */
  async updateStock(productId, quantity) {
    try {
      const response = await fetch(`${this.baseURL}/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update local cache
        const product = this.products.find(p => p.id === productId);
        if (product) {
          product.stockCount = quantity;
          product.inStock = quantity > 0;
        }
        
        // Clear cache to force refresh
        this.clearCache();
        console.log(`✅ Updated stock for ${productId}: ${quantity} units`);
        return true;
      } else {
        throw new Error(data.error || 'Failed to update stock');
      }
    } catch (error) {
      console.error(`❌ Failed to update stock for ${productId}:`, error);
      return false;
    }
  }

  /**
   * Sync inventory with backend admin portal
   * @returns {Promise<boolean>} Success status
   */
  async syncInventory() {
    try {
      console.log('🔄 Syncing inventory with backend...');
      const response = await fetch(`${this.baseURL}/api/sync-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Clear cache to force refresh
        this.clearCache();
        console.log('✅ Inventory synced successfully');
        return true;
      } else {
        throw new Error(data.error || 'Failed to sync inventory');
      }
    } catch (error) {
      console.error('❌ Failed to sync inventory:', error);
      return false;
    }
  }

  /**
   * Get products with filtering and search
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Filtered products
   */
  async getProducts(filters = {}) {
    let products = await this.fetchProducts();
    
    // Apply filters
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    if (filters.inStock !== undefined) {
      products = products.filter(p => p.inStock === filters.inStock);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.minPrice !== undefined) {
      products = products.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      products = products.filter(p => p.price <= filters.maxPrice);
    }
    
    return products;
  }

  /**
   * Get static products as fallback
   * @returns {Array} Static products array
   */
  getStaticProducts() {
    return [
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
  }

  /**
   * Cache management methods
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    try {
      const response = await fetch(`${this.baseURL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Clear cache to force refresh
        this.clearCache();
        console.log('✅ Product created successfully:', data.product);
        return data.product;
      } else {
        throw new Error(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('❌ Failed to create product:', error);
      throw error;
    }
  }

  /**
   * Update an existing product
   * @param {string} productId - Product ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Clear cache to force refresh
        this.clearCache();
        console.log('✅ Product updated successfully:', data.product);
        return data.product;
      } else {
        throw new Error(data.error || 'Failed to update product');
      }
    } catch (error) {
      console.error(`❌ Failed to update product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteProduct(productId) {
    try {
      const response = await fetch(`${this.baseURL}/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Clear cache to force refresh
        this.clearCache();
        console.log('✅ Product deleted successfully:', productId);
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error(`❌ Failed to delete product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get inventory statistics
   * @returns {Object} Inventory statistics
   */
  async getInventoryStats() {
    const products = await this.fetchProducts();
    
    const stats = {
      totalProducts: products.length,
      inStockProducts: products.filter(p => p.inStock).length,
      outOfStockProducts: products.filter(p => !p.inStock).length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stockCount), 0),
      categories: {}
    };
    
    // Count by category
    products.forEach(product => {
      const category = product.category || 'uncategorized';
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    });
    
    return stats;
  }
}

// Create global instance
window.inventoryAPI = new InventoryAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InventoryAPI;
}
