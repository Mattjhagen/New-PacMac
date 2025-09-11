'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const [showContent, setShowContent] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show content after a short delay for animation
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleLaunchApp = () => {
    router.push('/')
  }

  const handleAdminPanel = () => {
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-purple-500 to-blue-600 flex items-center justify-center p-6">
      <div className={`glass p-8 rounded-3xl max-w-2xl w-full text-center transition-all duration-1000 ${
        showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
      }`}>
        <div className="text-6xl mb-6 animate-pulse-slow">📱</div>
        
        <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">
          FRESH DEPLOYMENT!
        </h1>
        
        <p className="text-xl text-white mb-6 opacity-90">
          🎉 <strong>SUCCESS!</strong> This is the NEW unified app!
        </p>
        
        <p className="text-lg text-white mb-8 opacity-80">
          If you can see this page, the deployment is working correctly!
        </p>
        
        <div className="bg-white bg-opacity-20 p-4 rounded-xl mb-8">
          <p className="text-white font-mono text-sm">
            DEPLOYMENT ID: UNIFIED-2024-09-11-01:15
          </p>
        </div>
        
        <div className="bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 p-6 rounded-xl mb-8">
          <div className="text-white space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Repository: New-PacMac (Unified)</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Status: Unified Deployment Successful</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Domain: new-pac-mac.vercel.app</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleLaunchApp}
            className="btn btn-primary text-lg px-8 py-4 hover:scale-105 transition-transform"
          >
            🚀 Launch Tinder App
          </button>
          <button
            onClick={handleAdminPanel}
            className="btn btn-secondary text-lg px-8 py-4 hover:scale-105 transition-transform"
          >
            ⚙️ Admin Panel
          </button>
        </div>
        
        <div className="mt-8 text-white opacity-60 text-sm">
          Deployed: <span id="timestamp"></span>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('timestamp').textContent = new Date().toLocaleString();
          `
        }}
      />
    </div>
  )
}
