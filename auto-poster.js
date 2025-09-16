const fs = require('fs');
const path = require('path');
const axios = require('axios');

class AutoPoster {
    constructor() {
        this.inventoryData = null;
        this.postingQueue = [];
        this.isRunning = false;
        this.postingInterval = null;
        this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    }

    // Load inventory data
    loadInventoryData() {
        try {
            if (fs.existsSync('inventory-data.json')) {
                const data = fs.readFileSync('inventory-data.json', 'utf8');
                this.inventoryData = JSON.parse(data);
                console.log('✅ Loaded inventory data');
                return true;
            } else {
                console.log('❌ No inventory data found. Run inventory-processor.js first.');
                return false;
            }
        } catch (error) {
            console.error('❌ Error loading inventory data:', error);
            return false;
        }
    }

    // Create posting queue for today
    createPostingQueue() {
        if (!this.inventoryData) {
            console.log('❌ No inventory data loaded');
            return;
        }

        const today = new Date();
        const todaySchedule = this.inventoryData.postingSchedule.find(day => {
            const dayDate = new Date(day.date);
            return dayDate.toDateString() === today.toDateString();
        });

        if (todaySchedule) {
            this.postingQueue = todaySchedule.products.map(product => ({
                ...product,
                scheduledTime: this.calculatePostingTime(product),
                status: 'pending',
                attempts: 0
            }));
            console.log(`✅ Created posting queue with ${this.postingQueue.length} products for today`);
        } else {
            console.log('❌ No schedule found for today');
        }
    }

    // Calculate posting time for a product
    calculatePostingTime(product) {
        const now = new Date();
        const baseTime = new Date(now);
        baseTime.setHours(9, 0, 0, 0); // Start at 9 AM
        
        // Add random delay between 0-2 hours
        const randomDelay = Math.random() * 2 * 60 * 60 * 1000; // 0-2 hours in milliseconds
        baseTime.setTime(baseTime.getTime() + randomDelay);
        
        return baseTime;
    }

    // Start automated posting
    startPosting() {
        if (this.isRunning) {
            console.log('⚠️ Auto-posting is already running');
            return;
        }

        if (!this.loadInventoryData()) {
            return;
        }

        this.createPostingQueue();
        this.isRunning = true;

        // Check for posts every minute
        this.postingInterval = setInterval(() => {
            this.checkAndPost();
        }, 60000); // 1 minute

        console.log('🚀 Auto-posting started');
        console.log(`📅 Queue: ${this.postingQueue.length} products`);
        console.log(`⏰ Next check in 1 minute`);
    }

    // Stop automated posting
    stopPosting() {
        if (this.postingInterval) {
            clearInterval(this.postingInterval);
            this.postingInterval = null;
        }
        this.isRunning = false;
        console.log('⏹️ Auto-posting stopped');
    }

    // Check and post products
    async checkAndPost() {
        const now = new Date();
        const readyToPost = this.postingQueue.filter(item => 
            item.status === 'pending' && 
            new Date(item.scheduledTime) <= now
        );

        for (const item of readyToPost) {
            await this.postProduct(item);
        }

        // Check if all items are processed
        const remaining = this.postingQueue.filter(item => item.status === 'pending');
        if (remaining.length === 0) {
            console.log('✅ All products posted for today');
            this.stopPosting();
        }
    }

    // Post a single product
    async postProduct(product) {
        try {
            console.log(`📱 Posting: ${product.title}`);
            
            // Create product data for the marketplace
            const productData = {
                title: product.title,
                description: product.description,
                price: product.listPrice,
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
                updatedAt: new Date()
            };

            // Post to marketplace API
            const response = await axios.post(`${this.baseUrl}/api/marketplace/products`, productData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 || response.status === 201) {
                product.status = 'posted';
                product.postedAt = new Date();
                console.log(`✅ Posted: ${product.title}`);
                
                // Save updated queue
                this.savePostingQueue();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

        } catch (error) {
            console.error(`❌ Failed to post ${product.title}:`, error.message);
            product.attempts++;
            
            if (product.attempts >= 3) {
                product.status = 'failed';
                console.log(`❌ Max attempts reached for ${product.title}`);
            } else {
                // Retry in 30 minutes
                product.scheduledTime = new Date(Date.now() + 30 * 60 * 1000);
                console.log(`🔄 Retrying ${product.title} in 30 minutes`);
            }
            
            this.savePostingQueue();
        }
    }

    // Save posting queue
    savePostingQueue() {
        try {
            const queueData = {
                queue: this.postingQueue,
                lastUpdated: new Date(),
                isRunning: this.isRunning
            };
            fs.writeFileSync('posting-queue.json', JSON.stringify(queueData, null, 2));
        } catch (error) {
            console.error('❌ Error saving posting queue:', error);
        }
    }

    // Load posting queue
    loadPostingQueue() {
        try {
            if (fs.existsSync('posting-queue.json')) {
                const data = fs.readFileSync('posting-queue.json', 'utf8');
                const queueData = JSON.parse(data);
                this.postingQueue = queueData.queue || [];
                this.isRunning = queueData.isRunning || false;
                console.log('✅ Loaded posting queue');
                return true;
            }
        } catch (error) {
            console.error('❌ Error loading posting queue:', error);
        }
        return false;
    }

    // Get posting status
    getStatus() {
        const pending = this.postingQueue.filter(item => item.status === 'pending').length;
        const posted = this.postingQueue.filter(item => item.status === 'posted').length;
        const failed = this.postingQueue.filter(item => item.status === 'failed').length;

        return {
            isRunning: this.isRunning,
            total: this.postingQueue.length,
            pending,
            posted,
            failed,
            queue: this.postingQueue
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
    <title>Auto-Posting Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #007AFF; color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .status-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .stat-label { font-size: 14px; color: #666; }
        .pending { color: #FF9500; }
        .posted { color: #34C759; }
        .failed { color: #FF3B30; }
        .queue-item { background: #f8f9fa; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #ddd; }
        .queue-item.pending { border-left-color: #FF9500; }
        .queue-item.posted { border-left-color: #34C759; }
        .queue-item.failed { border-left-color: #FF3B30; }
        .controls { display: flex; gap: 10px; margin-bottom: 20px; }
        .btn { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-start { background: #34C759; color: white; }
        .btn-stop { background: #FF3B30; color: white; }
        .btn-refresh { background: #007AFF; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Auto-Posting Status</h1>
            <p>Last Updated: ${now.toLocaleString()}</p>
        </div>

        <div class="controls">
            <button class="btn btn-start" onclick="startPosting()">Start Posting</button>
            <button class="btn btn-stop" onclick="stopPosting()">Stop Posting</button>
            <button class="btn btn-refresh" onclick="location.reload()">Refresh</button>
        </div>

        <div class="status-card">
            <h2>📊 Posting Statistics</h2>
            <div class="status-grid">
                <div class="stat-card">
                    <div class="stat-number">${status.total}</div>
                    <div class="stat-label">Total Products</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number pending">${status.pending}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number posted">${status.posted}</div>
                    <div class="stat-label">Posted</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number failed">${status.failed}</div>
                    <div class="stat-label">Failed</div>
                </div>
            </div>
        </div>

        <div class="status-card">
            <h2>📋 Posting Queue</h2>
`;

        status.queue.forEach((item, index) => {
            const scheduledTime = new Date(item.scheduledTime).toLocaleString();
            const postedAt = item.postedAt ? new Date(item.postedAt).toLocaleString() : 'N/A';
            
            html += `
            <div class="queue-item ${item.status}">
                <strong>${item.title}</strong><br>
                <small>Status: ${item.status.toUpperCase()} | Scheduled: ${scheduledTime} | Posted: ${postedAt}</small>
            </div>
            `;
        });

        html += `
        </div>
    </div>

    <script>
        function startPosting() {
            fetch('/api/auto-poster/start', { method: 'POST' })
                .then(() => location.reload());
        }
        
        function stopPosting() {
            fetch('/api/auto-poster/stop', { method: 'POST' })
                .then(() => location.reload());
        }
        
        // Auto-refresh every 30 seconds
        setInterval(() => location.reload(), 30000);
    </script>
</body>
</html>`;

        fs.writeFileSync('auto-poster-status.html', html);
        console.log('✅ Status HTML generated: auto-poster-status.html');
    }

    // Main execution method
    async run() {
        try {
            console.log('🚀 Starting Auto-Poster...');
            
            if (this.loadInventoryData()) {
                this.createPostingQueue();
                this.generateStatusHTML();
                console.log('✅ Auto-Poster ready');
                console.log(`📊 Queue: ${this.postingQueue.length} products`);
            }
            
        } catch (error) {
            console.error('❌ Auto-Poster failed:', error);
        }
    }
}

// Export for use in other modules
module.exports = AutoPoster;

// Run if called directly
if (require.main === module) {
    const poster = new AutoPoster();
    poster.run();
}
