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

    console.log('Fixing PRODUCTS scope for repository:', repository)

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

    // Fix the PRODUCTS array scope - make it global
    const fixedContent = currentContent.replace(
      /const PRODUCTS = \[/g,
      'window.PRODUCTS = ['
    )

    // Also fix the initializeProducts function to use window.PRODUCTS
    const finalContent = fixedContent.replace(
      /PRODUCTS\s*&&\s*PRODUCTS\.length/g,
      'window.PRODUCTS && window.PRODUCTS.length'
    ).replace(
      /PRODUCTS\s*=\s*FALLBACK_PRODUCTS/g,
      'window.PRODUCTS = FALLBACK_PRODUCTS'
    ).replace(
      /PRODUCTS\s*=\s*products/g,
      'window.PRODUCTS = products'
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
        message: 'Fix PRODUCTS array scope - make it global so functions can access it',
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
      message: 'Successfully fixed PRODUCTS array scope - now global',
      result: result,
      details: {
        repository: repository,
        changes: 'Made PRODUCTS array global so functions can access it'
      }
    })

  } catch (error) {
    console.error('Error fixing PRODUCTS scope:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix PRODUCTS scope',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
