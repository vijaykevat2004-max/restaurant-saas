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
  const [upiQrUrl, setUpiQrUrl] = useState<string>('')
  const [checking, setChecking] = useState(false)

  const isReturning = searchParams.get('status') === 'success' || searchParams.get('txnId')

  useEffect(() => {
    if (restaurantSlug && orderId) {
      loadData()
    }
  }, [orderId])

  useEffect(() => {
    if (restaurant?.upiId && order?.total) {
      const upiString = `${restaurant.upiId}?am=${order.total}&cu=INR&tn=Order${order.orderNumber}&tr=${orderId}&mode=04&purpose=00`
      const encodedUpi = encodeURIComponent(upiString)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://${encodedUpi}`
      setUpiQrUrl(qrUrl)
    }
  }, [restaurant, order])

  useEffect(() => {
    if (isReturning && order) {
      checkPayment()
    }
  }, [isReturning, order])

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

  const checkPayment = async () => {
    setChecking(true)
    try {
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: orderId, 
          paymentId: searchParams.get('txnId') || `upi_${Date.now()}`
        })
      })
      
      if (verifyRes.ok) {
        const data = await verifyRes.json()
        if (data.success) {
          setOrder((prev: any) => ({ ...prev, paymentStatus: 'PAID' }))
        }
      }
    } catch (e) {
      console.error('Payment check error:', e)
    }
    setChecking(false)
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

  if (order.paymentStatus === 'PAID') {
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

  const handlePay = async () => {
    if (!restaurant.upiId) {
      alert('UPI ID not configured by restaurant')
      return
    }
    
    const returnUrl = `${window.location.origin}/${restaurantSlug}/pay/${orderId}?status=success`
    const upiLink = `upi://pay?pa=${restaurant.upiId}&am=${order.total}&cu=INR&tn=Order${order.orderNumber}&tr=${orderId}&returl=${encodeURIComponent(returnUrl)}`
    
    window.location.href = upiLink
  }

  const handleVerifyManually = async () => {
    const confirmPay = confirm('Have you completed the UPI payment?')
    if (confirmPay) {
      await checkPayment()
    }
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
        {isReturning && checking && (
          <p style={{ color: '#1976d2', fontSize: 14, marginTop: 8 }}>🔄 Verifying payment...</p>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: 32, background: 'white', margin: 16, borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Total Amount</p>
        <p style={{ fontSize: 56, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>₹{order.total}</p>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>📱 Pay via UPI</h3>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
            Tap below to pay with any UPI app (GPay, PhonePe, Paytm)
          </p>
          
          <button 
            onClick={handlePay}
            style={{ 
              width: '100%', padding: 18, background: '#1976d2', 
              color: 'white', borderRadius: 12, fontSize: 18, fontWeight: 'bold', 
              border: 'none', cursor: 'pointer', marginBottom: 16
            }}
          >
            📲 Pay with UPI App
          </button>
          
          {upiQrUrl && (
            <>
              <div style={{ margin: '16px 0', color: '#666', fontSize: 13 }}>or scan QR code</div>
              <div style={{ 
                background: 'white', 
                padding: 16, 
                borderRadius: 12, 
                display: 'inline-block',
                border: '2px solid #e0e0e0',
                marginBottom: 16
              }}>
                <img 
                  src={upiQrUrl} 
                  alt="UPI QR Code" 
                  style={{ width: 180, height: 180 }}
                />
              </div>
            </>
          )}
          
          <div style={{ background: '#e3f2fd', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 'bold', color: '#1565c0', marginBottom: 4 }}>Pay to UPI ID:</p>
            <p style={{ fontSize: 16, fontWeight: 'bold', color: '#0d47a1' }}>{restaurant.upiId}</p>
          </div>
          
          <button 
            onClick={handleVerifyManually}
            style={{ 
              width: '100%', padding: 14, background: '#25D366', 
              color: 'white', borderRadius: 12, fontSize: 16, fontWeight: 'bold', 
              border: 'none', cursor: 'pointer'
            }}
          >
            ✓ I've Paid - Verify Payment
          </button>
          
          <p style={{ fontSize: 12, color: '#666', marginTop: 16 }}>
            After payment, click "I've Paid" or return to this page
          </p>
        </div>
      </div>

      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 16, marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#1565c0' }}>
            🔒 Payment goes directly to restaurant's UPI account
          </p>
        </div>
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
