export default function MinimalPage() {
  return (
    <html>
      <head>
        <title>PacMac Minimal Test</title>
      </head>
      <body style={{ 
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f0f0f0'
      }}>
        <h1>🚀 PacMac Minimal Test</h1>
        <p>If you can see this, the basic Next.js server is working!</p>
        <p>Timestamp: {new Date().toISOString()}</p>
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          backgroundColor: 'white',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          <p>✅ Server is running</p>
          <p>✅ Static generation works</p>
          <p>✅ No complex dependencies</p>
        </div>
      </body>
    </html>
  );
}
