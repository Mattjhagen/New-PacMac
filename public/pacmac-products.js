/**
 * PacMac Products Integration
 * This script fetches products from the admin portal and displays them on the main website
 * 
 * Usage:
 * 1. Include this script in your main website
 * 2. Call PacMacProducts.init() to start fetching and displaying products
 * 3. Products will be displayed in elements with class 'pacmac-products-container'
 */

class PacMacProducts {
  constructor() {
    this.adminUrl = 'https://admin.pacmacmobile.com'; // Update this to your admin portal URL
    this.products = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the product integration
   * @param {Object} options - Configuration options
   * @param {string} options.adminUrl - URL of the admin portal (optional)
   * @param {string} options.containerSelector - CSS selector for product containers (default: '.pacmac-products-container')
   * @param {number} options.maxProducts - Maximum number of products to display (default: 12)
   * @param {string} options.layout - Layout type: 'grid' or 'list' (default: 'grid')
   */
  async init(options = {}) {
    if (this.isInitialized) {
      console.warn('PacMacProducts already initialized');
      return;
    }

    this.config = {
      adminUrl: options.adminUrl || this.adminUrl,
      containerSelector: options.containerSelector || '.pacmac-products-container',
      maxProducts: options.maxProducts || 12,
      layout: options.layout || 'grid',
      ...options
    };

    try {
      await this.fetchProducts();
      this.renderProducts();
      this.isInitialized = true;
      console.log(`PacMacProducts initialized with ${this.products.length} products`);
    } catch (error) {
      console.error('Failed to initialize PacMacProducts:', error);
      this.showError('Failed to load products. Please try again later.');
    }
  }

  /**
   * Fetch products from the admin portal
   */
  async fetchProducts() {
    try {
      const response = await fetch(`${this.config.adminUrl}/api/public/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.products = Array.isArray(data) ? data.slice(0, this.config.maxProducts) : [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Render products in the specified containers
   */
  renderProducts() {
    const containers = document.querySelectorAll(this.config.containerSelector);
    
    if (containers.length === 0) {
      console.warn(`No containers found with selector: ${this.config.containerSelector}`);
      return;
    }

    containers.forEach(container => {
      if (this.products.length === 0) {
        container.innerHTML = this.getNoProductsHTML();
        return;
      }

      const productsHTML = this.products.map(product => this.getProductCardHTML(product)).join('');
      container.innerHTML = `
        <div class="pacmac-products-grid ${this.config.layout === 'list' ? 'pacmac-products-list' : ''}">
          ${productsHTML}
        </div>
      `;

      // Add click handlers for product cards
      this.addProductClickHandlers(container);
    });
  }

  /**
   * Generate HTML for a single product card
   */
  getProductCardHTML(product) {
    const price = this.formatPrice(product.price);
    const imageUrl = product.imageUrl || product.image || this.getDefaultImage(product);
    
    return `
      <div class="pacmac-product-card" data-product-id="${product.id}">
        <div class="pacmac-product-image">
          <img src="${imageUrl}" alt="${product.name}" loading="lazy" />
          <div class="pacmac-product-overlay">
            <button class="pacmac-product-btn" onclick="PacMacProducts.handleProductClick('${product.id}')">
              View Details
            </button>
          </div>
        </div>
        <div class="pacmac-product-info">
          <h3 class="pacmac-product-name">${product.name}</h3>
          <p class="pacmac-product-brand">${product.brand} ${product.model}</p>
          <div class="pacmac-product-price">${price}</div>
          ${product.description ? `<p class="pacmac-product-description">${this.truncateText(product.description, 100)}</p>` : ''}
          ${this.getSpecsHTML(product.specs)}
          <div class="pacmac-product-stock">
            ${product.stockCount > 0 ? 
              `<span class="pacmac-stock-badge in-stock">In Stock (${product.stockCount})</span>` : 
              `<span class="pacmac-stock-badge out-of-stock">Out of Stock</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for product specifications
   */
  getSpecsHTML(specs) {
    if (!specs || typeof specs !== 'object') return '';
    
    const specItems = [];
    if (specs.storage) specItems.push(`<span class="pacmac-spec-item">${specs.storage}</span>`);
    if (specs.memory) specItems.push(`<span class="pacmac-spec-item">${specs.memory}</span>`);
    if (specs.display) specItems.push(`<span class="pacmac-spec-item">${specs.display}</span>`);
    
    return specItems.length > 0 ? 
      `<div class="pacmac-product-specs">${specItems.join(' • ')}</div>` : '';
  }

  /**
   * Get default image for products without images
   */
  getDefaultImage(product) {
    const brand = product.brand?.toLowerCase() || 'phone';
    return `https://via.placeholder.com/300x300/cccccc/666666?text=${encodeURIComponent(brand)}`;
  }

  /**
   * Format price as currency
   */
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  /**
   * Truncate text to specified length
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Get HTML for no products state
   */
  getNoProductsHTML() {
    return `
      <div class="pacmac-no-products">
        <div class="pacmac-no-products-icon">📱</div>
        <h3>No Products Available</h3>
        <p>Check back soon for new arrivals!</p>
      </div>
    `;
  }

  /**
   * Get HTML for error state
   */
  getErrorHTML(message) {
    return `
      <div class="pacmac-error">
        <div class="pacmac-error-icon">⚠️</div>
        <h3>Unable to Load Products</h3>
        <p>${message}</p>
        <button onclick="PacMacProducts.refresh()" class="pacmac-retry-btn">Try Again</button>
      </div>
    `;
  }

  /**
   * Show error message in containers
   */
  showError(message) {
    const containers = document.querySelectorAll(this.config.containerSelector);
    containers.forEach(container => {
      container.innerHTML = this.getErrorHTML(message);
    });
  }

  /**
   * Add click handlers to product cards
   */
  addProductClickHandlers(container) {
    const cards = container.querySelectorAll('.pacmac-product-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.pacmac-product-btn')) {
          const productId = card.dataset.productId;
          this.handleProductClick(productId);
        }
      });
    });
  }

  /**
   * Handle product card click
   */
  handleProductClick(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Dispatch custom event for main website to handle
    const event = new CustomEvent('pacmacProductClick', {
      detail: { product, productId }
    });
    document.dispatchEvent(event);

    // Default behavior: scroll to product details or show modal
    console.log('Product clicked:', product);
  }

  /**
   * Refresh products
   */
  async refresh() {
    try {
      await this.fetchProducts();
      this.renderProducts();
    } catch (error) {
      console.error('Failed to refresh products:', error);
      this.showError('Failed to refresh products. Please try again later.');
    }
  }

  /**
   * Get current products
   */
  getProducts() {
    return this.products;
  }

  /**
   * Get product by ID
   */
  getProduct(id) {
    return this.products.find(p => p.id === id);
  }
}

// Create global instance
window.PacMacProducts = new PacMacProducts();

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-initialize with default settings
    window.PacMacProducts.init();
  });
} else {
  // DOM is already ready
  window.PacMacProducts.init();
}
