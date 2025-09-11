/**
 * PacMac Mobile Admin Integration
 * Handles communication with the backend admin portal
 */

class AdminIntegration {
  constructor() {
    this.adminUrl = 'https://pacmacmobile-admin.vercel.app'; // Backend admin portal URL
    this.apiKey = null; // Will be set when authentication is implemented
  }

  /**
   * Sync inventory with backend admin portal
   * @returns {Promise<boolean>} Success status
   */
  async syncWithBackend() {
    try {
      console.log('🔄 Syncing with backend admin portal...');
      
      // In production, this would make actual API calls to the backend
      // For now, we'll simulate the sync process
      
      // 1. Fetch products from backend admin portal
      const backendProducts = await this.fetchBackendProducts();
      
      // 2. Update local server with backend data
      await this.updateLocalServer(backendProducts);
      
      // 3. Refresh frontend inventory
      await this.refreshFrontendInventory();
      
      console.log('✅ Successfully synced with backend admin portal');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync with backend:', error);
      return false;
    }
  }

  /**
   * Fetch products from backend admin portal
   * @returns {Promise<Array>} Products from backend
   */
  async fetchBackendProducts() {
    try {
      // In production, this would make an actual API call
      // For now, we'll return mock data that matches the backend structure
      const mockBackendProducts = [
        {
          id: 'pm-iphone15',
          name: 'iPhone 15',
          brand: 'Apple',
          model: 'iPhone 15',
          price: 975.00,
          description: 'Latest iPhone with USB-C, Dynamic Island, and 48MP camera',
          imageUrl: 'products/iPhone-15.jpg',
          specs: {
            display: '6.1" Super Retina XDR',
            processor: 'A16 Bionic',
            memory: '6GB RAM',
            storage: '128GB',
            camera: '48MP Main + 12MP Ultra Wide',
            battery: 'Up to 20 hours video playback',
            os: 'iOS 17',
            connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
            colors: 'Black, Blue, Green, Yellow, Pink'
          },
          inStock: true,
          stockCount: 15,
          category: 'main',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pm-iphone15plus',
          name: 'iPhone 15 Plus',
          brand: 'Apple',
          model: 'iPhone 15 Plus',
          price: 1097.00,
          description: 'Larger display with all iPhone 15 features and extended battery life',
          imageUrl: 'products/iPhone15Plus.jpg',
          specs: {
            display: '6.7" Super Retina XDR',
            processor: 'A16 Bionic',
            memory: '6GB RAM',
            storage: '128GB',
            camera: '48MP Main + 12MP Ultra Wide',
            battery: 'Up to 26 hours video playback',
            os: 'iOS 17',
            connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
            colors: 'Black, Blue, Green, Yellow, Pink'
          },
          inStock: true,
          stockCount: 8,
          category: 'main',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pm-ipad-air',
          name: 'iPad Air 11"',
          brand: 'Apple',
          model: 'iPad Air 11"',
          price: 610.00,
          description: 'Powerful iPad with M2 chip and Liquid Retina display',
          imageUrl: 'products/iPadAir11.jpg',
          specs: {
            display: '11" Liquid Retina',
            processor: 'M2',
            memory: '8GB RAM',
            storage: '64GB',
            camera: '12MP Wide',
            battery: 'Up to 10 hours',
            os: 'iPadOS 17',
            connectivity: 'Wi-Fi 6E, Bluetooth 5.3',
            colors: 'Space Gray, Blue, Pink, Purple'
          },
          inStock: true,
          stockCount: 12,
          category: 'main',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pm-samsung-s25',
          name: 'Samsung Galaxy S25',
          brand: 'Samsung',
          model: 'Galaxy S25',
          price: 800.00,
          description: 'Latest Samsung flagship with AI-powered features',
          imageUrl: 'products/SamS25.jpg',
          specs: {
            display: '6.2" Dynamic AMOLED 2X',
            processor: 'Snapdragon 8 Gen 4',
            memory: '8GB RAM',
            storage: '128GB',
            camera: '50MP Main + 12MP Ultra Wide',
            battery: '4000mAh',
            os: 'Android 15',
            connectivity: '5G, Wi-Fi 7, Bluetooth 5.4',
            colors: 'Black, White, Purple'
          },
          inStock: true,
          stockCount: 6,
          category: 'main',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pm-samsung-s25-plus',
          name: 'Samsung Galaxy S25 Plus',
          brand: 'Samsung',
          model: 'Galaxy S25 Plus',
          price: 1000.00,
          description: 'Larger Samsung flagship with enhanced features',
          imageUrl: 'products/SamS25Plus.jpg',
          specs: {
            display: '6.7" Dynamic AMOLED 2X',
            processor: 'Snapdragon 8 Gen 4',
            memory: '12GB RAM',
            storage: '256GB',
            camera: '50MP Main + 12MP Ultra Wide + 10MP Telephoto',
            battery: '4900mAh',
            os: 'Android 15',
            connectivity: '5G, Wi-Fi 7, Bluetooth 5.4',
            colors: 'Black, White, Purple'
          },
          inStock: true,
          stockCount: 4,
          category: 'main',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pm-samsung-s25-ultra',
          name: 'Samsung Galaxy S25 Ultra',
          brand: 'Samsung',
          model: 'Galaxy S25 Ultra',
          price: 1200.00,
          description: 'Ultimate Samsung flagship with S Pen and premium features',
          imageUrl: 'products/SamS25Ultra.jpg',
          specs: {
            display: '6.8" Dynamic AMOLED 2X',
            processor: 'Snapdragon 8 Gen 4',
            memory: '12GB RAM',
            storage: '512GB',
            camera: '200MP Main + 50MP Periscope + 12MP Ultra Wide',
            battery: '5000mAh',
            os: 'Android 15',
            connectivity: '5G, Wi-Fi 7, Bluetooth 5.4',
            colors: 'Titanium Black, Titanium Gray, Titanium Violet'
          },
          inStock: true,
          stockCount: 3,
          category: 'main',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pm-apple-watch-10',
          name: 'Apple Watch Series 10',
          brand: 'Apple',
          model: 'Apple Watch Series 10',
          price: 400.00,
          description: 'Latest Apple Watch with advanced health features',
          imageUrl: 'products/AppleWatch10.jpg',
          specs: {
            display: '45mm Always-On Retina',
            processor: 'S10',
            memory: '2GB RAM',
            storage: '32GB',
            camera: 'N/A',
            battery: 'Up to 18 hours',
            os: 'watchOS 10',
            connectivity: 'GPS, Wi-Fi, Bluetooth 5.3',
            colors: 'Midnight, Starlight, Pink, Blue'
          },
          inStock: true,
          stockCount: 20,
          category: 'accessory',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      console.log(`📦 Fetched ${mockBackendProducts.length} products from backend`);
      return mockBackendProducts;
    } catch (error) {
      console.error('❌ Failed to fetch backend products:', error);
      throw error;
    }
  }

  /**
   * Update local server with backend data
   * @param {Array} backendProducts - Products from backend
   */
  async updateLocalServer(backendProducts) {
    try {
      // In production, this would update the local server's database
      // For now, we'll simulate the update
      console.log('🔄 Updating local server with backend data...');
      
      // Convert backend format to frontend format
      const frontendProducts = backendProducts.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        tags: this.generateTags(product),
        img: product.imageUrl,
        description: product.description,
        specs: this.convertSpecs(product.specs),
        inStock: product.inStock,
        stockCount: product.stockCount,
        category: product.category
      }));

      // Update the local server's product data
      // In production, this would make an API call to update the server
      console.log(`✅ Updated local server with ${frontendProducts.length} products`);
      
      return frontendProducts;
    } catch (error) {
      console.error('❌ Failed to update local server:', error);
      throw error;
    }
  }

  /**
   * Refresh frontend inventory
   */
  async refreshFrontendInventory() {
    try {
      console.log('🔄 Refreshing frontend inventory...');
      
      // Trigger a refresh of the frontend inventory
      if (typeof window.inventoryAPI !== 'undefined') {
        await window.inventoryAPI.clearCache();
        await window.inventoryAPI.syncInventory();
      }
      
      // Refresh the product grid
      if (typeof refreshProducts === 'function') {
        await refreshProducts();
      }
      
      console.log('✅ Frontend inventory refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh frontend inventory:', error);
      throw error;
    }
  }

  /**
   * Generate tags from product data
   * @param {Object} product - Product object
   * @returns {Array} Array of tags
   */
  generateTags(product) {
    const tags = [];
    
    // Add connectivity tags
    if (product.specs.connectivity) {
      if (product.specs.connectivity.includes('5G')) tags.push('5G');
      if (product.specs.connectivity.includes('Wi-Fi')) tags.push('Wi-Fi');
    }
    
    // Add storage tags
    if (product.specs.storage) {
      tags.push(product.specs.storage);
    }
    
    // Add processor tags
    if (product.specs.processor) {
      tags.push(product.specs.processor);
    }
    
    // Add display size tags
    if (product.specs.display) {
      const displayMatch = product.specs.display.match(/(\d+\.?\d*")/);
      if (displayMatch) {
        tags.push(displayMatch[1] + ' Display');
      }
    }
    
    // Add category-specific tags
    if (product.category === 'accessory') {
      tags.push('Accessory');
    }
    
    return tags;
  }

  /**
   * Convert backend specs format to frontend format
   * @param {Object} backendSpecs - Backend specs object
   * @returns {Object} Frontend specs object
   */
  convertSpecs(backendSpecs) {
    const frontendSpecs = {};
    
    // Map backend spec keys to frontend format
    const specMapping = {
      display: 'Display',
      processor: 'Chip',
      memory: 'Memory',
      storage: 'Storage',
      camera: 'Camera',
      battery: 'Battery',
      os: 'OS',
      connectivity: 'Connectivity',
      colors: 'Colors'
    };
    
    Object.keys(backendSpecs).forEach(key => {
      const frontendKey = specMapping[key] || key;
      frontendSpecs[frontendKey] = backendSpecs[key];
    });
    
    return frontendSpecs;
  }

  /**
   * Get inventory statistics from backend
   * @returns {Promise<Object>} Inventory statistics
   */
  async getBackendStats() {
    try {
      // In production, this would fetch from the backend API
      const mockStats = {
        totalProducts: 7,
        inStockProducts: 7,
        outOfStockProducts: 0,
        totalValue: 5842.00,
        categories: {
          main: 6,
          accessory: 1
        },
        lastUpdated: new Date().toISOString()
      };
      
      return mockStats;
    } catch (error) {
      console.error('❌ Failed to get backend stats:', error);
      throw error;
    }
  }

  /**
   * Export inventory data for backup
   * @returns {Promise<Object>} Export data
   */
  async exportInventory() {
    try {
      const backendProducts = await this.fetchBackendProducts();
      const stats = await this.getBackendStats();
      
      const exportData = {
        products: backendProducts,
        stats: stats,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      return exportData;
    } catch (error) {
      console.error('❌ Failed to export inventory:', error);
      throw error;
    }
  }
}

// Create global instance
window.adminIntegration = new AdminIntegration();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminIntegration;
}
