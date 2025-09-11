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