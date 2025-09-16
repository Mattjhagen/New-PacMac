const fs = require('fs');
const path = require('path');

class InventoryProcessor {
    constructor() {
        this.inventory = [];
        this.postingSchedule = [];
    }

    // Parse CSV inventory data (simplified version)
    async parseInventoryCSV(csvFilePath) {
        try {
            const csvContent = fs.readFileSync(csvFilePath, 'utf8');
            const lines = csvContent.split('\n');
            const headers = lines[0].split(',');
            
            const results = [];
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = this.parseCSVLine(lines[i]);
                    if (values.length >= headers.length) {
                        const product = this.createProductFromCSV(headers, values);
                        if (product && product.listPrice > 0) {
                            results.push(product);
                        }
                    }
                }
            }
            
            this.inventory = results;
            console.log(`✅ Parsed ${results.length} products from CSV`);
            return results;
        } catch (error) {
            console.error('❌ Error parsing CSV:', error);
            return [];
        }
    }

    // Parse CSV line handling commas in quotes
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    // Create product object from CSV data
    createProductFromCSV(headers, values) {
        const data = {};
        headers.forEach((header, index) => {
            data[header.trim()] = values[index] ? values[index].replace(/"/g, '') : '';
        });

        return {
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
            images: this.generatePlaceholderImages(data),
            specs: this.generateBasicSpecs(data),
            postingSchedule: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
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

    // Generate placeholder images
    generatePlaceholderImages(data) {
        const manufacturer = data['Manufacturer'].toLowerCase();
        const model = data['Model'].replace(/\s+/g, '+');
        const color = data['Color'].replace(/\s+/g, '+');
        
        return [
            {
                url: `https://via.placeholder.com/400x300/007AFF/FFFFFF?text=${encodeURIComponent(data['Manufacturer'] + ' ' + data['Model'])}`,
                alt: `${data['Manufacturer']} ${data['Model']}`,
                type: 'placeholder'
            },
            {
                url: `https://via.placeholder.com/400x300/34C759/FFFFFF?text=${encodeURIComponent(data['Color'] + ' ' + data['Capacity'])}`,
                alt: `${data['Color']} ${data['Capacity']}`,
                type: 'placeholder'
            }
        ];
    }

    // Generate basic specs
    generateBasicSpecs(data) {
        return {
            manufacturer: data['Manufacturer'],
            model: data['Model'],
            capacity: data['Capacity'],
            color: data['Color'],
            carrier: data['Carrier'],
            lockStatus: data['Lock Status'],
            modelNumber: data['Model Number'],
            grade: data['Grade'],
            warehouse: data['Warehouse'],
            condition: data['Grade'],
            connectivity: data['Carrier']
        };
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

    // Save inventory data to JSON
    saveInventoryData() {
        const data = {
            inventory: this.inventory,
            postingSchedule: this.postingSchedule,
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
        .product-image { width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 10px; }
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
                    <img src="${product.images[0].url}" alt="${product.images[0].alt}" class="product-image">
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
            console.log('🚀 Starting Inventory Processor...');
            
            // Parse CSV data
            await this.parseInventoryCSV('WeSell_Cellular_StockList0916.csv');
            
            // Create posting schedule
            this.createPostingSchedule();
            
            // Save data
            this.saveInventoryData();
            
            // Generate HTML schedule
            this.generatePostingScheduleHTML();
            
            console.log('✅ Inventory Processor completed successfully!');
            console.log(`📊 Processed ${this.inventory.length} products`);
            console.log(`📅 Created 7-day posting schedule`);
            console.log(`🖼️ Generated placeholder images for all products`);
            console.log(`📋 Generated product specifications`);
            
        } catch (error) {
            console.error('❌ Inventory Processor failed:', error);
        }
    }
}

// Export for use in other modules
module.exports = InventoryProcessor;

// Run if called directly
if (require.main === module) {
    const processor = new InventoryProcessor();
    processor.run();
}
