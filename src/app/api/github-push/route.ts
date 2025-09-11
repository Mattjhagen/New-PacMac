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

// POST /api/github-push - Push inventory directly to GitHub repository
export async function POST(request: NextRequest) {
  try {
    const { githubToken, repository, branch = 'main', testOnly = false } = await request.json()
    
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

    // Test GitHub token and repository access first
    const testResponse = await fetch(`https://api.github.com/repos/${repository}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!testResponse.ok) {
      const testError = await testResponse.json().catch(() => ({}))
      throw new Error(`GitHub access test failed: ${testResponse.status} - ${testError.message || 'Repository not found or no access'}`)
    }

    const repoInfo = await testResponse.json()
    console.log('Repository access confirmed:', repoInfo.full_name, repoInfo.private ? 'private' : 'public')

    if (testOnly) {
      return NextResponse.json({
        success: true,
        message: 'GitHub token and repository access confirmed',
        repository: repoInfo.full_name,
        private: repoInfo.private,
        defaultBranch: repoInfo.default_branch
      })
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

    // Generate the new PRODUCTS array
    const productsArray = `const PRODUCTS = ${JSON.stringify(mainSiteProducts, null, 2)};`
    
    // Get current index.html from GitHub
    const getFileResponse = await fetch(`https://api.github.com/repos/${repository}/contents/index.html`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!getFileResponse.ok) {
      const errorData = await getFileResponse.json().catch(() => ({}))
      throw new Error(`Failed to fetch index.html: ${getFileResponse.status} - ${errorData.message || 'Unknown error'}`)
    }

    const fileData = await getFileResponse.json()
    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8')
    
    // Debug: Log the first 1000 characters to see the structure
    console.log('Current index.html content (first 1000 chars):', currentContent.substring(0, 1000))
    console.log('Looking for PRODUCTS array patterns...')
    
    // Find and replace the PRODUCTS array with multiple patterns
    const patterns = [
      /const PRODUCTS = \[[\s\S]*?\];/g,
      /let PRODUCTS = \[[\s\S]*?\];/g,
      /var PRODUCTS = \[[\s\S]*?\];/g,
      /PRODUCTS = \[[\s\S]*?\];/g,
      /const products = \[[\s\S]*?\];/g,
      /let products = \[[\s\S]*?\];/g,
      /var products = \[[\s\S]*?\];/g,
      /products = \[[\s\S]*?\];/g
    ]
    
    let newContent = currentContent
    let found = false
    
    for (const pattern of patterns) {
      if (pattern.test(newContent)) {
        newContent = newContent.replace(pattern, productsArray)
        found = true
        break
      }
    }
    
    if (!found) {
      // If no existing array found, try to add it after a script tag or before closing body
      const scriptTagPattern = /<script[^>]*>[\s\S]*?<\/script>/g
      const scriptMatches = [...currentContent.matchAll(scriptTagPattern)]
      
      if (scriptMatches.length > 0) {
        // Add after the last script tag
        const lastScript = scriptMatches[scriptMatches.length - 1]
        const insertIndex = lastScript.index! + lastScript[0].length
        newContent = currentContent.slice(0, insertIndex) + 
                    `\n\n<script>\n${productsArray}\n</script>` + 
                    currentContent.slice(insertIndex)
        found = true
      } else {
        // Add before closing body tag
        const bodyClosePattern = /<\/body>/i
        if (bodyClosePattern.test(newContent)) {
          newContent = newContent.replace(bodyClosePattern, 
            `<script>\n${productsArray}\n</script>\n</body>`)
          found = true
        }
      }
    }
    
    if (!found) {
      throw new Error('Could not find PRODUCTS array or suitable location to add it in index.html')
    }

    // Update the file on GitHub
    const updateResponse = await fetch(`https://api.github.com/repos/${repository}/contents/index.html`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Update inventory from admin panel - ${mainSiteProducts.length} products`,
        content: Buffer.from(newContent).toString('base64'),
        sha: fileData.sha,
        branch: branch
      })
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      console.error('GitHub update error:', errorData)
      throw new Error(`Failed to update GitHub: ${errorData.message || 'Unknown error'} (Status: ${updateResponse.status})`)
    }

    const updateResult = await updateResponse.json()

    return NextResponse.json({
      success: true,
      pushed: mainSiteProducts.length,
      total: inStockProducts.length,
      message: `Successfully updated ${mainSiteProducts.length} products on GitHub`,
      commit: updateResult.commit,
      url: updateResult.content.html_url
    })

  } catch (error) {
    console.error('Error pushing to GitHub:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Failed to push to GitHub', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// GET /api/github-push - Get current inventory status
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
        Math.max(...products.map(p => new Date(p.updatedAt).getTime())) : null,
      instructions: [
        '1. Create a GitHub Personal Access Token with repo permissions',
        '2. Use the token in the GitHub Push form',
        '3. Repository should be in format: Mattjhagen/New-PacMac',
        '4. Click Push to GitHub to update the main site automatically'
      ]
    })
  } catch (error) {
    console.error('Error getting inventory status:', error)
    return NextResponse.json(
      { error: 'Failed to get inventory status' },
      { status: 500 }
    )
  }
}
