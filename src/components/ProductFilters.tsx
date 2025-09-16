'use client'

import { useState, useEffect } from 'react'

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

interface FilterState {
  category: string[]
  brand: string[]
  os: string[]
  priceRange: [number, number]
  color: string[]
  storage: string[]
  carrier: string[]
  lockStatus: string[]
  grade: string[]
  inStock: boolean | null
}

interface ProductFiltersProps {
  products: Product[]
  onFiltersChange: (filteredProducts: Product[]) => void
}

export default function ProductFilters({ products, onFiltersChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    brand: [],
    os: [],
    priceRange: [0, 2000],
    color: [],
    storage: [],
    carrier: [],
    lockStatus: [],
    grade: [],
    inStock: null
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // Extract unique values for filter options
  const getUniqueValues = (key: keyof Product | 'category' | 'os' | 'storage' | 'color' | 'carrier' | 'lockStatus' | 'grade', products: Product[]) => {
    const values = new Set<string>()
    
    products.forEach(product => {
      if (key === 'category') {
        // Determine category from tags or name
        const category = product.tags.find(tag => 
          ['phones', 'tablets', 'accessory', 'wearables'].includes(tag.toLowerCase())
        ) || (product.name.toLowerCase().includes('iphone') ? 'phones' :
              product.name.toLowerCase().includes('ipad') ? 'tablets' :
              product.name.toLowerCase().includes('watch') ? 'wearables' :
              'accessory')
        values.add(category)
      } else if (key === 'os') {
        // Determine OS from brand and model
        const os = product.brand.toLowerCase() === 'apple' ? 'iOS' :
                   product.brand.toLowerCase() === 'samsung' ? 'Android' :
                   product.brand.toLowerCase() === 'google' ? 'Android' :
                   'Other'
        values.add(os)
      } else if (key in product) {
        const value = product[key as keyof Product]
        if (typeof value === 'string' && value) {
          values.add(value)
        }
      } else if (key === 'storage' && product.specs.storage) {
        values.add(product.specs.storage)
      } else if (key === 'color' && product.specs.color) {
        values.add(product.specs.color)
      } else if (key === 'carrier' && product.specs.carrier) {
        values.add(product.specs.carrier)
      } else if (key === 'lockStatus' && product.specs.lockStatus) {
        values.add(product.specs.lockStatus)
      } else if (key === 'grade' && product.specs.grade) {
        values.add(product.specs.grade)
      }
    })
    
    return Array.from(values).sort()
  }

  // Get filter options
  const categories = getUniqueValues('category', products)
  const brands = getUniqueValues('brand', products)
  const osOptions = getUniqueValues('os', products)
  const colors = getUniqueValues('color', products)
  const storageOptions = getUniqueValues('storage', products)
  const carriers = getUniqueValues('carrier', products)
  const lockStatuses = getUniqueValues('lockStatus', products)
  const grades = getUniqueValues('grade', products)

  // Get price range
  const prices = products.map(p => p.price).filter(p => p > 0)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  // Apply filters
  useEffect(() => {
    let filteredProducts = [...products]

    // Category filter
    if (filters.category.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const productCategory = product.tags.find(tag => 
          ['phones', 'tablets', 'accessory', 'wearables'].includes(tag.toLowerCase())
        ) || (product.name.toLowerCase().includes('iphone') ? 'phones' :
              product.name.toLowerCase().includes('ipad') ? 'tablets' :
              product.name.toLowerCase().includes('watch') ? 'wearables' :
              'accessory')
        return filters.category.includes(productCategory)
      })
    }

    // Brand filter
    if (filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        filters.brand.includes(product.brand)
      )
    }

    // OS filter
    if (filters.os.length > 0) {
      filteredProducts = filteredProducts.filter(product => {
        const productOS = product.brand.toLowerCase() === 'apple' ? 'iOS' :
                         product.brand.toLowerCase() === 'samsung' ? 'Android' :
                         product.brand.toLowerCase() === 'google' ? 'Android' :
                         'Other'
        return filters.os.includes(productOS)
      })
    }

    // Price range filter
    filteredProducts = filteredProducts.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    )

    // Color filter
    if (filters.color.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        product.specs.color && filters.color.includes(product.specs.color)
      )
    }

    // Storage filter
    if (filters.storage.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        product.specs.storage && filters.storage.includes(product.specs.storage)
      )
    }

    // Carrier filter
    if (filters.carrier.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        product.specs.carrier && filters.carrier.includes(product.specs.carrier)
      )
    }

    // Lock status filter
    if (filters.lockStatus.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        product.specs.lockStatus && filters.lockStatus.includes(product.specs.lockStatus)
      )
    }

    // Grade filter
    if (filters.grade.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        product.specs.grade && filters.grade.includes(product.specs.grade)
      )
    }

    // Stock filter
    if (filters.inStock !== null) {
      filteredProducts = filteredProducts.filter(product => 
        filters.inStock ? product.inStock : !product.inStock
      )
    }

    onFiltersChange(filteredProducts)
  }, [filters, products, onFiltersChange])

  const updateFilter = (key: keyof FilterState, value: string[] | [number, number] | boolean | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      category: [],
      brand: [],
      os: [],
      priceRange: [minPrice, maxPrice],
      color: [],
      storage: [],
      carrier: [],
      lockStatus: [],
      grade: [],
      inStock: null
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category.length > 0) count++
    if (filters.brand.length > 0) count++
    if (filters.os.length > 0) count++
    if (filters.color.length > 0) count++
    if (filters.storage.length > 0) count++
    if (filters.carrier.length > 0) count++
    if (filters.lockStatus.length > 0) count++
    if (filters.grade.length > 0) count++
    if (filters.inStock !== null) count++
    if (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) count++
    return count
  }

  const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  )

  const CheckboxGroup = ({ 
    options, 
    selected, 
    onChange, 
    maxItems = 5,
    title
  }: { 
    options: string[], 
    selected: string[], 
    onChange: (value: string[]) => void,
    maxItems?: number,
    title: string
  }) => {
    const [showAll, setShowAll] = useState(false)
    const displayOptions = showAll ? options : options.slice(0, maxItems)

    const toggleOption = (option: string) => {
      const newSelected = selected.includes(option)
        ? selected.filter(s => s !== option)
        : [...selected, option]
      onChange(newSelected)
    }

    return (
      <div className="space-y-2">
        {displayOptions.map(option => (
          <label key={option} className="flex items-center">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleOption(option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 capitalize">
              {option} ({products.filter(p => {
                if (title === 'Category') {
                  const category = p.tags.find(tag => 
                    ['phones', 'tablets', 'accessory', 'wearables'].includes(tag.toLowerCase())
                  ) || (p.name.toLowerCase().includes('iphone') ? 'phones' :
                        p.name.toLowerCase().includes('ipad') ? 'tablets' :
                        p.name.toLowerCase().includes('watch') ? 'wearables' :
                        'accessory')
                  return category === option
                } else if (title === 'Brand') return p.brand === option
                else if (title === 'OS') {
                  const os = p.brand.toLowerCase() === 'apple' ? 'iOS' :
                           p.brand.toLowerCase() === 'samsung' ? 'Android' :
                           p.brand.toLowerCase() === 'google' ? 'Android' :
                           'Other'
                  return os === option
                } else if (title === 'Color') return p.specs.color === option
                else if (title === 'Storage') return p.specs.storage === option
                else if (title === 'Carrier') return p.specs.carrier === option
                else if (title === 'Lock Status') return p.specs.lockStatus === option
                else if (title === 'Grade') return p.specs.grade === option
                return false
              }).length})
            </span>
          </label>
        ))}
        {options.length > maxItems && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showAll ? 'Show less' : `Show ${options.length - maxItems} more`}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`p-4 ${isExpanded ? 'block' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category */}
          <FilterSection title="Category">
            <CheckboxGroup
              options={categories}
              selected={filters.category}
              onChange={(value) => updateFilter('category', value)}
              title="Category"
            />
          </FilterSection>

          {/* Brand */}
          <FilterSection title="Brand">
            <CheckboxGroup
              options={brands}
              selected={filters.brand}
              onChange={(value) => updateFilter('brand', value)}
              title="Brand"
            />
          </FilterSection>

          {/* OS */}
          <FilterSection title="OS">
            <CheckboxGroup
              options={osOptions}
              selected={filters.os}
              onChange={(value) => updateFilter('os', value)}
              title="OS"
            />
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">${filters.priceRange[0]}</span>
                <span className="text-sm text-gray-400">-</span>
                <span className="text-sm text-gray-600">${filters.priceRange[1]}</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </FilterSection>

          {/* Color */}
          <FilterSection title="Color">
            <CheckboxGroup
              options={colors}
              selected={filters.color}
              onChange={(value) => updateFilter('color', value)}
              title="Color"
            />
          </FilterSection>

          {/* Storage */}
          <FilterSection title="Storage">
            <CheckboxGroup
              options={storageOptions}
              selected={filters.storage}
              onChange={(value) => updateFilter('storage', value)}
              title="Storage"
            />
          </FilterSection>

          {/* Carrier */}
          <FilterSection title="Carrier">
            <CheckboxGroup
              options={carriers}
              selected={filters.carrier}
              onChange={(value) => updateFilter('carrier', value)}
              title="Carrier"
            />
          </FilterSection>

          {/* Lock Status */}
          <FilterSection title="Lock Status">
            <CheckboxGroup
              options={lockStatuses}
              selected={filters.lockStatus}
              onChange={(value) => updateFilter('lockStatus', value)}
              title="Lock Status"
            />
          </FilterSection>

          {/* Grade */}
          <FilterSection title="Grade">
            <CheckboxGroup
              options={grades}
              selected={filters.grade}
              onChange={(value) => updateFilter('grade', value)}
              title="Grade"
            />
          </FilterSection>

          {/* Stock Status */}
          <FilterSection title="Stock Status">
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="stock"
                  checked={filters.inStock === null}
                  onChange={() => updateFilter('inStock', null)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">All</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="stock"
                  checked={filters.inStock === true}
                  onChange={() => updateFilter('inStock', true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="stock"
                  checked={filters.inStock === false}
                  onChange={() => updateFilter('inStock', false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
              </label>
            </div>
          </FilterSection>
        </div>
      </div>
    </div>
  )
}
