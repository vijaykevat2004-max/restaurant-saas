'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

function PaymentContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const restaurantSlug = params.restaurantSlug as string
  const orderId = params.orderId as string
  
  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (restaurantSlug && orderId) {
      loadData()
    }
  }, [orderId])

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

  const qrUrl = restaurant?.upiId 
    ? `upi://pay?pa=${restaurant.upiId}&pn=${encodeURIComponent(restaurant.name)}&am=${order?.total}&cu=INR`
    : null

  const handlePay = () => {
    if (qrUrl) {
      window.location.href = qrUrl
    }
  }

  const handleVerifyPayment = async () => {
    if (verified) return
    
    setVerifying(true)
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: orderId,
          verified: true 
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setVerified(true)
          setOrder((prev: any) => ({ ...prev, paymentStatus: 'PAID' }))
        }
      }
    } catch (e) {
      console.error('Verification error:', e)
      alert('Failed to verify payment')
    }
    setVerifying(false)
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

  if (order.paymentStatus === 'PAID' || verified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#22c55e', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 50, color: 'white' }}>✓</span>
          </div>
          <h1 style={{ fontSize: 28, color: '#22c55e', marginBottom: 8 }}>Payment Confirmed!</h1>
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
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d32f2f', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white' }}>
          🍔
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 'bold', margin: '12px 0 4px' }}>{restaurant.name}</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Order #{order.orderNumber}</p>
      </div>
      
      <div style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Amount to Pay</p>
        <p style={{ fontSize: 48, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>₹{order.total}</p>
      </div>
      
      {restaurant.upiId ? (
        <>
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250&data=${encodeURIComponent(qrUrl)}`}
              alt="Pay QR"
              style={{ width: 250, height: 250, display: 'inline-block' }}
            />
            <p style={{ fontSize: 12, color: '#666', marginTop: 12 }}>Scan with any UPI app</p>
          </div>
          
          <div style={{ padding: '24px 20px' }}>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 4, textAlign: 'center' }}>Pay to</p>
            <p style={{ fontSize: 16, fontWeight: 'bold', wordBreak: 'break-all', textAlign: 'center' }}>{restaurant.upiId}</p>
          </div>
        </>
      ) : (
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{ background: '#ffebee', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#c62828', fontWeight: 'bold' }}>⚠️ UPI ID not set</p>
            <p style={{ fontSize: 12, color: '#c62828', marginTop: 8 }}>Restaurant has not configured UPI payment yet.</p>
          </div>
        </div>
      )}
      
      <div style={{ padding: '0 20px' }}>
        <button 
          onClick={handleVerifyPayment}
          disabled={verifying}
          style={{ 
            width: '100%', padding: 16, background: verifying ? '#999' : '#22c55e', color: 'white',
            borderRadius: 12, fontSize: 16, fontWeight: 'bold', border: 'none',
            cursor: verifying ? 'not-allowed' : 'pointer'
          }}
        >
          {verifying ? '⏳ Verifying...' : "✓ I've Paid"}
        </button>
        <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 12 }}>
          After payment, click the button above
        </p>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}
