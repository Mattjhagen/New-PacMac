import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { githubToken, repository } = await request.json()

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token is required' },
        { status: 400 }
      )
    }

    if (!repository) {
      return NextResponse.json(
        { error: 'Repository is required (format: owner/repo)' },
        { status: 400 }
      )
    }

    console.log('Fixing missing scripts for repository:', repository)

    // Script contents
    const configJs = `// Configuration for PacMac Mobile
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
window.CONFIG = CONFIG;`

    const inventoryApiJs = `// Inventory API functions for PacMac Mobile
class InventoryAPI {
    constructor() {
        this.baseUrl = window.CONFIG ? window.CONFIG.apiBaseUrl : 'https://admin.pacmacmobile.com/api';
    }
    
    // Get all products
    async getProducts() {
        try {
            const response = await fetch(\`\${this.baseUrl}/public/products\`);
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
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
            const response = await fetch(\`\${this.baseUrl}/public/products/\${id}\`);
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
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
window.inventoryAPI = new InventoryAPI();`

    // Function to create or update a file in the repository
    async function createOrUpdateFile(filename: string, content: string, message: string) {
      // First, try to get the existing file to get its SHA
      const getFileResponse = await fetch(`https://api.github.com/repos/${repository}/contents/${filename}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      let sha = null
      if (getFileResponse.ok) {
        const fileData = await getFileResponse.json()
        sha = fileData.sha
        console.log(`File ${filename} exists, will update it`)
      } else {
        console.log(`File ${filename} does not exist, will create it`)
      }

      // Create or update the file
      const createFileResponse = await fetch(`https://api.github.com/repos/${repository}/contents/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          content: Buffer.from(content).toString('base64'),
          sha: sha // Include SHA if updating, null if creating
        })
      })

      if (!createFileResponse.ok) {
        const errorData = await createFileResponse.json().catch(() => ({}))
        throw new Error(`Failed to ${sha ? 'update' : 'create'} ${filename}: ${createFileResponse.status} - ${errorData.message || 'Unknown error'}`)
      }

      return await createFileResponse.json()
    }

    // Create both files
    const results = []
    
    try {
      const configResult = await createOrUpdateFile('config.js', configJs, 'Add missing config.js for product display')
      results.push({ file: 'config.js', success: true, result: configResult })
    } catch (error) {
      results.push({ file: 'config.js', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }

    try {
      const inventoryResult = await createOrUpdateFile('inventory-api.js', inventoryApiJs, 'Add missing inventory-api.js for product display')
      results.push({ file: 'inventory-api.js', success: true, result: inventoryResult })
    } catch (error) {
      results.push({ file: 'inventory-api.js', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount > 0,
      message: `Successfully ${successCount === totalCount ? 'created' : 'partially created'} ${successCount}/${totalCount} missing script files`,
      results: results,
      details: {
        repository: repository,
        filesCreated: results.filter(r => r.success).map(r => r.file),
        filesFailed: results.filter(r => !r.success).map(r => ({ file: r.file, error: r.error }))
      }
    })

  } catch (error) {
    console.error('Error fixing missing scripts:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix missing scripts',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
