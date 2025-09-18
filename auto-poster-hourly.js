const fs = require('fs');
const path = require('path');

class HourlyAutoPoster {
    constructor() {
        this.inventoryData = null;
        this.postingQueue = [];
        this.isRunning = false;
        this.postingInterval = null;
        this.hourlyInterval = null;
        this.baseUrl = process.env.BASE_URL || 'https://new-pacmac.onrender.com';
        this.productsPerHour = 10;
        this.postedToday = 0;
        this.maxDailyPosts = 240; // 10 per hour * 24 hours
    }

    // Load inventory data
    loadInventoryData() {
        try {
            if (fs.existsSync('inventory-data.json')) {
                const data = fs.readFileSync('inventory-data.json', 'utf8');
                const rawData = JSON.parse(data);
                
                // Convert existing inventory format to our format
                if (rawData.inventory && Array.isArray(rawData.inventory)) {
                    this.inventoryData = {
                        products: rawData.inventory.map(item => ({
                            id: item.itemNumber || `ITEM-${Math.random().toString(36).substr(2, 9)}`,
                            title: `${item.manufacturer} ${item.model} ${item.capacity} ${item.color}`,
                            description: `${item.manufacturer} ${item.model} with ${item.capacity} storage in ${item.color}`,
                            listPrice: item.listPrice || 0,
                            basePrice: item.listPrice || 0,
                            category: item.category || 'Electronics',
                            manufacturer: item.manufacturer || 'Unknown',
                            model: item.model || 'Unknown',
                            capacity: item.capacity || 'Unknown',
                            color: item.color || 'Unknown',
                            grade: item.grade || 'A',
                            carrier: item.carrier || 'Unlocked',
                            lockStatus: item.lockStatus || 'Unlocked',
                            modelNumber: item.modelNumber || 'Unknown',
                            warehouse: item.warehouse || 'Main',
                            quantity: item.quantity || 1,
                            images: [`https://via.placeholder.com/300x300/007AFF/FFFFFF?text=${encodeURIComponent(item.manufacturer || 'Product')}`],
                            specs: {
                                display: 'High-resolution display',
                                processor: 'Advanced processor',
                                camera: 'High-quality camera',
                                battery: 'Long-lasting battery'
                            },
                            itemNumber: item.itemNumber || 'Unknown',
                            status: 'available'
                        })),
                        lastUpdated: new Date(),
                        totalProducts: rawData.inventory.length
                    };
                    console.log(`✅ Loaded and converted ${rawData.inventory.length} products from existing inventory`);
                } else {
                    console.log('❌ Invalid inventory data format. Creating sample data...');
                    this.createSampleInventoryData();
                }
                return true;
            } else {
                console.log('❌ No inventory data found. Creating sample data...');
                this.createSampleInventoryData();
                return true;
            }
        } catch (error) {
            console.error('❌ Error loading inventory data:', error);
            return false;
        }
    }

    // Create sample inventory data if none exists
    createSampleInventoryData() {
        const sampleProducts = [
            {
                id: 'IPHONE15-128-BLACK',
                title: 'iPhone 15 128GB Black',
                description: 'Brand new iPhone 15 with 128GB storage in black',
                listPrice: 799.00,
                basePrice: 799.00,
                category: 'Smartphones',
                manufacturer: 'Apple',
                model: 'iPhone 15',
                capacity: '128GB',
                color: 'Black',
                grade: 'A+',
                carrier: 'Unlocked',
                lockStatus: 'Unlocked',
                modelNumber: 'A2847',
                warehouse: 'Main',
                quantity: 1,
                images: ['https://via.placeholder.com/300x300/000000/FFFFFF?text=iPhone+15'],
                specs: {
                    display: '6.1-inch Super Retina XDR',
                    processor: 'A16 Bionic',
                    camera: '48MP Main, 12MP Ultra Wide',
                    battery: 'Up to 20 hours video playback'
                },
                itemNumber: 'IPHONE15-128-BLACK',
                status: 'available'
            },
            {
                id: 'IPHONE15-256-BLUE',
                title: 'iPhone 15 256GB Blue',
                description: 'Brand new iPhone 15 with 256GB storage in blue',
                listPrice: 899.00,
                basePrice: 899.00,
                category: 'Smartphones',
                manufacturer: 'Apple',
                model: 'iPhone 15',
                capacity: '256GB',
                color: 'Blue',
                grade: 'A+',
                carrier: 'Unlocked',
                lockStatus: 'Unlocked',
                modelNumber: 'A2847',
                warehouse: 'Main',
                quantity: 1,
                images: ['https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15'],
                specs: {
                    display: '6.1-inch Super Retina XDR',
                    processor: 'A16 Bionic',
                    camera: '48MP Main, 12MP Ultra Wide',
                    battery: 'Up to 20 hours video playback'
                },
                itemNumber: 'IPHONE15-256-BLUE',
                status: 'available'
            },
            {
                id: 'IPHONE15PRO-128-TITANIUM',
                title: 'iPhone 15 Pro 128GB Titanium',
                description: 'Brand new iPhone 15 Pro with 128GB storage in titanium',
                listPrice: 999.00,
                basePrice: 999.00,
                category: 'Smartphones',
                manufacturer: 'Apple',
                model: 'iPhone 15 Pro',
                capacity: '128GB',
                color: 'Titanium',
                grade: 'A+',
                carrier: 'Unlocked',
                lockStatus: 'Unlocked',
                modelNumber: 'A2848',
                warehouse: 'Main',
                quantity: 1,
                images: ['https://via.placeholder.com/300x300/8E8E93/FFFFFF?text=iPhone+15+Pro'],
                specs: {
                    display: '6.1-inch Super Retina XDR ProMotion',
                    processor: 'A17 Pro',
                    camera: '48MP Main, 12MP Ultra Wide, 12MP Telephoto',
                    battery: 'Up to 23 hours video playback'
                },
                itemNumber: 'IPHONE15PRO-128-TITANIUM',
                status: 'available'
            },
            {
                id: 'SAMSUNG-S24-128-BLACK',
                title: 'Samsung Galaxy S24 128GB Black',
                description: 'Brand new Samsung Galaxy S24 with 128GB storage in black',
                listPrice: 799.99,
                basePrice: 799.99,
                category: 'Smartphones',
                manufacturer: 'Samsung',
                model: 'Galaxy S24',
                capacity: '128GB',
                color: 'Black',
                grade: 'A+',
                carrier: 'Unlocked',
                lockStatus: 'Unlocked',
                modelNumber: 'SM-S921B',
                warehouse: 'Main',
                quantity: 1,
                images: ['https://via.placeholder.com/300x300/000000/FFFFFF?text=Galaxy+S24'],
                specs: {
                    display: '6.2-inch Dynamic AMOLED 2X',
                    processor: 'Snapdragon 8 Gen 3',
                    camera: '50MP Main, 12MP Ultra Wide, 10MP Telephoto',
                    battery: '4000mAh'
                },
                itemNumber: 'SAMSUNG-S24-128-BLACK',
                status: 'available'
            },
            {
                id: 'IPAD-AIR-64-SPACE-GRAY',
                title: 'iPad Air 64GB Space Gray',
                description: 'Brand new iPad Air with 64GB storage in space gray',
                listPrice: 599.00,
                basePrice: 599.00,
                category: 'Tablets',
                manufacturer: 'Apple',
                model: 'iPad Air',
                capacity: '64GB',
                color: 'Space Gray',
                grade: 'A+',
                carrier: 'Wi-Fi',
                lockStatus: 'Unlocked',
                modelNumber: 'A2588',
                warehouse: 'Main',
                quantity: 1,
                images: ['https://via.placeholder.com/300x300/8E8E93/FFFFFF?text=iPad+Air'],
                specs: {
                    display: '10.9-inch Liquid Retina',
                    processor: 'M1',
                    camera: '12MP Wide',
                    battery: 'Up to 10 hours'
                },
                itemNumber: 'IPAD-AIR-64-SPACE-GRAY',
                status: 'available'
            }
        ];

        this.inventoryData = {
            products: sampleProducts,
            lastUpdated: new Date(),
            totalProducts: sampleProducts.length
        };

        // Save sample data
        fs.writeFileSync('inventory-data.json', JSON.stringify(this.inventoryData, null, 2));
        console.log('✅ Created sample inventory data with 5 products');
    }

    // Start hourly posting
    startHourlyPosting() {
        if (this.isRunning) {
            console.log('⚠️ Hourly auto-posting is already running');
            return;
        }

        if (!this.loadInventoryData()) {
            return;
        }

        this.isRunning = true;
        this.postedToday = 0;

        // Post immediately on start
        this.postHourlyProducts();

        // Set up hourly interval
        this.hourlyInterval = setInterval(() => {
            this.postHourlyProducts();
        }, 60 * 60 * 1000); // 1 hour

        console.log('🚀 Hourly auto-posting started');
        console.log(`📅 Will post ${this.productsPerHour} products every hour`);
        console.log(`⏰ Next posting in 1 hour`);
    }

    // Stop hourly posting
    stopHourlyPosting() {
        if (this.hourlyInterval) {
            clearInterval(this.hourlyInterval);
            this.hourlyInterval = null;
        }
        this.isRunning = false;
        console.log('⏹️ Hourly auto-posting stopped');
    }

    // Post products for this hour
    async postHourlyProducts() {
        if (this.postedToday >= this.maxDailyPosts) {
            console.log('📊 Daily posting limit reached. Resetting tomorrow.');
            this.postedToday = 0;
        }

        const productsToPost = Math.min(this.productsPerHour, this.maxDailyPosts - this.postedToday);
        
        if (productsToPost <= 0) {
            console.log('📊 No more products to post today');
            return;
        }

        console.log(`📱 Posting ${productsToPost} products this hour...`);

        // Get random products from inventory
        const availableProducts = (this.inventoryData.products || []).filter(p => p.status === 'available');
        const shuffled = this.shuffleArray([...availableProducts]);
        const selectedProducts = shuffled.slice(0, productsToPost);

        for (const product of selectedProducts) {
            await this.postProduct(product);
            this.postedToday++;
        }

        console.log(`✅ Posted ${productsToPost} products. Total today: ${this.postedToday}`);
    }

    // Post a single product
    async postProduct(product) {
        try {
            console.log(`📱 Posting: ${product.title} - $${product.basePrice}`);
            
            // Create product data for the marketplace
            const productData = {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.basePrice, // Use base price as requested
                listPrice: product.listPrice,
                category: product.category,
                manufacturer: product.manufacturer,
                model: product.model,
                capacity: product.capacity,
                color: product.color,
                grade: product.grade,
                carrier: product.carrier,
                lockStatus: product.lockStatus,
                modelNumber: product.modelNumber,
                warehouse: product.warehouse,
                quantity: product.quantity,
                images: product.images,
                specs: product.specs,
                itemNumber: product.itemNumber,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                // Add auction properties
                currentBid: 0,
                highestBidder: null,
                bidHistory: [],
                isActive: true,
                winner: null,
                endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
            };

            // Add to posting queue for tracking
            this.postingQueue.push({
                ...productData,
                postedAt: new Date(),
                status: 'posted'
            });

            // Save updated queue
            this.savePostingQueue();

            console.log(`✅ Posted: ${product.title} - $${product.basePrice}`);

            // Track auto-poster activity in Clarity (if available)
            if (typeof window !== 'undefined' && window.PacMacClarity) {
              window.PacMacClarity.trackAutoPost(1);
            }

        } catch (error) {
            console.error(`❌ Failed to post ${product.title}:`, error.message);
        }
    }

    // Shuffle array utility
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Save posting queue
    savePostingQueue() {
        try {
            const queueData = {
                queue: this.postingQueue,
                lastUpdated: new Date(),
                isRunning: this.isRunning,
                postedToday: this.postedToday,
                maxDailyPosts: this.maxDailyPosts
            };
            fs.writeFileSync('hourly-posting-queue.json', JSON.stringify(queueData, null, 2));
        } catch (error) {
            console.error('❌ Error saving posting queue:', error);
        }
    }

    // Load posting queue
    loadPostingQueue() {
        try {
            if (fs.existsSync('hourly-posting-queue.json')) {
                const data = fs.readFileSync('hourly-posting-queue.json', 'utf8');
                const queueData = JSON.parse(data);
                this.postingQueue = queueData.queue || [];
                this.isRunning = queueData.isRunning || false;
                this.postedToday = queueData.postedToday || 0;
                console.log('✅ Loaded hourly posting queue');
                return true;
            }
        } catch (error) {
            console.error('❌ Error loading posting queue:', error);
        }
        return false;
    }

    // Get posting status
    getStatus() {
        const today = new Date().toDateString();
        const todayPosts = this.postingQueue.filter(item => 
            new Date(item.postedAt).toDateString() === today
        );

        return {
            isRunning: this.isRunning,
            postedToday: this.postedToday,
            maxDailyPosts: this.maxDailyPosts,
            productsPerHour: this.productsPerHour,
            totalPosted: this.postingQueue.length,
            todayPosts: todayPosts.length,
            queue: this.postingQueue.slice(-50) // Last 50 posts
        };
    }

    // Generate status HTML
    generateStatusHTML() {
        const status = this.getStatus();
        const now = new Date();

        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hourly Auto-Posting Status</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); text-align: center; }
        .status-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); margin-bottom: 20px; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; text-align: center; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
        .stat-number { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
        .stat-label { font-size: 14px; color: #666; font-weight: 500; }
        .running { color: #34C759; }
        .stopped { color: #FF3B30; }
        .controls { display: flex; gap: 15px; margin-bottom: 20px; justify-content: center; }
        .btn { padding: 15px 30px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 16px; transition: all 0.3s ease; }
        .btn-start { background: #34C759; color: white; }
        .btn-start:hover { background: #30B04F; transform: translateY(-2px); }
        .btn-stop { background: #FF3B30; color: white; }
        .btn-stop:hover { background: #E5342A; transform: translateY(-2px); }
        .btn-refresh { background: #007AFF; color: white; }
        .btn-refresh:hover { background: #0056CC; transform: translateY(-2px); }
        .queue-item { background: rgba(248, 249, 250, 0.8); padding: 20px; margin-bottom: 15px; border-radius: 12px; border-left: 5px solid #34C759; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
        .product-title { font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #333; }
        .product-details { font-size: 14px; color: #666; margin-bottom: 5px; }
        .product-price { font-size: 16px; font-weight: bold; color: #34C759; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Hourly Auto-Posting Status</h1>
            <p>Last Updated: ${now.toLocaleString()}</p>
        </div>

        <div class="controls">
            <button class="btn btn-start" onclick="startPosting()">Start Hourly Posting</button>
            <button class="btn btn-stop" onclick="stopPosting()">Stop Posting</button>
            <button class="btn btn-refresh" onclick="location.reload()">Refresh</button>
        </div>

        <div class="status-card">
            <h2>📊 Posting Statistics</h2>
            <div class="status-grid">
                <div class="stat-card">
                    <div class="stat-number ${status.isRunning ? 'running' : 'stopped'}">${status.isRunning ? 'RUNNING' : 'STOPPED'}</div>
                    <div class="stat-label">Status</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${status.postedToday}</div>
                    <div class="stat-label">Posted Today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${status.maxDailyPosts}</div>
                    <div class="stat-label">Daily Limit</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${status.productsPerHour}</div>
                    <div class="stat-label">Per Hour</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${status.totalPosted}</div>
                    <div class="stat-label">Total Posted</div>
                </div>
            </div>
        </div>

        <div class="status-card">
            <h2>📋 Recent Posts</h2>
`;

        status.queue.slice(-20).forEach((item, index) => {
            const postedAt = new Date(item.postedAt).toLocaleString();
            
            html += `
            <div class="queue-item">
                <div class="product-title">${item.title}</div>
                <div class="product-details">${item.manufacturer} ${item.model} - ${item.capacity} ${item.color}</div>
                <div class="product-details">Posted: ${postedAt}</div>
                <div class="product-price">$${item.price.toFixed(2)}</div>
            </div>
            `;
        });

        html += `
        </div>
    </div>

    <script>
        function startPosting() {
            fetch('/api/auto-poster/hourly/start', { method: 'POST' })
                .then(() => location.reload());
        }
        
        function stopPosting() {
            fetch('/api/auto-poster/hourly/stop', { method: 'POST' })
                .then(() => location.reload());
        }
        
        // Auto-refresh every 30 seconds
        setInterval(() => location.reload(), 30000);
    </script>
</body>
</html>`;

        fs.writeFileSync('hourly-auto-poster-status.html', html);
        console.log('✅ Status HTML generated: hourly-auto-poster-status.html');
    }

    // Main execution method
    async run() {
        try {
            console.log('🚀 Starting Hourly Auto-Poster...');
            
            if (this.loadInventoryData()) {
                this.loadPostingQueue();
                this.generateStatusHTML();
                console.log('✅ Hourly Auto-Poster ready');
                console.log(`📊 Products available: ${this.inventoryData.products ? this.inventoryData.products.length : 0}`);
                console.log(`📊 Posted today: ${this.postedToday}`);
            }
            
        } catch (error) {
            console.error('❌ Hourly Auto-Poster failed:', error);
        }
    }
}

// Export for use in other modules
module.exports = HourlyAutoPoster;

// Run if called directly
if (require.main === module) {
    const poster = new HourlyAutoPoster();
    poster.run();
}
