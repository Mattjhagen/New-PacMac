# Manual Fix for Missing Scripts

If the emergency fix button doesn't work, here's how to manually fix the missing scripts:

## The Problem
The main site (pacmacmobile.com) is trying to load these scripts that don't exist:
- `config.js`
- `inventory-api.js`

## Manual Solution

### Step 1: Go to the New-PacMac Repository
1. Go to: https://github.com/Mattjhagen/New-PacMac
2. Click "Add file" → "Create new file"

### Step 2: Create config.js
1. Name the file: `config.js`
2. Add this content:

```javascript
// Configuration for PacMac Mobile
const CONFIG = {
    // API endpoints
    apiBaseUrl: 'https://admin.pacmacmobile.com/api',
    
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
```

3. Click "Commit new file"

### Step 3: Create inventory-api.js
1. Click "Add file" → "Create new file" again
2. Name the file: `inventory-api.js`
3. Add this content:

```javascript
// Inventory API functions for PacMac Mobile
class InventoryAPI {
    constructor() {
        this.baseUrl = window.CONFIG ? window.CONFIG.apiBaseUrl : 'https://admin.pacmacmobile.com/api';
    }
    
    // Get all products
    async getProducts() {
        try {
            const response = await fetch(`${this.baseUrl}/public/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            // Fallback to local PRODUCTS array if it exists
            if (window.PRODUCTS) {
                return window.PRODUCTS;
            }
            return [];
        }
    }
    
    // Get product by ID
    async getProduct(id) {
        try {
            const response = await fetch(`${this.baseUrl}/public/products/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }
    
    // Search products
    async searchProducts(query) {
        const products = await this.getProducts();
        if (!query) return products;
        
        const searchTerm = query.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.model.toLowerCase().includes(searchTerm) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
    
    // Filter products by category
    async getProductsByCategory(category) {
        const products = await this.getProducts();
        if (!category) return products;
        
        return products.filter(product => 
            product.category === category || 
            (product.tags && product.tags.includes(category))
        );
    }
}

// Create global instance
window.inventoryAPI = new InventoryAPI();
```

4. Click "Commit new file"

### Step 4: Wait and Test
1. Wait 5-10 minutes for GitHub Pages to update
2. Go to pacmacmobile.com
3. Products should now display! 🎉

## Alternative: Use the Emergency Fix Button
If you see the red emergency banner in your admin panel, just click the "🔧 FIX MISSING SCRIPTS" button instead of doing this manually.
