'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  brand: string
  model: string
  price: number
  description: string
  inStock: boolean
  stockCount: number
  category: string
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalTransactions: 0,
    activeUsers: 0
  })

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'iPhone 15 Pro',
          brand: 'Apple',
          model: 'iPhone 15 Pro',
          price: 999,
          description: 'Latest iPhone with titanium design',
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
          description: 'AI-powered smartphone',
          inStock: true,
          stockCount: 3,
          category: 'smartphone',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
      setStats({
        totalProducts: 2,
        totalUsers: 15,
        totalTransactions: 8,
        activeUsers: 12
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading admin data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="glass p-6 rounded-2xl mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">📱 PacMac Mobile Admin</h1>
          <p className="text-white opacity-80">Manage your tech marketplace</p>
          <div className="mt-4 flex gap-4 justify-center">
            <a href="/" className="btn btn-primary">← Back to App</a>
            <a href="https://admin.pacmacmobile.com" target="_blank" className="btn btn-secondary">Full Admin Dashboard</a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalProducts}</div>
            <div className="text-white opacity-80">Total Products</div>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalUsers}</div>
            <div className="text-white opacity-80">Total Users</div>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalTransactions}</div>
            <div className="text-white opacity-80">Transactions</div>
          </div>
          <div className="glass p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.activeUsers}</div>
            <div className="text-white opacity-80">Active Users</div>
          </div>
        </div>

        {/* Products Section */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Product Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-red-500 mb-3">${product.price}</p>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="text-sm text-gray-500">Stock: {product.stockCount}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn btn-primary text-sm px-4 py-2">Edit</button>
                  <button className="btn bg-red-500 text-white text-sm px-4 py-2 hover:bg-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass p-6 rounded-2xl mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary">Add Product</button>
            <button className="btn btn-secondary">View Users</button>
            <button className="btn btn-success">View Transactions</button>
            <button className="btn bg-yellow-500 text-white hover:bg-yellow-600">Export Data</button>
          </div>
        </div>
      </div>
    </div>
  )
}
