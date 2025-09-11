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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [loading, setLoading] = useState(true)

  // Sample products for demo
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      price: 999,
      description: 'Latest iPhone with titanium design and A17 Pro chip',
      img: '📱',
      tags: ['Apple', 'iPhone', 'Pro'],
      specs: {
        display: '6.1" Super Retina XDR',
        processor: 'A17 Pro',
        storage: '128GB',
        camera: '48MP Main Camera'
      },
      inStock: true,
      stockCount: 5,
      category: 'smartphone',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      brand: 'Samsung',
      model: 'Galaxy S24',
      price: 799,
      description: 'AI-powered smartphone with advanced camera features',
      img: '📱',
      tags: ['Samsung', 'Galaxy', 'AI'],
      specs: {
        display: '6.2" Dynamic AMOLED 2X',
        processor: 'Snapdragon 8 Gen 3',
        storage: '128GB',
        camera: '50MP Main Camera'
      },
      inStock: true,
      stockCount: 3,
      category: 'smartphone',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'MacBook Air M3',
      brand: 'Apple',
      model: 'MacBook Air M3',
      price: 1199,
      description: 'Ultra-thin laptop with M3 chip and all-day battery',
      img: '💻',
      tags: ['Apple', 'MacBook', 'M3'],
      specs: {
        display: '13.6" Liquid Retina',
        processor: 'Apple M3',
        storage: '256GB SSD',
        memory: '8GB Unified Memory'
      },
      inStock: true,
      stockCount: 2,
      category: 'laptop',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  useEffect(() => {
    // Simulate loading products
    setTimeout(() => {
      setProducts(sampleProducts)
      setLoading(false)
    }, 1000)
  }, [])

  const swipeCard = (direction: 'left' | 'right' | 'up') => {
    const currentCard = document.querySelector('.product-card')
    if (!currentCard) return

    const productId = currentCard.getAttribute('data-product-id')
    
    // Add swipe animation
    currentCard.classList.add(`swipe-${direction}`)
    
    // Handle the swipe action
    setTimeout(() => {
      setCurrentCardIndex(prev => prev + 1)
    }, 300)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()

    setCurrentX(e.touches[0].clientX)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const deltaX = currentX - startX
    const deltaY = currentY - startY
    const threshold = 100

    if (Math.abs(deltaX) > threshold) {
      swipeCard(deltaX > 0 ? 'right' : 'left')
    } else if (deltaY < -threshold) {
      swipeCard('up')
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setStartY(e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setCurrentX(e.clientX)
    setCurrentY(e.clientY)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    const deltaX = currentX - startX
    const deltaY = currentY - startY
    const threshold = 100

    if (Math.abs(deltaX) > threshold) {
      swipeCard(deltaX > 0 ? 'right' : 'left')
    } else if (deltaY < -threshold) {
      swipeCard('up')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading tech near you...</p>
        </div>
      </div>
    )
  }

  if (currentCardIndex >= products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h3 className="text-2xl font-bold mb-4">No more tech nearby!</h3>
          <p className="text-lg mb-8 opacity-80">Check back later for new devices in your area.</p>
          <button 
            onClick={() => setCurrentCardIndex(0)}
            className="btn btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const currentProduct = products[currentCardIndex]
  const nextProduct = products[currentCardIndex + 1]
  const thirdProduct = products[currentCardIndex + 2]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass p-4 flex justify-between items-center">
        <div className="flex items-center gap-3 text-white">
          <div className="w-9 h-9 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-xl">
            📱
          </div>
          <span className="text-xl font-bold">PacMac Mobile</span>
        </div>
        <div className="text-white text-sm">
          Swipe to discover tech
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-5">
        <div className="flex-1 relative flex justify-center items-center mb-5">
          {/* Product Cards */}
          {currentProduct && (
            <div
              className="absolute w-full max-w-sm h-3/4 bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
              style={{
                zIndex: 3,
                transform: isDragging ? `translate(${currentX - startX}px, ${currentY - startY}px) rotate(${(currentX - startX) * 0.1}deg)` : ''
              }}
              data-product-id={currentProduct.id}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <div className="w-full h-3/5 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
                {currentProduct.img}
              </div>
              <div className="p-6 h-2/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{currentProduct.name}</h3>
                  <p className="text-2xl font-bold text-red-500 mb-3">${currentProduct.price}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{currentProduct.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(currentProduct.specs).map(([key, value]) => (
                      <span key={key} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Card */}
          {nextProduct && (
            <div
              className="absolute w-full max-w-sm h-3/4 bg-white rounded-2xl shadow-2xl overflow-hidden"
              style={{
                zIndex: 2,
                transform: 'scale(0.95) translateY(10px)'
              }}
            >
              <div className="w-full h-3/5 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
                {nextProduct.img}
              </div>
              <div className="p-6 h-2/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{nextProduct.name}</h3>
                  <p className="text-2xl font-bold text-red-500 mb-3">${nextProduct.price}</p>
                </div>
              </div>
            </div>
          )}

          {/* Third Card */}
          {thirdProduct && (
            <div
              className="absolute w-full max-w-sm h-3/4 bg-white rounded-2xl shadow-2xl overflow-hidden"
              style={{
                zIndex: 1,
                transform: 'scale(0.9) translateY(20px)'
              }}
            >
              <div className="w-full h-3/5 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
                {thirdProduct.img}
              </div>
              <div className="p-6 h-2/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{thirdProduct.name}</h3>
                  <p className="text-2xl font-bold text-red-500 mb-3">${thirdProduct.price}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-5 pb-5">
          <button
            onClick={() => swipeCard('left')}
            className="w-15 h-15 rounded-full bg-white text-red-500 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
            title="Pass"
          >
            ✕
          </button>
          <button
            onClick={() => swipeCard('up')}
            className="w-15 h-15 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
            title="Super Like"
          >
            ⭐
          </button>
          <button
            onClick={() => swipeCard('right')}
            className="w-15 h-15 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
            title="Like"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  )
}
// Deployment trigger Thu Sep 11 01:34:34 CDT 2025
