import { NextRequest, NextResponse } from 'next/server'
import { fetchMultipleProductImages } from '@/lib/imageFetcher'

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

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json()
    
    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      )
    }

    // Fetch products from in-memory storage
    const productsWithoutImages = products.filter(product => 
      productIds.includes(product.id) && !product.imageUrl
    )

    if (productsWithoutImages.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: 'No products found that need images'
      })
    }

    // Prepare data for image fetching
    const productsToFetch = productsWithoutImages.map(product => ({
      brand: product.brand,
      model: product.model,
      name: product.name
    }))

    // Fetch images in batch
    const imageResults = await fetchMultipleProductImages(productsToFetch)

    // Update products with fetched images in memory
    let updatedCount = 0
    productsWithoutImages.forEach((product) => {
      const key = `${product.brand}-${product.model}`
      const imageUrl = imageResults.get(key)
      
      if (imageUrl) {
        // Find and update the product in the global array
        const productIndex = products.findIndex(p => p.id === product.id)
        if (productIndex !== -1) {
          products[productIndex] = {
            ...products[productIndex],
            imageUrl,
            updatedAt: new Date().toISOString()
          }
          updatedCount++
        }
      }
    })

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: productsWithoutImages.length,
      message: `Successfully updated ${updatedCount} out of ${productsWithoutImages.length} products with images`
    })

  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
