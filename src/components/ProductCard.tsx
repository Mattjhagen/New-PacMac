'use client'

// import { ShoppingCartIcon } from '@heroicons/react/24/outline'

interface Product {
  id: string
  name: string
  brand: string
  model: string
  price: number
  description: string
  imageUrl?: string
  img: string
  tags: string[]
  specs: {
    display?: string
    processor?: string
    memory?: string
    storage?: string
    camera?: string
    battery?: string
    os?: string
    color?: string
    carrier?: string
    lockStatus?: string
    grade?: string
  }
  inStock: boolean
  stockCount: number
  category: string
  createdAt: string
  updatedAt: string
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  showAddToCart?: boolean
}

export default function ProductCard({ product, onAddToCart, showAddToCart = false }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSpecValue = (specs: Record<string, unknown>, key: string): string | null => {
    return specs && key in specs && specs[key] ? String(specs[key]) : null
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm">No image</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {product.brand} {product.model}
            </p>
            <p className="text-2xl font-bold text-blue-600 mb-3">
              {formatPrice(product.price)}
            </p>
          </div>
          
          {/* Stock Status */}
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              product.inStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
            {product.inStock && (
              <span className="text-xs text-gray-500 mt-1">
                {product.stockCount} available
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Key Specs */}
        {product.specs && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Specs:</h4>
            <div className="space-y-1">
              {getSpecValue(product.specs || {}, 'display') && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Display:</span> {getSpecValue(product.specs || {}, 'display')}
                </p>
              )}
              {getSpecValue(product.specs || {}, 'processor') && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Processor:</span> {getSpecValue(product.specs || {}, 'processor')}
                </p>
              )}
              {getSpecValue(product.specs || {}, 'storage') && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Storage:</span> {getSpecValue(product.specs || {}, 'storage')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Created Date */}
        <p className="text-xs text-gray-400 mb-4">
          Added {formatDate(product.createdAt)}
        </p>

        {/* Action Buttons */}
        {showAddToCart && onAddToCart && (
          <div className="flex space-x-2">
            <button
              onClick={() => onAddToCart(product)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              🛒 Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
