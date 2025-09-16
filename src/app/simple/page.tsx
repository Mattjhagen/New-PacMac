'use client'

import { useState, useEffect } from 'react'

export default function SimplePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div style={{ 
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>PacMac Mobile - Simple Version</h1>
      <p>This is a simplified version to test if the basic setup is working.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Quick Links:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '0.5rem 0' }}>
            <a href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
              → Full App
            </a>
          </li>
          <li style={{ margin: '0.5rem 0' }}>
            <a href="/test" style={{ color: '#0070f3', textDecoration: 'none' }}>
              → Test Page
            </a>
          </li>
          <li style={{ margin: '0.5rem 0' }}>
            <a href="/health" style={{ color: '#0070f3', textDecoration: 'none' }}>
              → Health Check
            </a>
          </li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3>Status:</h3>
        <p>✅ React is working</p>
        <p>✅ Client-side rendering is working</p>
        <p>✅ Navigation is working</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  )
}
