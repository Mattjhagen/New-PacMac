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

// Simple in-memory storage for products (shared with main route)
// Using a global variable to persist across requests
declare global {
  var __products: Product[] | undefined
}

const products = globalThis.__products ?? (globalThis.__products = [])

// GET /api/products/[id] - Fetch a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = products.find(p => p.id === id)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const {
      name,
      brand,
      model,
      price,
      description,
      imageUrl,
      specs,
      inStock,
      stockCount,
      category
    } = body

    const { id } = await params
    const productIndex = products.findIndex(p => p.id === id)

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update product in in-memory storage
    products[productIndex] = {
      ...products[productIndex],
      ...(name && { name }),
      ...(brand && { brand }),
      ...(model && { model }),
      ...(price && { price: parseFloat(price) }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(specs && { specs: typeof specs === 'string' ? JSON.parse(specs) : specs }),
      ...(inStock !== undefined && { inStock }),
      ...(stockCount !== undefined && { stockCount: parseInt(stockCount) }),
      ...(category && { category }),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(products[productIndex])
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productIndex = products.findIndex(p => p.id === id)

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Remove product from in-memory storage
    products.splice(productIndex, 1)

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
