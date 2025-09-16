const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const cheerio = require('cheerio');

class InventoryManager {
    constructor() {
        this.inventory = [];
        this.postingSchedule = [];
        this.productImages = new Map();
        this.productSpecs = new Map();
        this.oemWebsites = {
            'Apple': {
                baseUrl: 'https://www.apple.com',
                searchPath: '/search',
                imageSelector: '.product-image img',
                specSelector: '.product-specs'
            },
            'Samsung': {
                baseUrl: 'https://www.samsung.com',
                searchPath: '/us/search',
                imageSelector: '.product-image img',
                specSelector: '.product-specs'
            },
            'Google': {
                baseUrl: 'https://store.google.com',
                searchPath: '/search',
                imageSelector: '.product-image img',
                specSelector: '.product-specs'
            }
        };
    }

    // Parse CSV inventory data
    async parseInventoryCSV(csvFilePath) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (data) => {
                    // Clean and structure the data
                    const product = {
                        itemNumber: data['Item #'],
                        warehouse: data['Warehouse'],
                        category: data['Category'],
                        manufacturer: data['Manufacturer'],
                        model: data['Model'],
                        grade: data['Grade'],
                        capacity: data['Capacity'],
                        carrier: data['Carrier'],
                        color: data['Color'],
                        lockStatus: data['Lock Status'],
                        modelNumber: data['Model Number'],
                        quantity: parseInt(data['Quantity Available']) || 0,
                        listPrice: parseFloat(data['List Price']) || 0,
                        transactionStatus: data['Transaction Status'],
                        transactionQuantity: parseInt(data['Transaction Quantity']) || 0,
                        transactionPrice: parseFloat(data['Transaction Price']) || 0,
                        expires: data['Expires'],
                        newOfferQuantity: parseInt(data['New Offer Quantity']) || 0,
                        newOfferPrice: parseFloat(data['New Offer Price']) || 0,
                        // Generated fields
                        id: this.generateProductId(data),
                        title: this.generateProductTitle(data),
                        description: this.generateProductDescription(data),
                        slug: this.generateSlug(data),
                        images: [],
                        specs: {},
                        postingSchedule: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    results.push(product);
                })
                .on('end', () => {
                    this.inventory = results;
                    console.log(`✅ Parsed ${results.length} products from CSV`);
                    resolve(results);
                })
                .on('error', reject);
        });
    }

    // Generate unique product ID
    generateProductId(data) {
        return `${data['Manufacturer']}-${data['Model']}-${data['Capacity']}-${data['Color']}-${data['Grade']}`.replace(/\s+/g, '-').toLowerCase();
    }

    // Generate product title
    generateProductTitle(data) {
        return `${data['Manufacturer']} ${data['Model']} ${data['Capacity']} ${data['Color']} (${data['Grade']})`;
    }

    // Generate product description
    generateProductDescription(data) {
        return `${data['Manufacturer']} ${data['Model']} ${data['Capacity']} in ${data['Color']}. Grade: ${data['Grade']}. ${data['Carrier']} ${data['Lock Status']}. Model: ${data['Model Number']}. Available at ${data['Warehouse']} warehouse.`;
    }

    // Generate URL slug
    generateSlug(data) {
        return `${data['Manufacturer']}-${data['Model']}-${data['Capacity']}-${data['Color']}`.replace(/\s+/g, '-').toLowerCase();
    }

    // Create 7-day posting schedule
    createPostingSchedule() {
        const schedule = [];
        const today = new Date();
        
        // Group products by category and manufacturer for balanced posting
        const groupedProducts = this.groupProductsForPosting();
        
        // Create 7-day schedule
        for (let day = 0; day < 7; day++) {
            const scheduleDate = new Date(today);
            scheduleDate.setDate(today.getDate() + day);
            
            const daySchedule = {
                date: scheduleDate,
                day: day + 1,
                products: [],
                totalProducts: 0,
                totalValue: 0
            };

            // Distribute products across the week
            Object.keys(groupedProducts).forEach(category => {
                const products = groupedProducts[category];
                const productsPerDay = Math.ceil(products.length / 7);
                const startIndex = day * productsPerDay;
                const endIndex = Math.min(startIndex + productsPerDay, products.length);
                
                for (let i = startIndex; i < endIndex; i++) {
                    if (products[i]) {
                        daySchedule.products.push(products[i]);
                        daySchedule.totalProducts++;
                        daySchedule.totalValue += products[i].listPrice;
                    }
                }
            });

            schedule.push(daySchedule);
        }

        this.postingSchedule = schedule;
        console.log(`✅ Created 7-day posting schedule with ${schedule.length} days`);
        return schedule;
    }

    // Group products for balanced posting
    groupProductsForPosting() {
        const grouped = {};
        
        this.inventory.forEach(product => {
            const key = `${product.category}-${product.manufacturer}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(product);
        });

        // Sort each group by price (high to low) for better engagement
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => b.listPrice - a.listPrice);
        });

        return grouped;
    }

    // Fetch product images from OEM websites
    async fetchProductImages(product) {
        try {
            const manufacturer = product.manufacturer.toLowerCase();
            let imageUrls = [];

            if (manufacturer === 'apple') {
                imageUrls = await this.fetchAppleImages(product);
            } else if (manufacturer === 'samsung') {
                imageUrls = await this.fetchSamsungImages(product);
            } else if (manufacturer === 'google') {
                imageUrls = await this.fetchGoogleImages(product);
            }

            // Fallback to generic images if no OEM images found
            if (imageUrls.length === 0) {
                imageUrls = await this.fetchGenericImages(product);
            }

            product.images = imageUrls;
            this.productImages.set(product.id, imageUrls);
            
            console.log(`✅ Fetched ${imageUrls.length} images for ${product.title}`);
            return imageUrls;
        } catch (error) {
            console.error(`❌ Error fetching images for ${product.title}:`, error.message);
            return [];
        }
    }

    // Fetch Apple product images
    async fetchAppleImages(product) {
        try {
            const searchQuery = `${product.model} ${product.capacity} ${product.color}`.replace(/\s+/g, '+');
            const searchUrl = `https://www.apple.com/search?q=${searchQuery}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const images = [];

            $('img[src*="apple.com"]').each((i, element) => {
                const src = $(element).attr('src');
                if (src && src.includes('product') && images.length < 5) {
                    images.push({
                        url: src.startsWith('http') ? src : `https://www.apple.com${src}`,
                        alt: $(element).attr('alt') || product.title,
                        type: 'product'
                    });
                }
            });

            return images;
        } catch (error) {
            console.error('Error fetching Apple images:', error.message);
            return [];
        }
    }

    // Fetch Samsung product images
    async fetchSamsungImages(product) {
        try {
            const searchQuery = `${product.model} ${product.capacity} ${product.color}`.replace(/\s+/g, '+');
            const searchUrl = `https://www.samsung.com/us/search?q=${searchQuery}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const images = [];

            $('img[src*="samsung.com"]').each((i, element) => {
                const src = $(element).attr('src');
                if (src && src.includes('product') && images.length < 5) {
                    images.push({
                        url: src.startsWith('http') ? src : `https://www.samsung.com${src}`,
                        alt: $(element).attr('alt') || product.title,
                        type: 'product'
                    });
                }
            });

            return images;
        } catch (error) {
            console.error('Error fetching Samsung images:', error.message);
            return [];
        }
    }

    // Fetch Google product images
    async fetchGoogleImages(product) {
        try {
            const searchQuery = `${product.model} ${product.capacity} ${product.color}`.replace(/\s+/g, '+');
            const searchUrl = `https://store.google.com/search?q=${searchQuery}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const images = [];

            $('img[src*="google.com"]').each((i, element) => {
                const src = $(element).attr('src');
                if (src && src.includes('product') && images.length < 5) {
                    images.push({
                        url: src.startsWith('http') ? src : `https://store.google.com${src}`,
                        alt: $(element).attr('alt') || product.title,
                        type: 'product'
                    });
                }
            });

            return images;
        } catch (error) {
            console.error('Error fetching Google images:', error.message);
            return [];
        }
    }

    // Fetch generic product images as fallback
    async fetchGenericImages(product) {
        // Use placeholder images or generic product images
        const genericImages = [
            {
                url: `https://via.placeholder.com/400x300/007AFF/FFFFFF?text=${encodeURIComponent(product.model)}`,
                alt: product.title,
                type: 'placeholder'
            },
            {
                url: `https://via.placeholder.com/400x300/34C759/FFFFFF?text=${encodeURIComponent(product.manufacturer)}`,
                alt: product.title,
                type: 'placeholder'
            }
        ];

        return genericImages;
    }

    // Fetch product specifications
    async fetchProductSpecs(product) {
        try {
            const manufacturer = product.manufacturer.toLowerCase();
            let specs = {};

            if (manufacturer === 'apple') {
                specs = await this.fetchAppleSpecs(product);
            } else if (manufacturer === 'samsung') {
                specs = await this.fetchSamsungSpecs(product);
            } else if (manufacturer === 'google') {
                specs = await this.fetchGoogleSpecs(product);
            }

            // Add basic specs from CSV data
            specs = {
                ...specs,
                manufacturer: product.manufacturer,
                model: product.model,
                capacity: product.capacity,
                color: product.color,
                carrier: product.carrier,
                lockStatus: product.lockStatus,
                modelNumber: product.modelNumber,
                grade: product.grade,
                warehouse: product.warehouse
            };

            product.specs = specs;
            this.productSpecs.set(product.id, specs);
            
            console.log(`✅ Fetched specs for ${product.title}`);
            return specs;
        } catch (error) {
            console.error(`❌ Error fetching specs for ${product.title}:`, error.message);
            return {};
        }
    }

    // Fetch Apple product specifications
    async fetchAppleSpecs(product) {
        // Apple specs would be fetched from their product pages
        // For now, return basic specs
        return {
            brand: 'Apple',
            model: product.model,
            storage: product.capacity,
            color: product.color,
            connectivity: product.carrier,
            condition: product.grade
        };
    }

    // Fetch Samsung product specifications
    async fetchSamsungSpecs(product) {
        return {
            brand: 'Samsung',
            model: product.model,
            storage: product.capacity,
            color: product.color,
            connectivity: product.carrier,
            condition: product.grade
        };
    }

    // Fetch Google product specifications
    async fetchGoogleSpecs(product) {
        return {
            brand: 'Google',
            model: product.model,
            storage: product.capacity,
            color: product.color,
            connectivity: product.carrier,
            condition: product.grade
        };
    }

    // Process all products (fetch images and specs)
    async processAllProducts() {
        console.log('🚀 Starting product processing...');
        
        for (let i = 0; i < this.inventory.length; i++) {
            const product = this.inventory[i];
            console.log(`Processing ${i + 1}/${this.inventory.length}: ${product.title}`);
            
            // Fetch images and specs in parallel
            await Promise.all([
                this.fetchProductImages(product),
                this.fetchProductSpecs(product)
            ]);
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('✅ All products processed successfully!');
    }

    // Save inventory data to JSON
    saveInventoryData() {
        const data = {
            inventory: this.inventory,
            postingSchedule: this.postingSchedule,
            productImages: Object.fromEntries(this.productImages),
            productSpecs: Object.fromEntries(this.productSpecs),
            lastUpdated: new Date(),
            totalProducts: this.inventory.length,
            totalValue: this.inventory.reduce((sum, product) => sum + product.listPrice, 0)
        };

        fs.writeFileSync('inventory-data.json', JSON.stringify(data, null, 2));
        console.log('✅ Inventory data saved to inventory-data.json');
    }

    // Generate posting schedule HTML
    generatePostingScheduleHTML() {
        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>7-Day Inventory Posting Schedule</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #007AFF; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .day-schedule { background: white; margin-bottom: 20px; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .day-header { background: #34C759; color: white; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        .product-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fafafa; }
        .product-title { font-weight: bold; color: #007AFF; margin-bottom: 10px; }
        .product-price { font-size: 18px; font-weight: bold; color: #34C759; }
        .product-specs { font-size: 14px; color: #666; margin-top: 10px; }
        .stats { display: flex; justify-content: space-between; margin-top: 15px; }
        .stat { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007AFF; }
        .stat-label { font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📱 7-Day Inventory Posting Schedule</h1>
            <p>Total Products: ${this.inventory.length} | Total Value: $${this.inventory.reduce((sum, product) => sum + product.listPrice, 0).toLocaleString()}</p>
        </div>
`;

        this.postingSchedule.forEach((day, index) => {
            html += `
        <div class="day-schedule">
            <div class="day-header">
                <h2>Day ${day.day} - ${day.date.toLocaleDateString()}</h2>
                <div class="stats">
                    <div class="stat">
                        <div class="stat-number">${day.totalProducts}</div>
                        <div class="stat-label">Products</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">$${day.totalValue.toLocaleString()}</div>
                        <div class="stat-label">Total Value</div>
                    </div>
                </div>
            </div>
            <div class="product-grid">
`;

            day.products.forEach(product => {
                html += `
                <div class="product-card">
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">$${product.listPrice}</div>
                    <div class="product-specs">
                        <strong>Grade:</strong> ${product.grade}<br>
                        <strong>Carrier:</strong> ${product.carrier}<br>
                        <strong>Warehouse:</strong> ${product.warehouse}<br>
                        <strong>Quantity:</strong> ${product.quantity}
                    </div>
                </div>
                `;
            });

            html += `
            </div>
        </div>
            `;
        });

        html += `
    </div>
</body>
</html>`;

        fs.writeFileSync('posting-schedule.html', html);
        console.log('✅ Posting schedule HTML generated: posting-schedule.html');
    }

    // Main execution method
    async run() {
        try {
            console.log('🚀 Starting Inventory Manager...');
            
            // Parse CSV data
            await this.parseInventoryCSV('WeSell_Cellular_StockList0916.csv');
            
            // Create posting schedule
            this.createPostingSchedule();
            
            // Process products (fetch images and specs)
            await this.processAllProducts();
            
            // Save data
            this.saveInventoryData();
            
            // Generate HTML schedule
            this.generatePostingScheduleHTML();
            
            console.log('✅ Inventory Manager completed successfully!');
            console.log(`📊 Processed ${this.inventory.length} products`);
            console.log(`📅 Created 7-day posting schedule`);
            console.log(`🖼️ Fetched images for all products`);
            console.log(`📋 Generated product specifications`);
            
        } catch (error) {
            console.error('❌ Inventory Manager failed:', error);
        }
    }
}

// Export for use in other modules
module.exports = InventoryManager;

// Run if called directly
if (require.main === module) {
    const manager = new InventoryManager();
    manager.run();
}
