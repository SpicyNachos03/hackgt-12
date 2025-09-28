export default function TempHome() {
  return (
    <main style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Authentication Demo</h1>
      <p>Test your Auth0 integration:</p>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
        <a href="/api/auth/login?screen_hint=signup">
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Sign up
          </button>
        </a>
        
        <a href="/api/auth/login">
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Log in
          </button>
        </a>
        
        <a href="/api/auth/logout">
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Log out
          </button>
        </a>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <h3>Auth0 Status</h3>
        <p>✅ Login route: <code>/api/auth/login</code></p>
        <p>✅ Logout route: <code>/api/auth/logout</code></p>
        <p>✅ Callback route: <code>/api/auth/callback</code></p>
        <p><strong>Domain:</strong> {process.env.AUTH0_DOMAIN || 'Not configured'}</p>
      </div>
    </main>
  );
}
