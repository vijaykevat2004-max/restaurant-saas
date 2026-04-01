'use client'
import { useState } from 'react'

interface Props {
  restaurantName: string
  restaurantLogo: string | null
  paymentLink: string
  paymentInstructions: string | null
  amount: number
  orderNumber: string
  orderId: string
  onSuccess: () => void
}

export default function PaymentPage(props: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handlePaid = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: props.orderId,
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
          <h1 style={{ fontSize: 24, color: '#22c55e' }}>Payment Submitted!</h1>
          <p>Order #{props.orderNumber}</p>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>₹{props.amount}</p>
          <p style={{ color: '#666', marginTop: 16 }}>Staff will verify your payment shortly.</p>
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
      
      <div style={{ padding: '0 20px 24px' }}>
        <a 
          href={props.paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            display: 'block',
            width: '100%', 
            padding: 16, 
            background: '#d32f2f', 
            color: 'white',
            borderRadius: 12, 
            fontSize: 16, 
            fontWeight: 'bold', 
            textAlign: 'center',
            textDecoration: 'none'
          }}
        >
          Go to Payment ↗
        </a>
      </div>
      
      {props.paymentInstructions && (
        <div style={{ margin: '0 20px 24px', padding: 16, background: '#f5f5f5', borderRadius: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Payment Instructions</p>
          <p style={{ fontSize: 14, color: '#666', whiteSpace: 'pre-wrap' }}>{props.paymentInstructions}</p>
        </div>
      )}
      
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
          {loading ? 'Submitting...' : "I've Paid ✓"}
        </button>
        <p style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 12 }}>
          After completing payment, click the button above
        </p>
      </div>
    </div>
  )
}
