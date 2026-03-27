'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Restaurant {
  id: string
  name: string
  logo: string | null
  upiId: string | null
  razorpayKeyId: string | null
  razorpayKeySecret: string | null
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  paymentStatus: string
  customerName: string | null
}

export default function PaymentClient({ restaurant, order }: { restaurant: Restaurant, order: Order }) {
  const [loading, setLoading] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)
  const [error, setError] = useState('')

  const upiId = restaurant.upiId || 'yourname@upi'
  const amount = order.total

  const handlePay = async () => {
    setLoading(true)
    setError('')
    
    try {
      if (restaurant.razorpayKeyId && restaurant.razorpayKeySecret && 
          !restaurant.razorpayKeyId.includes('XXXXXXXX') && 
          !restaurant.razorpayKeySecret.includes('XXXXXXXX')) {
        
        const res = await fetch('/api/payment/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            restaurantSlug: restaurant.id,
            amount,
            customerPhone: '',
            customerName: order.customerName || 'Customer'
          })
        })
        
        const data = await res.json()
        
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl
          return
        }
      }
      
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(restaurant.name)}&am=${amount}&cu=INR&tn=Order%23${order.orderNumber}`
      window.location.href = upiUrl
    } catch (e) {
      setError('Payment failed. Please try again.')
    }
    
    setLoading(false)
  }

  const handleConfirmManual = async () => {
    setLoading(true)
    try {
      await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, verified: true })
      })
      setPaymentDone(true)
    } catch (e) {
      setError('Confirmation failed')
    }
    setLoading(false)
  }

  if (paymentDone) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: 400, width: '90%' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#4caf50', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 40, color: 'white' }}>✓</span>
          </div>
          <h1 style={{ fontSize: 24, marginBottom: 8, color: '#22c55e' }}>Payment Confirmed!</h1>
          <p style={{ color: '#666', marginBottom: 8 }}>Order #{order.orderNumber}</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#d32f2f' }}>₹{amount}</p>
          <p style={{ color: '#888', marginTop: 16 }}>Your order is being prepared!</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', padding: 20, textAlign: 'center', borderBottom: '1px solid #eee' }}>
        {restaurant.logo && (
          <img src={restaurant.logo} alt={restaurant.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
        )}
        <h1 style={{ fontSize: 20, fontWeight: 'bold', margin: '12px 0 4px', color: '#333' }}>{restaurant.name}</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Complete your payment</p>
      </div>

      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Amount to Pay</p>
            <p style={{ fontSize: 42, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>₹{amount}</p>
            <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>Order #{order.orderNumber}</p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          <button 
            onClick={handlePay}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: 16, 
              background: loading ? '#ccc' : '#22c55e', 
              color: 'white', 
              border: 'none', 
              borderRadius: 12, 
              fontSize: 18, 
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16
            }}
          >
            {loading ? 'Loading...' : '💳 Pay with UPI'}
          </button>

          <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Scan QR to Pay</p>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${upiId}&pn=${encodeURIComponent(restaurant.name)}&am=${amount}&cu=INR&tn=Order%23${order.orderNumber}`}
              alt="QR Code"
              style={{ width: 180, height: 180, borderRadius: 8 }}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>UPI ID: {upiId}</p>
          </div>
        </div>

        <button 
          onClick={handleConfirmManual}
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: 14, 
            background: 'white', 
            color: '#666', 
            border: '2px solid #ddd', 
            borderRadius: 12, 
            fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          I've already paid
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 16 }}>
          Secured by {restaurant.name}
        </p>
      </div>
    </div>
  )
}
