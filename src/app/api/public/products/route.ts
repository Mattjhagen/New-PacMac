import { NextResponse } from 'next/server'

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

// GET /api/public/products - Public endpoint for main website to fetch products
export async function GET() {
  try {
    // Filter products that are in stock and sort by creation date
    const inStockProducts = products
      .filter(product => product.inStock)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Transform the data for the main website
    const publicProducts = inStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand,
      model: product.model,
      price: product.price,
      description: product.description,
      image: product.imageUrl, // Map imageUrl to image for compatibility
      imageUrl: product.imageUrl,
      specs: product.specs,
      stockCount: product.stockCount,
      category: product.category,
      // Add tags for compatibility with existing site
      tags: [
        product.brand,
        product.model,
        product.category,
        ...(product.specs && typeof product.specs === 'object' && 'storage' in product.specs ? [String(product.specs.storage)] : []),
        ...(product.specs && typeof product.specs === 'object' && 'memory' in product.specs ? [String(product.specs.memory)] : [])
      ].filter(Boolean)
    }))

    return NextResponse.json(publicProducts, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    })
  } catch (error) {
    console.error('Error fetching public products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    )
  }
}
