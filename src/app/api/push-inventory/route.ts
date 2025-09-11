import { NextRequest, NextResponse } from 'next/server'

// Product interface for type safety
interface Product {
  id: string
  name: string
  brand: string
  model: string
  price: number
  description?: string
  imageUrl?: string
  specs?: Record<string, unknown>
  inStock: boolean
  stockCount: number
  category: string
  createdAt: string
  updatedAt: string
}

// Simple in-memory storage for products (shared with other routes)
declare global {
  var __products: Product[] | undefined
}

const products = globalThis.__products ?? (globalThis.__products = [])

// Main site product format (based on PacMac site structure)
interface MainSiteProduct {
  id: string
  name: string
  price: number
  tags: string[]
  img: string
  description: string
  brand?: string
  model?: string
  specs?: Record<string, unknown>
  inStock?: boolean
  stockCount?: number
}

// POST /api/push-inventory - Push inventory to main PacMac site
export async function POST(request: NextRequest) {
  try {
    const { targetUrl, apiKey } = await request.json()
    
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      )
    }

    // Get all in-stock products from admin
    const inStockProducts = products.filter(product => product.inStock)
    
    if (inStockProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products to push',
        pushed: 0
      })
    }

    // Transform admin products to main site format
    const mainSiteProducts: MainSiteProduct[] = inStockProducts.map(product => {
      // Generate tags from specs and category
      const tags = [
        product.brand,
        product.model,
        product.category,
        ...(product.specs && typeof product.specs === 'object' ? 
          Object.values(product.specs).filter(val => val && typeof val === 'string').map(String) : 
          []
        )
      ].filter(Boolean)

      return {
        id: `pm-${product.id}`, // Prefix with 'pm-' for PacMac
        name: product.name,
        price: product.price,
        tags: tags,
        img: product.imageUrl || '/Products/placeholder.jpg',
        description: product.description || `${product.brand} ${product.model} - Premium mobile device`,
        brand: product.brand,
        model: product.model,
        specs: product.specs,
        inStock: product.inStock,
        stockCount: product.stockCount
      }
    })

    // Try to push to main site
    let pushResult
    try {
      const response = await fetch(`${targetUrl}/api/update-inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({
          products: mainSiteProducts,
          source: 'admin-panel',
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        pushResult = await response.json()
      } else {
        throw new Error(`Main site responded with status: ${response.status}`)
      }
    } catch (error) {
      console.log('Direct API push failed, trying alternative methods:', error)
      
      // Alternative: Generate a file that can be manually uploaded
      const inventoryData = {
        products: mainSiteProducts,
        generatedAt: new Date().toISOString(),
        source: 'admin-panel',
        instructions: [
          '1. Copy the products array below',
          '2. Replace the PRODUCTS array in index.html on the main site',
          '3. Update the Products/ folder with new images if needed',
          '4. Test the site to ensure everything works'
        ]
      }

      pushResult = {
        success: true,
        method: 'file-generation',
        message: 'Generated inventory file for manual upload',
        data: inventoryData,
        fileContent: generateInventoryFile(mainSiteProducts)
      }
    }

    return NextResponse.json({
      success: true,
      pushed: mainSiteProducts.length,
      total: inStockProducts.length,
      result: pushResult,
      message: `Successfully processed ${mainSiteProducts.length} products for main site`
    })

  } catch (error) {
    console.error('Error pushing inventory:', error)
    return NextResponse.json(
      { 
        error: 'Failed to push inventory', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Generate inventory file content for manual upload
function generateInventoryFile(products: MainSiteProduct[]): string {
  const jsContent = `// Auto-generated inventory from admin panel
// Generated: ${new Date().toISOString()}
// Total products: ${products.length}

const PRODUCTS = ${JSON.stringify(products, null, 2)};

// Update the main PRODUCTS array in index.html with the above
// Make sure to backup your existing PRODUCTS array first!`

  return jsContent
}

// GET /api/push-inventory - Get current inventory status
export async function GET() {
  try {
    const inStockProducts = products.filter(product => product.inStock)
    const outOfStockProducts = products.filter(product => !product.inStock)
    
    return NextResponse.json({
      total: products.length,
      inStock: inStockProducts.length,
      outOfStock: outOfStockProducts.length,
      readyToPush: inStockProducts.length,
      lastUpdated: products.length > 0 ? 
        Math.max(...products.map(p => new Date(p.updatedAt).getTime())) : null
    })
  } catch (error) {
    console.error('Error getting inventory status:', error)
    return NextResponse.json(
      { error: 'Failed to get inventory status' },
      { status: 500 }
    )
  }
}
