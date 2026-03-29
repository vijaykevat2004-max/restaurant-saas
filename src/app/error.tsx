'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 20, fontFamily: 'system-ui', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: 16 }}>{error?.message}</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ background: '#d32f2f', color: 'white', padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
          >
            Go Home
          </button>
        </div>
      </body>
    </html>
  )
}
