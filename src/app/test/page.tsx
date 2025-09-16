export default function TestPage() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1>PacMac Test Page</h1>
      <p>If you can see this, the basic Next.js setup is working.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ 
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          Go to Home
        </a>
      </div>
    </div>
  );
}
