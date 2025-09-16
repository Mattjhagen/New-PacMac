'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

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

interface ProductTemplate {
  name: string
  category: string
  description: string
  specs: {
    storage: string
    color: string
    condition: string
    brand: string
    model: string
    screen?: string
    camera?: string
    processor?: string
    connectivity?: string
  }
  tags: string[]
  basePrice: number
}

interface ProductFormProps {
  product?: Product | null
  onSuccess: () => void
  onCancel: () => void
  autofillSuggestions?: ProductTemplate[]
  showAutofillSuggestions?: boolean
  onProductNameChange?: (value: string) => void
  onSelectAutofillSuggestion?: (suggestion: ProductTemplate) => void
}

export default function ProductForm({ 
  product, 
  onSuccess, 
  onCancel, 
  autofillSuggestions = [], 
  showAutofillSuggestions = false, 
  onProductNameChange, 
  onSelectAutofillSuggestion 
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    price: '',
    description: '',
    imageUrl: '',
    specs: {
      display: '',
      processor: '',
      memory: '',
      storage: '',
      camera: '',
      battery: '',
      os: ''
    },
    inStock: true,
    stockCount: '',
    category: 'phone'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        model: product.model,
        price: product.price.toString(),
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        specs: {
          display: (product.specs as Record<string, unknown>)?.display as string || '',
          processor: (product.specs as Record<string, unknown>)?.processor as string || '',
          memory: (product.specs as Record<string, unknown>)?.memory as string || '',
          storage: (product.specs as Record<string, unknown>)?.storage as string || '',
          camera: (product.specs as Record<string, unknown>)?.camera as string || '',
          battery: (product.specs as Record<string, unknown>)?.battery as string || '',
          os: (product.specs as Record<string, unknown>)?.os as string || ''
        },
        inStock: product.inStock,
        stockCount: product.stockCount.toString(),
        category: product.category
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stockCount: parseInt(formData.stockCount) || 0,
          specs: JSON.stringify(formData.specs)
        })
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        console.error('API Error:', error)
        alert(`Error: ${error.error}${error.details ? `\nDetails: ${error.details}` : ''}`)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('specs.')) {
      const specKey = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          [specKey]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={(e) => {
                handleInputChange(e)
                onProductNameChange?.(e.target.value)
              }}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., iPhone 15 Pro"
            />
            
            {/* Autofill Suggestions */}
            {showAutofillSuggestions && autofillSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {autofillSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      onSelectAutofillSuggestion?.(suggestion)
                      setFormData(prev => ({
                        ...prev,
                        name: suggestion.name,
                        brand: suggestion.specs.brand || '',
                        model: suggestion.specs.model || '',
                        description: suggestion.description || '',
                        price: suggestion.basePrice?.toString() || '',
                        specs: {
                          ...prev.specs,
                          display: suggestion.specs.screen || '',
                          processor: suggestion.specs.processor || '',
                          storage: suggestion.specs.storage || '',
                          camera: suggestion.specs.camera || ''
                        }
                      }))
                    }}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">
                      {suggestion.specs.brand} • {suggestion.specs.storage} • ${suggestion.basePrice}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {suggestion.tags.slice(0, 3).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Brand *
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              required
              value={formData.brand}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., Apple"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model *
            </label>
            <input
              type="text"
              id="model"
              name="model"
              required
              value={formData.model}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., A3108"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="999.99"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Product description..."
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Phone Specifications */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Phone Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="specs.display" className="block text-sm font-medium text-gray-700">
                Display
              </label>
              <input
                type="text"
                id="specs.display"
                name="specs.display"
                value={formData.specs.display}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="6.1-inch Super Retina XDR"
              />
            </div>

            <div>
              <label htmlFor="specs.processor" className="block text-sm font-medium text-gray-700">
                Processor
              </label>
              <input
                type="text"
                id="specs.processor"
                name="specs.processor"
                value={formData.specs.processor}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="A17 Pro chip"
              />
            </div>

            <div>
              <label htmlFor="specs.memory" className="block text-sm font-medium text-gray-700">
                Memory (RAM)
              </label>
              <input
                type="text"
                id="specs.memory"
                name="specs.memory"
                value={formData.specs.memory}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="8GB"
              />
            </div>

            <div>
              <label htmlFor="specs.storage" className="block text-sm font-medium text-gray-700">
                Storage
              </label>
              <input
                type="text"
                id="specs.storage"
                name="specs.storage"
                value={formData.specs.storage}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="128GB, 256GB, 512GB, 1TB"
              />
            </div>

            <div>
              <label htmlFor="specs.camera" className="block text-sm font-medium text-gray-700">
                Camera
              </label>
              <input
                type="text"
                id="specs.camera"
                name="specs.camera"
                value={formData.specs.camera}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="48MP Main, 12MP Ultra Wide, 12MP Telephoto"
              />
            </div>

            <div>
              <label htmlFor="specs.battery" className="block text-sm font-medium text-gray-700">
                Battery
              </label>
              <input
                type="text"
                id="specs.battery"
                name="specs.battery"
                value={formData.specs.battery}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Up to 23 hours video playback"
              />
            </div>

            <div>
              <label htmlFor="specs.os" className="block text-sm font-medium text-gray-700">
                Operating System
              </label>
              <input
                type="text"
                id="specs.os"
                name="specs.os"
                value={formData.specs.os}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="iOS 17"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stockCount" className="block text-sm font-medium text-gray-700">
                Stock Count
              </label>
              <input
                type="number"
                id="stockCount"
                name="stockCount"
                min="0"
                value={formData.stockCount}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="10"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={formData.inStock}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                In Stock
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </div>
  )
}
