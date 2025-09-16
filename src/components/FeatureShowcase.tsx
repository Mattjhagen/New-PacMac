'use client'

import { useState, useEffect } from 'react'
import { 
  DevicePhoneMobileIcon, 
  MapPinIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ClockIcon,
  TruckIcon
} from '@heroicons/react/24/outline'

interface FeatureShowcaseProps {
  onClose: () => void
}

export default function FeatureShowcase({ onClose }: FeatureShowcaseProps) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const features = [
    {
      id: 'discovery',
      title: 'Smart Discovery',
      subtitle: 'Find exactly what you\'re looking for',
      icon: MagnifyingGlassIcon,
      color: 'from-blue-500 to-cyan-500',
      description: 'Our advanced search and filtering system helps you find the perfect device in your area.',
      highlights: [
        'Advanced filters by brand, price, condition',
        'Location-based search with radius control',
        'Real-time availability updates',
        'Smart recommendations based on your preferences'
      ],
      demo: {
        type: 'search',
        title: 'Try our search',
        placeholder: 'Search for iPhone 15 Pro...'
      }
    },
    {
      id: 'location',
      title: 'Location Services',
      subtitle: 'Discover deals in your neighborhood',
      icon: MapPinIcon,
      color: 'from-green-500 to-emerald-500',
      description: 'GPS-powered location services help you find and connect with sellers nearby.',
      highlights: [
        'GPS location detection',
        'Radius-based search (1-50 miles)',
        'Local pickup options',
        'Meetup coordination tools'
      ],
      demo: {
        type: 'map',
        title: 'See nearby sellers',
        placeholder: 'Enter your location...'
      }
    },
    {
      id: 'security',
      title: 'Secure Transactions',
      subtitle: 'Buy and sell with confidence',
      icon: ShieldCheckIcon,
      color: 'from-orange-500 to-red-500',
      description: 'Our verified system ensures safe transactions and authentic devices.',
      highlights: [
        'Verified user profiles',
        'Device authenticity checks',
        'Secure payment processing',
        'Transaction dispute resolution'
      ],
      demo: {
        type: 'security',
        title: 'Verified sellers',
        placeholder: 'All sellers are verified...'
      }
    },
    {
      id: 'communication',
      title: 'Easy Communication',
      subtitle: 'Chat directly with buyers and sellers',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-purple-500 to-pink-500',
      description: 'Built-in messaging system makes it easy to coordinate meetups and ask questions.',
      highlights: [
        'Real-time messaging',
        'Photo and video sharing',
        'Meetup scheduling',
        'Message history tracking'
      ],
      demo: {
        type: 'chat',
        title: 'Start a conversation',
        placeholder: 'Type your message...'
      }
    }
  ]

  const stats = [
    { icon: DevicePhoneMobileIcon, number: '50K+', label: 'Devices Listed', color: 'text-blue-500' },
    { icon: MapPinIcon, number: '500+', label: 'Cities Covered', color: 'text-green-500' },
    { icon: StarIcon, number: '4.9/5', label: 'User Rating', color: 'text-yellow-500' },
    { icon: ShieldCheckIcon, number: '99.8%', label: 'Success Rate', color: 'text-orange-500' }
  ]

  const handleFeatureChange = (index: number) => {
    setIsAnimating(true)
    setTimeout(() => {
      setActiveFeature(index)
      setIsAnimating(false)
    }, 300)
  }

  const currentFeature = features[activeFeature]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto z-50">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Explore Features</h2>
              <p className="text-gray-600 mt-1">Discover what makes PacMac Marketplace special</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureChange(index)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-white shadow-md border-2 border-blue-500'
                        : 'hover:bg-white/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{feature.title}</div>
                        <div className="text-sm text-gray-600">{feature.subtitle}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-xl font-bold text-gray-900">{stat.number}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
                {/* Feature Header */}
                <div className="flex items-center space-x-4 mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${currentFeature.color} flex items-center justify-center shadow-lg`}>
                    <currentFeature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{currentFeature.title}</h3>
                    <p className="text-xl text-gray-600">{currentFeature.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  {currentFeature.description}
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {currentFeature.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>

                {/* Demo Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{currentFeature.demo.title}</h4>
                  
                  {currentFeature.demo.type === 'search' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder={currentFeature.demo.placeholder}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['iPhone 15 Pro', 'Samsung Galaxy S24', 'iPad Pro', 'Apple Watch'].map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentFeature.demo.type === 'map' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder={currentFeature.demo.placeholder}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <MapPinIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="text-gray-600">Interactive map showing nearby sellers</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentFeature.demo.type === 'security' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                            <span className="font-semibold text-green-800">Verified Seller</span>
                          </div>
                          <p className="text-sm text-gray-600">ID verified, phone confirmed</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <StarIcon className="w-5 h-5 text-yellow-500" />
                            <span className="font-semibold text-blue-800">4.9/5 Rating</span>
                          </div>
                          <p className="text-sm text-gray-600">Based on 127 transactions</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentFeature.demo.type === 'chat' && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            JD
                          </div>
                          <span className="font-semibold text-gray-900">John Doe</span>
                          <span className="text-sm text-gray-500">2 min ago</span>
                        </div>
                        <p className="text-gray-700">Hi! I&apos;m interested in the iPhone 15 Pro. Is it still available?</p>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={currentFeature.demo.placeholder}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleFeatureChange(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeFeature ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Exploring
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
