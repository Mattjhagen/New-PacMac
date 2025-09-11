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

    console.log('Fixing main site JavaScript for repository:', repository)

    // Get the current index.html
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

    // Fix the initializeProducts function
    const fixedContent = currentContent.replace(
      /async function initializeProducts\(\) \{[\s\S]*?\}/g,
      `async function initializeProducts() {
      try {
        console.log('🔄 Initializing products from API...');
        
        // Check if inventoryAPI is available
        if (!window.inventoryAPI) {
          console.error('❌ inventoryAPI not available, using fallback');
          PRODUCTS = FALLBACK_PRODUCTS || [];
          return;
        }
        
        // Try to get products using the correct method
        let products = [];
        
        if (typeof window.inventoryAPI.getProducts === 'function') {
          products = await window.inventoryAPI.getProducts();
        } else if (typeof window.inventoryAPI.fetchProducts === 'function') {
          products = await window.inventoryAPI.fetchProducts();
        } else {
          console.error('❌ No valid product fetching method found');
          products = FALLBACK_PRODUCTS || [];
        }
        
        PRODUCTS = products;
        console.log(\`✅ Loaded \${PRODUCTS.length} products\`);
        
        // Update the product grid if it exists
        if (typeof updateProductGrid === 'function') {
          updateProductGrid();
        }
        
        // Update any product-related UI elements
        if (typeof updateProductUI === 'function') {
          updateProductUI();
        }
        
        // Show products
        if (typeof showProducts === 'function') {
          showProducts();
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize products:', error);
        // Fallback to static products
        PRODUCTS = FALLBACK_PRODUCTS || [];
        console.log('🔄 Using fallback static products');
        
        // Still try to show products
        if (typeof showProducts === 'function') {
          showProducts();
        }
      }
    }`
    )

    // Update the file
    const updateFileResponse = await fetch(`https://api.github.com/repos/${repository}/contents/index.html`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Fix JavaScript API calls for product initialization',
        content: Buffer.from(fixedContent).toString('base64'),
        sha: fileData.sha
      })
    })

    if (!updateFileResponse.ok) {
      const errorData = await updateFileResponse.json().catch(() => ({}))
      throw new Error(`Failed to update index.html: ${updateFileResponse.status} - ${errorData.message || 'Unknown error'}`)
    }

    const result = await updateFileResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Successfully fixed main site JavaScript',
      result: result,
      details: {
        repository: repository,
        changes: 'Fixed initializeProducts function to use correct API methods'
      }
    })

  } catch (error) {
    console.error('Error fixing main site JavaScript:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix main site JavaScript',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
