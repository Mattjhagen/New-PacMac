'use client'

import { useState, useEffect } from 'react'

export default function FallbackPage() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    setMounted(true)
    const updateTime = () => setTime(new Date().toISOString())
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1>🛠️ PacMac Fallback Mode</h1>
      <p>This is a simplified version of the app that should work even if the main app has issues.</p>
      
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#e8f4fd',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h3>System Status:</h3>
        <p>✅ React Client-Side Rendering: Working</p>
        <p>✅ Next.js App Router: Working</p>
        <p>✅ Time Updates: {time}</p>
        <p>✅ No External Dependencies: Working</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Test Links:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '0.5rem 0' }}>
            <a href="/minimal" style={{ color: '#0070f3', textDecoration: 'none' }}>
              → Minimal Static Page
            </a>
          </li>
          <li style={{ margin: '0.5rem 0' }}>
            <a href="/api/minimal" style={{ color: '#0070f3', textDecoration: 'none' }}>
              → Minimal API Endpoint
            </a>
          </li>
          <li style={{ margin: '0.5rem 0' }}>
            <a href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
              → Main App (may have issues)
            </a>
          </li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>⚠️ Troubleshooting:</h3>
        <p>If you're seeing this page, the main app likely has dependency or configuration issues.</p>
        <p>Common causes:</p>
        <ul>
          <li>Missing environment variables</li>
          <li>Database connection issues</li>
          <li>Complex component rendering errors</li>
          <li>Memory issues on free tier</li>
        </ul>
      </div>
    </div>
  )
}
