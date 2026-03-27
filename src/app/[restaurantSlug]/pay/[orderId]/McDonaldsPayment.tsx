'use client'
import { useState } from 'react'

interface Props {
  restaurantName: string
  restaurantLogo: string | null
  upiId: string
  amount: number
  orderNumber: string
  orderId: string
  onSuccess: () => void
}

export default function PaymentPage({ restaurantName, restaurantLogo, upiId, amount, orderNumber, orderId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  
  const qrUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(restaurantName)}&am=${amount}&cu=INR&tn=Order%23${orderNumber}`
  
  const handlePaid = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          paymentId: `upi_${Date.now()}`,
          verified: true 
        })
      })
      if (res.ok) {
        setDone(true)
        setTimeout(onSuccess, 2000)
      }
    } catch (e) {
      alert('Payment verification failed')
    }
    setLoading(false)
  }
  
  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#22c55e', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 50, color: 'white' }}>✓</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#22c55e', marginBottom: 8 }}>Payment Successful!</h1>
          <p style={{ fontSize: 18, color: '#333', marginBottom: 4 }}>Order #{orderNumber}</p>
          <p style={{ fontSize: 32, fontWeight: 'bold', color: '#d32f2f', margin: '16px 0' }}>₹{amount}</p>
          <p style={{ color: '#666' }}>Your order is being prepared!</p>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', padding: '20px', borderBottom: '1px solid #eee' }}>
        {restaurantLogo ? (
          <img src={restaurantLogo} alt={restaurantName} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#d32f2f', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white' }}>
            🍔
          </div>
        )}
        <h1 style={{ fontSize: 20, fontWeight: 'bold', margin: '12px 0 4px' }}>{restaurantName}</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Order #{orderNumber}</p>
      </div>
      
      <div style={{ textAlign: 'center', padding: '32px 20px' }}>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Amount to Pay</p>
        <p style={{ fontSize: 48, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>₹{amount}</p>
      </div>
      
      <div style={{ textAlign: 'center', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250&data=${encodeURIComponent(qrUrl)}`}
            alt="Pay QR"
            style={{ width: 250, height: 250, display: 'block' }}
          />
          <p style={{ fontSize: 12, color: '#666', marginTop: 12 }}>Scan with any UPI app</p>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '24px 20px' }}>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Or pay to</p>
        <p style={{ fontSize: 18, fontWeight: 'bold' }}>{upiId}</p>
      </div>
      
      <div style={{ padding: '0 20px 40px' }}>
        <a 
          href={qrUrl}
          style={{ 
            display: 'block', width: '100%', padding: 18, background: '#22c55e', color: 'white',
            borderRadius: 12, fontSize: 18, fontWeight: 'bold', textAlign: 'center', 
            textDecoration: 'none', marginBottom: 12, boxSizing: 'border-box'
          }}
        >
          📱 Open UPI App to Pay
        </a>
        
        <button 
          onClick={handlePaid}
          disabled={loading}
          style={{ 
            width: '100%', padding: 16, background: '#333', color: 'white',
            borderRadius: 12, fontSize: 16, fontWeight: 'bold', border: 'none',
            cursor: loading ? 'default' : 'pointer'
          }}
        >
          {loading ? 'Verifying...' : "I've Paid"}
        </button>
      </div>
    </div>
  )
}
