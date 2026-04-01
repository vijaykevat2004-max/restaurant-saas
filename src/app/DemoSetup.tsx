'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  label?: string
}

export default function DemoSetup({ label = 'Create Demo Restaurant' }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null)
  const router = useRouter()

  const setupDemo = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/setup/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: 'Demo Restaurant',
          phone: '+919876543210'
        })
      })
      
      const data = await res.json()
      
      if (res.ok && data.restaurant) {
        setResult({ url: data.url })
        setTimeout(() => router.push(data.url), 1000)
      } else {
        setResult({ error: data.error || 'Failed to create demo' })
      }
    } catch (e) {
      setResult({ error: 'Network error' })
    }
    
    setLoading(false)
  }

  if (result?.url) {
    return (
      <div style={{ background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 8, display: 'inline-block', fontWeight: 'bold' }}>
        ✓ Demo restaurant created! Redirecting...
      </div>
    )
  }

  return (
    <div>
      <button 
        onClick={setupDemo}
        disabled={loading}
        style={{ 
          background: loading ? '#ccc' : '#22c55e', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: 8, 
          border: 'none', 
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: 16
        }}
      >
        {loading ? 'Creating...' : `🎯 ${label}`}
      </button>
      
      {result?.error && (
        <p style={{ color: '#dc2626', marginTop: 8, fontSize: 14 }}>{result.error}</p>
      )}
    </div>
  )
}
