import { NextRequest, NextResponse } from 'next/server'
import { fetchMultipleProductSpecs, generateDescriptionFromSpecs } from '@/lib/specsFetcher'

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
    const productsToUpdate = products.filter(product => 
      productIds.includes(product.id)
    )

    if (productsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: 'No products found'
      })
    }

    // Prepare data for specs fetching
    const productsToFetch = productsToUpdate.map(product => ({
      brand: product.brand,
      model: product.model,
      specs: product.specs as Record<string, unknown>
    }))

    // Fetch specifications in batch
    const specsResults = await fetchMultipleProductSpecs(productsToFetch)

    // Update products with fetched specifications in memory
    let updatedCount = 0
    productsToUpdate.forEach((product) => {
      const key = `${product.brand}-${product.model}`
      const fetchedSpecs = specsResults.get(key)
      
      if (fetchedSpecs && Object.keys(fetchedSpecs).length > 0) {
        // Merge with existing specs
        const mergedSpecs = { ...(product.specs as Record<string, unknown> || {}), ...fetchedSpecs }
        
        // Generate description if missing or update if specs changed significantly
        let description = product.description
        if (!description || Object.keys(fetchedSpecs).length > 2) {
          description = generateDescriptionFromSpecs(mergedSpecs, product.brand, product.model)
        }

        // Find and update the product in the global array
        const productIndex = products.findIndex(p => p.id === product.id)
        if (productIndex !== -1) {
          products[productIndex] = {
            ...products[productIndex],
            specs: mergedSpecs,
            description: description,
            updatedAt: new Date().toISOString()
          }
          updatedCount++
        }
      }
    })

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: productsToUpdate.length,
      message: `Successfully updated ${updatedCount} out of ${productsToUpdate.length} products with specifications`
    })

  } catch (error) {
    console.error('Error fetching specifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch specifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
