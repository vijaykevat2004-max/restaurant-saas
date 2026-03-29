'use client'
import { useState, useEffect } from 'react'

interface Props {
  restaurantName: string
  restaurantLogo: string | null
  upiId: string
  amount: number
  orderNumber: string
  orderId: string
  onSuccess: () => void
}

export default function PaymentPage(props: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const qrUrl = `upi://pay?pa=${props.upiId}&pn=${encodeURIComponent(props.restaurantName)}&am=${props.amount}&cu=INR`

  const handlePaid = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: props.orderId,
          paymentId: `upi_${Date.now()}`,
          verified: true 
        })
      })
      if (res.ok) {
        setDone(true)
        setTimeout(props.onSuccess, 2000)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>✓</div>
          <h1 style={{ fontSize: 24, color: '#22c55e' }}>Payment Successful!</h1>
          <p>Order #{props.orderNumber}</p>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>₹{props.amount}</p>
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
        <h1 style={{ fontSize: 20, fontWeight: 'bold', margin: '12px 0 4px' }}>{props.restaurantName}</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Order #{props.orderNumber}</p>
      </div>
      
      <div style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Amount to Pay</p>
        <p style={{ fontSize: 48, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>₹{props.amount}</p>
      </div>
      
      <div style={{ textAlign: 'center', padding: '0 20px' }}>
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=250&data=${encodeURIComponent(qrUrl)}`}
          alt="Pay QR"
          style={{ width: 250, height: 250, display: 'inline-block' }}
        />
        <p style={{ fontSize: 12, color: '#666', marginTop: 12 }}>Scan with any UPI app</p>
      </div>
      
      <div style={{ padding: '24px 20px' }}>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Pay to</p>
        <p style={{ fontSize: 16, fontWeight: 'bold', wordBreak: 'break-all' }}>{props.upiId}</p>
      </div>
      
      <div style={{ padding: '0 20px' }}>
        <button 
          onClick={handlePaid}
          disabled={loading}
          style={{ 
            width: '100%', padding: 16, background: loading ? '#999' : '#22c55e', color: 'white',
            borderRadius: 12, fontSize: 16, fontWeight: 'bold', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Verifying...' : "I've Paid ✓"}
        </button>
      </div>
    </div>
  )
}
