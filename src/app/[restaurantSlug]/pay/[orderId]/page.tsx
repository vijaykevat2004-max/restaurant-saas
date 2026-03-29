'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    Cashfree: any
  }
}

export default function PaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const restaurantSlug = params.restaurantSlug as string
  const orderId = params.orderId as string
  const paymentStatus = searchParams.get('status')
  
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [cashfreeReady, setCashfreeReady] = useState(false)

  useEffect(() => {
    if (restaurantSlug && orderId) {
      loadData()
    }
  }, [orderId])

  useEffect(() => {
    if (paymentStatus === 'success' && order) {
      window.location.href = `/${restaurantSlug}/pay/${orderId}?success=1`
    }
  }, [paymentStatus])

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Cashfree) {
      const script = document.createElement('script')
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
      script.onload = () => setCashfreeReady(true)
      document.body.appendChild(script)
    } else if (window.Cashfree) {
      setCashfreeReady(true)
    }
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch(`/api/payment/data?restaurantSlug=${restaurantSlug}&orderId=${orderId}`)
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setRestaurant(data.restaurant)
        setOrder(data.order)
      }
    } catch (e) {
      setError('Failed to load payment data')
    }
    setLoading(false)
  }

  const handlePay = async () => {
    if (!cashfreeReady || !window.Cashfree) {
      alert('Payment system loading... Please wait.')
      return
    }

    setProcessing(true)
    
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, restaurantSlug })
      })
      
      const data = await res.json()
      
      if (data.error) {
        alert(data.message || data.error)
        setProcessing(false)
        return
      }

      if (data.paymentSessionId) {
        const cashfree = new window.Cashfree({
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox'
        })
        
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          returnUrl: `https://restaurant-saas-vijay19.vercel.app/${restaurantSlug}/pay/${orderId}?success=1`
        })
      }
    } catch (e) {
      alert('Payment error. Please try again.')
    }
    setProcessing(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 50, height: 50, border: '4px solid #f3f3f3', borderTop: '4px solid #d32f2f', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ color: '#666' }}>Loading...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>⚠️ Error</h2>
          <p style={{ color: '#666' }}>{error}</p>
          <a href="/" style={{ color: '#d32f2f', marginTop: 16, display: 'inline-block' }}>Go Home</a>
        </div>
      </div>
    )
  }

  if (!restaurant || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>Not Found</h2>
          <a href="/" style={{ color: '#d32f2f', marginTop: 16, display: 'inline-block' }}>Go Home</a>
        </div>
      </div>
    )
  }

  if (searchParams.get('success') === '1' || order.paymentStatus === 'PAID') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#22c55e', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 50, color: 'white' }}>✓</span>
          </div>
          <h1 style={{ fontSize: 28, color: '#22c55e', marginBottom: 8 }}>Payment Successful!</h1>
          <p style={{ fontSize: 18, color: '#333', marginBottom: 4 }}>Order #{order.orderNumber}</p>
          <p style={{ fontSize: 36, fontWeight: 'bold', color: '#d32f2f', margin: '20px 0' }}>₹{order.total}</p>
          <p style={{ color: '#666', marginTop: 16, fontSize: 16 }}>Your order is being prepared!</p>
          <a href={`/${restaurantSlug}`} style={{ display: 'inline-block', marginTop: 24, background: '#22c55e', color: 'white', padding: '16px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 'bold', fontSize: 16 }}>
            Order More
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', padding: 24, background: 'white', borderBottom: '1px solid #eee' }}>
        {restaurant.logo ? (
          <img src={restaurant.logo} alt={restaurant.name} style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#d32f2f', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'white' }}>
            🍔
          </div>
        )}
        <h1 style={{ fontSize: 22, fontWeight: 'bold', margin: '16px 0 4px' }}>{restaurant.name}</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Order #{order.orderNumber}</p>
      </div>

      <div style={{ textAlign: 'center', padding: 32, background: 'white', margin: 16, borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Total Amount</p>
        <p style={{ fontSize: 56, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>₹{order.total}</p>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>💳 Pay with Cashfree</h3>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
            Card • UPI • Net Banking • Wallet
          </p>
          <button 
            onClick={handlePay}
            disabled={processing || !cashfreeReady}
            style={{ 
              width: '100%', padding: 18, background: processing ? '#ccc' : '#d32f2f', 
              color: 'white', borderRadius: 12, fontSize: 18, fontWeight: 'bold', 
              border: 'none', cursor: processing ? 'not-allowed' : 'pointer'
            }}
          >
            {processing ? '⏳ Processing...' : '💳 Pay Now'}
          </button>
          {!cashfreeReady && (
            <p style={{ fontSize: 12, color: '#999', marginTop: 12 }}>Loading payment system...</p>
          )}
        </div>
      </div>

      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ background: '#e8f5e9', borderRadius: 12, padding: 16, marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#2e7d32' }}>
            🔒 Payment secured by Cashfree
          </p>
          <p style={{ fontSize: 11, color: '#2e7d32', marginTop: 4 }}>
            Money transfers directly to restaurant's account
          </p>
        </div>
      </div>
    </div>
  )
}
