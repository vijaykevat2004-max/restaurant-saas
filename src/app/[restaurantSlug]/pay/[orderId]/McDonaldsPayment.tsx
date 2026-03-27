'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Restaurant {
  id: string
  name: string
  logo: string | null
  upiId: string | null
  phone: string | null
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  paymentStatus: string
  customerName: string | null
}

export default function McDonaldsPayment({ restaurant, order }: { restaurant: Restaurant, order: Order }) {
  const [paid, setPaid] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [checking, setChecking] = useState(false)

  const upiId = restaurant.upiId || 'yourname@upi'
  const amount = order.total
  const qrData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(restaurant.name)}&am=${amount}&cu=INR&tn=Order%23${order.orderNumber}`

  const handlePaid = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order.id, 
          verified: true,
          paymentMethod: 'UPI'
        })
      })
      
      if (res.ok) {
        setPaid(true)
        setShowSuccess(true)
        
        setTimeout(() => {
          window.location.href = `/${restaurant.id}/order/${order.id}/success`
        }, 2000)
      }
    } catch (e) {
      console.error(e)
    }
    setChecking(false)
  }

  useEffect(() => {
    if (order.paymentStatus === 'PAID') {
      setPaid(true)
      setShowSuccess(true)
    }
  }, [order.paymentStatus])

  if (showSuccess) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            background: '#22c55e', 
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: 50, color: 'white' }}>✓</span>
          </div>
          
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#22c55e', marginBottom: 8 }}>
            Payment Successful!
          </h1>
          
          <p style={{ fontSize: 18, color: '#333', marginBottom: 4 }}>
            Order #{order.orderNumber}
          </p>
          
          <p style={{ fontSize: 32, fontWeight: 'bold', color: '#d32f2f', margin: '16px 0' }}>
            ₹{amount}
          </p>
          
          <p style={{ fontSize: 16, color: '#666', marginTop: 24 }}>
            Your order is being prepared!
          </p>
          
          <p style={{ fontSize: 14, color: '#999', marginTop: 8 }}>
            Redirecting...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#fff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        padding: '20px',
        textAlign: 'center',
        borderBottom: '1px solid #eee'
      }}>
        {restaurant.logo ? (
          <img 
            src={restaurant.logo} 
            alt={restaurant.name} 
            style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: '#d32f2f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: 24,
            color: 'white'
          }}>
            🍔
          </div>
        )}
        <h1 style={{ fontSize: 20, fontWeight: 'bold', margin: '12px 0 4px', color: '#333' }}>
          {restaurant.name}
        </h1>
        <p style={{ fontSize: 14, color: '#666' }}>Order #{order.orderNumber}</p>
      </div>

      {/* Amount */}
      <div style={{ 
        padding: '32px 20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Amount to Pay</p>
        <p style={{ fontSize: 48, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>
          ₹{amount}
        </p>
      </div>

      {/* QR Code */}
      <div style={{ 
        padding: '0 20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          display: 'inline-block',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`}
            alt="Pay QR Code"
            style={{ width: 250, height: 250, display: 'block' }}
          />
          <p style={{ fontSize: 12, color: '#666', marginTop: 12 }}>
            Scan with any UPI app
          </p>
        </div>
      </div>

      {/* UPI ID */}
      <div style={{ 
        padding: '24px 20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Or pay to</p>
        <p style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{upiId}</p>
      </div>

      {/* Pay Button */}
      <div style={{ 
        padding: '0 20px 40px'
      }}>
        <a 
          href={qrData}
          style={{ 
            display: 'block',
            width: '100%',
            padding: 18,
            background: '#22c55e',
            color: 'white',
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 'bold',
            textAlign: 'center',
            textDecoration: 'none',
            marginBottom: 12,
            boxSizing: 'border-box'
          }}
        >
          📱 Open UPI App to Pay
        </a>
        
        <button 
          onClick={handlePaid}
          disabled={checking}
          style={{ 
            width: '100%',
            padding: 16,
            background: paid ? '#22c55e' : '#333',
            color: 'white',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 'bold',
            border: 'none',
            cursor: checking ? 'default' : 'pointer'
          }}
        >
          {checking ? 'Verifying...' : paid ? '✓ Payment Done!' : 'I\'ve Paid'}
        </button>
      </div>

      {/* Footer */}
      <div style={{ 
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid #eee'
      }}>
        <p style={{ fontSize: 12, color: '#999' }}>
          Pay securely via UPI • Powered by {restaurant.name}
        </p>
      </div>
    </div>
  )
}
