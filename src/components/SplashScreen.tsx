'use client'

import { useState, useEffect } from 'react'
import { 
  DevicePhoneMobileIcon, 
  MapPinIcon, 
  ShieldCheckIcon, 
  ChatBubbleLeftRightIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface SplashScreenProps {
  onGetStarted: () => void
  onSkip: () => void
}

export default function SplashScreen({ onGetStarted, onSkip }: SplashScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const steps = [
    {
      title: "Welcome to PacMac Mobile",
      subtitle: "Premium mobile devices at unbeatable prices",
      icon: DevicePhoneMobileIcon,
      color: "from-blue-500 to-purple-600",
      features: [
        "Latest iPhone & Android devices",
        "Certified pre-owned phones",
        "Unbeatable prices & warranties"
      ]
    },
    {
      title: "Quality Guaranteed",
      subtitle: "Every device is thoroughly tested and certified",
      icon: ShieldCheckIcon,
      color: "from-green-500 to-teal-600",
      features: [
        "30-day return policy",
        "1-year warranty included",
        "Free shipping nationwide"
      ]
    },
    {
      title: "Easy Shopping",
      subtitle: "Find your perfect device in minutes",
      icon: MapPinIcon,
      color: "from-orange-500 to-red-600",
      features: [
        "Smart search & filters",
        "Detailed specifications",
        "Secure checkout process"
      ]
    },
    {
      title: "Customer Support",
      subtitle: "We're here to help you every step of the way",
      icon: ChatBubbleLeftRightIcon,
      color: "from-purple-500 to-pink-600",
      features: [
        "24/7 customer support",
        "Expert device advice",
        "Quick order processing"
      ]
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "New York, NY",
      rating: 5,
      text: "Got my iPhone 15 Pro for $200 less than retail! The quality was perfect and shipping was super fast.",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      location: "Los Angeles, CA",
      rating: 5,
      text: "Amazing selection of Android phones. Found exactly what I was looking for at a great price.",
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      location: "Chicago, IL",
      rating: 5,
      text: "Love the warranty and return policy. Makes buying phones online so much safer!",
      avatar: "ER"
    }
  ]

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "100K+", label: "Devices Sold" },
    { number: "99.9%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support" }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length)
        setIsAnimating(false)
      }, 300)
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  const handleNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
      setIsAnimating(false)
    }, 300)
  }

  const handlePrev = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)
      setIsAnimating(false)
    }, 300)
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden z-50">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-green-500 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-orange-500 rounded-full opacity-10 animate-bounce"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <DevicePhoneMobileIcon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-white text-xl font-bold">PacMac Mobile</span>
          </div>
          <button
            onClick={onSkip}
            className="text-white/70 hover:text-white transition-colors"
          >
            Skip Intro
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl w-full">
            {/* Step Indicator */}
            <div className="flex justify-center mb-12">
              <div className="flex space-x-3">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAnimating(true)
                      setTimeout(() => {
                        setCurrentStep(index)
                        setIsAnimating(false)
                      }, 300)
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'bg-white scale-125' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className={`text-center transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${currentStepData.color} mb-8 shadow-2xl`}>
                <currentStepData.icon className="w-12 h-12 text-white" />
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {currentStepData.title}
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                {currentStepData.subtitle}
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {currentStepData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  >
                    <CheckIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-white font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center space-x-6">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <ArrowRightIcon className="w-6 h-6 rotate-180" />
              </button>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Next</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-white/70 text-sm">{testimonial.location}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/80 text-sm italic">&ldquo;{testimonial.text}&rdquo;</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStarted}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Start Shopping</span>
            </button>
            
            <button
              onClick={onSkip}
              className="px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:border-white/50 hover:bg-white/10 transition-all duration-300"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
