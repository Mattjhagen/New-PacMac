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

    console.log('Applying final fix for repository:', repository)

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

    // Replace the entire initializeProducts function with a simple version
    const fixedContent = currentContent.replace(
      /async function initializeProducts\(\) \{[\s\S]*?\}/g,
      `function initializeProducts() {
      console.log('🔄 Initializing products...');
      
      // Check if PRODUCTS array already has data
      if (PRODUCTS && PRODUCTS.length > 0) {
        console.log(\`✅ Using existing PRODUCTS array with \${PRODUCTS.length} products\`);
      } else {
        console.log('⚠️ PRODUCTS array is empty, using fallback');
        PRODUCTS = FALLBACK_PRODUCTS || [];
      }
      
      // Always call initializeApp to render the products
      if (typeof initializeApp === 'function') {
        initializeApp();
        console.log('✅ initializeApp called successfully');
      } else {
        console.error('❌ initializeApp function not found');
      }
      
      // Show products
      if (typeof showProducts === 'function') {
        showProducts();
        console.log('✅ showProducts called successfully');
      } else {
        console.error('❌ showProducts function not found');
      }
    }`
    )

    // Also remove any other calls that might overwrite PRODUCTS
    const finalContent = fixedContent.replace(
      /PRODUCTS\s*=\s*await\s+window\.inventoryAPI\.[^;]+;/g,
      '// PRODUCTS = await window.inventoryAPI.getProducts(); // DISABLED - using existing array'
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
        message: 'Final fix - ensure PRODUCTS array is never overwritten by API calls',
        content: Buffer.from(finalContent).toString('base64'),
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
      message: 'Final fix applied - PRODUCTS array will never be overwritten',
      result: result,
      details: {
        repository: repository,
        changes: 'Removed all API calls that could overwrite PRODUCTS array'
      }
    })

  } catch (error) {
    console.error('Error applying final fix:', error)
    return NextResponse.json(
      { 
        error: 'Failed to apply final fix',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
