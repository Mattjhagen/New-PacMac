
'use client'

import { useState, useEffect } from 'react'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'
import { useAuth } from '@/contexts/AuthContext'
import ProductCard from '@/components/ProductCard'
import ProductFilters from '@/components/ProductFilters'
// Removed UserRegistration and UserLogin imports - using Google OAuth only
import LocationPicker from '@/components/LocationPicker'
import CheckoutModal from '@/components/CheckoutModal'
import ProductCheckoutModal from '@/components/ProductCheckoutModal'
import SplashScreen from '@/components/SplashScreen'
import OAuthSplashScreen from '@/components/OAuthSplashScreen'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Link from 'next/link'

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

function PacMacMarketplace() {
  const { user, session, loading: authLoading, signOut, updateProfile } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'brand'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // UI state
  // Removed showUserLogin and showUserRegister - using Google OAuth only
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [splashDismissed, setSplashDismissed] = useState(false)
  
  // OAuth Authentication State
  const [isOAuthAuthenticated, setIsOAuthAuthenticated] = useState(false)
  const [oauthUser, setOauthUser] = useState<{ id: string; name: string; email: string; login: string; avatar?: string } | null>(null)
  const [showOAuthSplash, setShowOAuthSplash] = useState(true)

  // Reset splash dismissed state when user logs out
  useEffect(() => {
    if (!user && !authLoading) {
      setSplashDismissed(false)
    }
  }, [user, authLoading])

  // Check for existing OAuth authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('google_token');
    const user = localStorage.getItem('google_user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setOauthUser(userData);
        setIsOAuthAuthenticated(true);
        setShowOAuthSplash(false);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_user');
      }
    }
  }, []);
  
  // Customer states
  const [showCheckout, setShowCheckout] = useState(false)
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)


  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/public/products')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([]) // Set empty array on error
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Initialize filtered products when products change
  useEffect(() => {
    setFilteredProducts(products)
  }, [products])

  // User authentication handlers
  const handleUserLogout = async () => {
    await signOut()
  }

  const handleLocationSelect = async (location: { address: string; coordinates: { lat: number; lng: number } }) => {
    if (user) {
      // Update user location - transform to match expected format
      const locationData = {
        city: location.address.split(',')[0] || '',
        state: location.address.split(',')[1]?.trim() || ''
      }
      await updateProfile({ location: locationData })
    }
    setShowLocationPicker(false)
  }

  // Cart and checkout functions
  const addToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1
    }
    setCart(prev => [...prev, cartItem])
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const handleCheckoutSuccess = () => {
    setCart([])
    setShowCheckout(false)
    // You can add success notification here
  }

  // Buy Now handler for individual products
  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product)
    setShowCheckoutModal(true)
  }

  const handlePaymentSuccess = (paymentIntent: { id: string; status: string }) => {
    console.log('Payment successful:', paymentIntent)
    setShowCheckoutModal(false)
    setSelectedProduct(null)
    
    // Store payment details for success page
    if (selectedProduct) {
      localStorage.setItem('lastPayment', JSON.stringify({
        paymentIntentId: paymentIntent.id,
        amount: selectedProduct.price,
        productName: selectedProduct.name,
      }))
    }
    
    // Redirect to success page
    window.location.href = '/payment-success'
  }

  // OAuth Authentication Handlers
  const handleOAuthSuccess = (user: { id: string; name: string; email: string; login: string; avatar?: string }, token: string) => {
    // Clear any old GitHub tokens
    localStorage.removeItem('github_token')
    localStorage.removeItem('github_user')
    
    setOauthUser(user)
    setIsOAuthAuthenticated(true)
    setShowOAuthSplash(false)
    console.log('OAuth authentication successful:', user)
  }

  const handleOAuthLogout = () => {
    // Clear localStorage
    localStorage.removeItem('google_token')
    localStorage.removeItem('google_user')
    
    setOauthUser(null)
    setIsOAuthAuthenticated(false)
    setShowOAuthSplash(true)
    console.log('OAuth logout successful')
  }

  // Splash screen handlers
  const handleSplashGetStarted = () => {
    setSplashDismissed(true)
    // Don't show login modal, just dismiss splash
  }

  const handleSplashSkip = () => {
    setSplashDismissed(true)
    // Don't show login modal, just dismiss splash
  }

  // Debug authentication state
  console.log('Auth Debug:', { user: !!user, authLoading, splashDismissed, isOAuthAuthenticated, showOAuthSplash })

  // OAuth Splash Screen - Show by default
  if (showOAuthSplash) {
    return (
      <OAuthSplashScreen
        onAuthSuccess={handleOAuthSuccess}
        onLogout={handleOAuthLogout}
        isAuthenticated={isOAuthAuthenticated}
        currentUser={oauthUser ?? undefined}
      />
    )
  }

  // Show splash screen if not logged in, not loading, and splash hasn't been dismissed
  // Only show if OAuth is not authenticated
  if (!user && !authLoading && !splashDismissed && !isOAuthAuthenticated) {
    console.log('Showing splash screen')
    return (
      <SplashScreen 
        onGetStarted={handleSplashGetStarted}
        onSkip={handleSplashSkip}
      />
    )
  }

  // Fallback: If authentication is taking too long, show splash screen
  if (authLoading && !splashDismissed) {
    console.log('Auth loading, showing splash screen as fallback')
    return (
      <SplashScreen 
        onGetStarted={handleSplashGetStarted}
        onSkip={handleSplashSkip}
      />
    )
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  PacMac Mobile
                </h1>
                <p className="text-gray-600">
                  Premium mobile devices at unbeatable prices
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* OAuth User Display */}
              {isOAuthAuthenticated && oauthUser && (
                <div className="flex items-center space-x-3">
                  <img
                    src={oauthUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(oauthUser.name)}&background=3b82f6&color=fff`}
                    alt={oauthUser.name}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{oauthUser.name}</div>
                    <div className="text-gray-500">@{oauthUser.login}</div>
                  </div>
                  
                  {/* Marketplace Button for OAuth Users */}
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <span className="mr-1">💖</span>
                    Marketplace
                  </Link>
                  
                  {/* Bank Setup Button for OAuth Users */}
                  <Link
                    href="/bank-setup"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                  >
                    <span className="mr-1">🏦</span>
                    Bank Setup
                  </Link>
                  
                  {/* Disputes Button for OAuth Users */}
                  <Link
                    href="/disputes"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 transition-all duration-200"
                  >
                    <span className="mr-1">⚖️</span>
                    Disputes
                  </Link>
                  
                  {/* Contact Button for OAuth Users */}
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <span className="mr-1">📞</span>
                    Contact
                  </Link>
                  
                  <button
                    onClick={handleOAuthLogout}
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              )}
              
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* User Location Display */}
                   {user?.user_metadata?.location && (
                    <div className="text-sm text-gray-600">
                      📍 {user?.user_metadata?.location?.city}, {user?.user_metadata?.location?.state}
                    </div>
                  )}
                  
                  {/* Marketplace Button */}
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">💖</span>
                    Tinder Marketplace
                  </Link>
                  
                  {/* Escrow Dashboard Button */}
                  <Link
                    href="/escrow-dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">🛡️</span>
                    Escrow Dashboard
                  </Link>
                  
                  {/* Bank Setup Button */}
                  <Link
                    href="/bank-setup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">🏦</span>
                    Bank Setup
                  </Link>
                  
                  {/* Disputes Button */}
                  <Link
                    href="/disputes"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">⚖️</span>
                    Disputes
                  </Link>
                  
                  {/* Contact Button */}
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span className="mr-2">📞</span>
                    Contact
                  </Link>
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.user_metadata?.firstName?.[0]}{user?.user_metadata?.lastName?.[0] || user?.email?.[0]}
                    </div>
                    <span>{user?.user_metadata?.firstName} {user?.user_metadata?.lastName || user?.email}</span>
                  </div>
                  
                  <button
                    onClick={handleUserLogout}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowUserLogin(true)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowUserRegister(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Account
                  </button>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 relative"
                    >
                      🛒 Cart ({cart.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Call to Action for Unauthenticated Users */}
        {!user && splashDismissed && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to PacMac Mobile! 🚀
              </h2>
              <p className="text-gray-600 mb-4">
                Sign in to browse our premium mobile devices and start shopping
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowUserLogin(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowUserRegister(true)}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {products.length > 0 && (
          <div className="mb-8">
            <ProductFilters 
              products={products}
              onFiltersChange={setFilteredProducts}
            />
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back soon for our latest mobile devices.</p>
          </div>
        ) : (
          <div>
            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Products ({filteredProducts.length})
                </h2>
                {filteredProducts.length !== products.length && (
                  <span className="text-sm text-gray-500">
                    of {products.length} total
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field as 'name' | 'price' | 'brand')
                    setSortOrder(order as 'asc' | 'desc')
                  }}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="brand-asc">Brand A-Z</option>
                  <option value="brand-desc">Brand Z-A</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products match your filters</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts
                  .sort((a, b) => {
                    let aValue: string | number
                    let bValue: string | number
                    
                    if (sortBy === 'name') {
                      aValue = a.name.toLowerCase()
                      bValue = b.name.toLowerCase()
                    } else if (sortBy === 'price') {
                      aValue = a.price
                      bValue = b.price
                    } else {
                      aValue = a.brand.toLowerCase()
                      bValue = b.brand.toLowerCase()
                    }
                    
                    if (sortOrder === 'asc') {
                      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
                    } else {
                      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
                    }
                  })
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onBuyNow={handleBuyNow}
                      showAddToCart={true}
                      showBuyNow={true}
                    />
                  ))}
              </div>
            )}
          </div>
        )}


        {/* User Authentication Modals */}
        {/* Supabase login modals removed - using Google OAuth only */}

        {showLocationPicker && (
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            onCancel={() => setShowLocationPicker(false)}
            initialLocation={undefined}
          />
        )}


        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cartItems={cart}
          onPaymentSuccess={handleCheckoutSuccess}
        />

        {/* Individual Product Checkout Modal */}
        <ProductCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          product={selectedProduct}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <ErrorBoundary>
      <PacMacMarketplace />
    </ErrorBoundary>
  )
}
