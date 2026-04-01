'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoDemoSetup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const createDemo = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/setup/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: 'Demo Restaurant',
          phone: '+919876543210',
          paymentLink: 'https://upi.me/pay/example@upi'
        })
      })
      
      const data = await res.json()
      
      if (res.ok && data.restaurant) {
        router.push(data.url || '/demo-restaurant')
      } else {
        setError(data.error || 'Failed to create demo')
        setLoading(false)
      }
    } catch (e) {
      setError('Network error - please try again')
      setLoading(false)
    }
  }

  return (
    <div>
      <button 
        onClick={createDemo}
        disabled={loading}
        style={{ 
          background: loading ? '#6b7280' : '#22c55e', 
          color: 'white', 
          padding: '16px 32px', 
          borderRadius: 12, 
          border: 'none', 
          cursor: loading ? 'wait' : 'pointer',
          fontWeight: 'bold',
          fontSize: 18,
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
        }}
      >
        {loading ? '⏳ Creating Demo Restaurant...' : '🚀 Create Demo Restaurant'}
      </button>
      
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '12px 16px', 
          borderRadius: 8, 
          marginTop: 12,
          fontSize: 14
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
