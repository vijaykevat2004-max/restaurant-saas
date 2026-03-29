export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'system-ui', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: '#666', marginBottom: 16 }}>The page you're looking for doesn't exist.</p>
        <a href="/" style={{ background: '#d32f2f', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none' }}>Go Home</a>
      </div>
    </div>
  )
}
