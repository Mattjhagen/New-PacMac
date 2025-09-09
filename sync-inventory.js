/**
 * PacMac Mobile Inventory Sync Script
 * 
 * This script helps you sync inventory from the admin panel to your main site.
 * 
 * Usage:
 * 1. Export inventory from admin panel (admin.html)
 * 2. Run this script to generate the PRODUCTS array for index.html
 * 3. Copy the generated code to your main site
 */

class InventorySyncer {
    constructor() {
        this.inventory = [];
        this.markupPercentage = 22; // 22% markup as requested
    }
    
    // Load inventory from exported JSON file
    loadInventory(jsonData) {
        try {
            this.inventory = JSON.parse(jsonData);
            console.log(`Loaded ${this.inventory.length} products`);
            return true;
        } catch (error) {
            console.error('Error loading inventory:', error);
            return false;
        }
    }
    
    // Apply markup to prices
    applyMarkup(price) {
        return (price * (1 + this.markupPercentage / 100)).toFixed(2);
    }
    
    // Generate PRODUCTS array for index.html
    generateProductsArray() {
        const products = this.inventory.map(item => {
            return {
                id: item.id,
                name: item.name,
                price: parseFloat(this.applyMarkup(item.price)),
                tags: item.tags || [],
                img: item.img,
                description: item.description || '',
                specs: item.specs || {}
            };
        });
        
        return products;
    }
    
    // Generate JavaScript code for index.html
    generateJavaScriptCode() {
        const products = this.generateProductsArray();
        
        let jsCode = `const PRODUCTS = [\n`;
        
        products.forEach((product, index) => {
            jsCode += `  {\n`;
            jsCode += `    id: '${product.id}',\n`;
            jsCode += `    name: '${product.name.replace(/'/g, "\\'")}',\n`;
            jsCode += `    price: ${product.price},\n`;
            jsCode += `    tags: [${product.tags.map(tag => `'${tag.replace(/'/g, "\\'")}'`).join(', ')}],\n`;
            jsCode += `    img: '${product.img}',\n`;
            jsCode += `    description: '${product.description.replace(/'/g, "\\'")}',\n`;
            jsCode += `    specs: ${JSON.stringify(product.specs, null, 4).replace(/^/gm, '    ')}\n`;
            jsCode += `  }${index < products.length - 1 ? ',' : ''}\n`;
        });
        
        jsCode += `];\n\n`;
        jsCode += `// Generated on ${new Date().toISOString()}\n`;
        jsCode += `// Total products: ${products.length}\n`;
        jsCode += `// Markup applied: ${this.markupPercentage}%\n`;
        
        return jsCode;
    }
    
    // Generate HTML for easy copying
    generateHTMLOutput() {
        const jsCode = this.generateJavaScriptCode();
        
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Generated PRODUCTS Array</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        pre { background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto; }
        .copy-btn { background: #007AFF; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Generated PRODUCTS Array for index.html</h1>
    <p>Copy the code below and replace the PRODUCTS array in your index.html file:</p>
    
    <button class="copy-btn" onclick="copyToClipboard()">Copy to Clipboard</button>
    
    <pre id="code-block">${jsCode}</pre>
    
    <script>
        function copyToClipboard() {
            const codeBlock = document.getElementById('code-block');
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                alert('Code copied to clipboard!');
            });
        }
    </script>
</body>
</html>`;
    }
    
    // Export to file
    exportToFile() {
        const jsCode = this.generateJavaScriptCode();
        const blob = new Blob([jsCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `products-array-${new Date().toISOString().split('T')[0]}.js`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// Browser usage (if running in browser)
if (typeof window !== 'undefined') {
    window.InventorySyncer = InventorySyncer;
    
    // Add to admin.html
    function syncInventoryToMainSite() {
        const inventoryData = localStorage.getItem('pmm-inventory');
        if (!inventoryData) {
            alert('No inventory data found. Please add some products first.');
            return;
        }
        
        const syncer = new InventorySyncer();
        if (syncer.loadInventory(inventoryData)) {
            const jsCode = syncer.generateJavaScriptCode();
            
            // Create a new window with the generated code
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <html>
                <head><title>Generated PRODUCTS Array</title></head>
                <body>
                    <h1>Copy this code to your index.html</h1>
                    <button onclick="copyToClipboard()">Copy to Clipboard</button>
                    <pre id="code">${jsCode}</pre>
                    <script>
                        function copyToClipboard() {
                            navigator.clipboard.writeText(document.getElementById('code').textContent);
                            alert('Copied!');
                        }
                    </script>
                </body>
                </html>
            `);
        }
    }
}

// Node.js usage (if running in Node.js)
if (typeof module !== 'undefined' && module.exports) {
    const fs = require('fs');
    
    // Command line usage
    if (process.argv.length > 2) {
        const inputFile = process.argv[2];
        const outputFile = process.argv[3] || 'generated-products.js';
        
        try {
            const jsonData = fs.readFileSync(inputFile, 'utf8');
            const syncer = new InventorySyncer();
            
            if (syncer.loadInventory(jsonData)) {
                const jsCode = syncer.generateJavaScriptCode();
                fs.writeFileSync(outputFile, jsCode);
                console.log(`Generated ${outputFile} successfully!`);
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
}
