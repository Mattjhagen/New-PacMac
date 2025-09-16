'use client'

import { useState, useEffect } from 'react'
import { 
  DevicePhoneMobileIcon, 
  MapPinIcon, 
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface WelcomeDashboardProps {
  onGetStarted: () => void
  onExploreFeatures: () => void
  user?: { id: string; name: string; email: string; firstName?: string; lastName?: string }
}

export default function WelcomeDashboard({ onGetStarted, onExploreFeatures, user }: WelcomeDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalTransactions: 0,
    averageRating: 0
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'sale',
      user: 'Sarah M.',
      item: 'iPhone 15 Pro',
      price: '$899',
      location: 'New York, NY',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'listing',
      user: 'Mike C.',
      item: 'Samsung Galaxy S24',
      price: '$799',
      location: 'Los Angeles, CA',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'sale',
      user: 'Emily R.',
      item: 'iPad Pro 12.9"',
      price: '$1,099',
      location: 'Chicago, IL',
      time: '6 hours ago'
    }
  ])

  const [trendingItems, setTrendingItems] = useState([
    { name: 'iPhone 15 Pro', searches: 1247, price: '$899' },
    { name: 'Samsung Galaxy S24', searches: 892, price: '$799' },
    { name: 'iPad Pro 12.9"', searches: 654, price: '$1,099' },
    { name: 'Apple Watch Series 9', searches: 543, price: '$399' }
  ])

  // Animate stats on load
  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        totalUsers: 12450,
        totalListings: 8932,
        totalTransactions: 15678,
        averageRating: 4.9
      }

      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        setStats({
          totalUsers: Math.floor(targetStats.totalUsers * progress),
          totalListings: Math.floor(targetStats.totalListings * progress),
          totalTransactions: Math.floor(targetStats.totalTransactions * progress),
          averageRating: Math.round(targetStats.averageRating * progress * 10) / 10
        })

        if (currentStep >= steps) {
          clearInterval(timer)
          setStats(targetStats)
        }
      }, stepDuration)

      return () => clearInterval(timer)
    }

    const timer = setTimeout(animateStats, 500)
    return () => clearTimeout(timer)
  }, [])

  const quickActions = [
    {
      title: 'Browse Devices',
      description: 'Find phones, tablets, and accessories',
      icon: DevicePhoneMobileIcon,
      color: 'from-blue-500 to-cyan-500',
      action: () => onGetStarted()
    },
    {
      title: 'Sell Your Device',
      description: 'List your phone for sale',
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-emerald-500',
      action: () => onGetStarted()
    },
    {
      title: 'Find Local Sellers',
      description: 'Discover deals in your area',
      icon: MapPinIcon,
      color: 'from-orange-500 to-red-500',
      action: () => onGetStarted()
    },
    {
      title: 'Learn More',
      description: 'Explore all features',
      icon: PlayIcon,
      color: 'from-purple-500 to-pink-500',
      action: () => onExploreFeatures()
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to PacMac Marketplace
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              The ultimate platform for buying and selling phones in your area. 
              Connect with local buyers and sellers for safe, convenient transactions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={onGetStarted}
                className="flex items-center space-x-3 px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlayIcon className="w-5 h-5" />
                <span>Get Started</span>
              </button>
              <button
                onClick={onExploreFeatures}
                className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:border-white/50 hover:bg-white/10 transition-all duration-300"
              >
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {stats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                {stats.totalListings.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Devices Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                {stats.totalTransactions.toLocaleString()}+
              </div>
              <div className="text-gray-600 font-medium">Successful Sales</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                {stats.averageRating}/5
              </div>
              <div className="text-gray-600 font-medium">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What would you like to do?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our most popular actions to get started quickly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Activity */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'sale' ? (
                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{activity.user} {activity.type === 'sale' ? 'sold' : 'listed'}</div>
                      <div className="text-gray-600">{activity.item} for {activity.price}</div>
                      <div className="text-sm text-gray-500">{activity.location} • {activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Items */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Trending This Week</h3>
              <div className="space-y-4">
                {trendingItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DevicePhoneMobileIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.searches} searches this week</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{item.price}</div>
                      <div className="text-sm text-gray-600">avg. price</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose PacMac Marketplace?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Secure & Verified</h4>
              <p className="text-gray-600">All users are verified and transactions are protected</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Local & Convenient</h4>
              <p className="text-gray-600">Find deals in your neighborhood with easy meetups</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Trusted by Thousands</h4>
              <p className="text-gray-600">Join thousands of satisfied users in your area</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users buying and selling phones in their local area
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStarted}
              className="flex items-center space-x-3 px-8 py-4 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Start Buying & Selling</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onExploreFeatures}
              className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:border-white/50 hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
