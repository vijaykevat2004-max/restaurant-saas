'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  image?: string
}

interface Restaurant {
  id: string
  name: string
  slug: string
  logo: string | null
  upiId: string | null
}

interface Table {
  id: string
  number: number
  name: string
  status: string
  isAvailable: boolean
}

export default function CartPageClient({ restaurant }: { restaurant: Restaurant }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [placing, setPlacing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showUPIPayment, setShowUPIPayment] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderTotal, setOrderTotal] = useState(0)
  const [orderId, setOrderId] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('TAKEAWAY')
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('UPI')
  const [loadingTables, setLoadingTables] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`cart_${restaurant.slug}`)
    if (saved) setCart(JSON.parse(saved))
  }, [restaurant.slug])

  useEffect(() => {
    if (orderType === 'DINE_IN') {
      setLoadingTables(true)
      fetch(`/api/public/tables?slug=${restaurant.slug}`)
        .then(r => r.json())
        .then(d => {
          setTables(d.tables || [])
          setLoadingTables(false)
        })
        .catch(() => setLoadingTables(false))
    }
  }, [orderType, restaurant.slug])

  const updateQty = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        return newQty > 0 ? { ...item, qty: newQty } : item
      }
      return item
    }).filter(item => item.qty > 0)
    setCart(updated)
    localStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify(updated))
  }

  const removeItem = (id: string) => {
    const updated = cart.filter(item => item.id !== id)
    setCart(updated)
    localStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify(updated))
  }

  const clearCart = () => {
    setCart([])
    localStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify([]))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const tax = subtotal * 0.08
  const total = Math.round(subtotal + tax)

  const placeOrder = async () => {
    if (cart.length === 0) return
    if (!customerName.trim() || !customerPhone.trim()) {
      window.alert('Please enter your name and phone number')
      return
    }
    if (orderType === 'DINE_IN' && !selectedTable) {
      window.alert('Please select a table for dine-in')
      return
    }

    setPlacing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          notes,
          restaurantSlug: restaurant.slug,
          items: cart.map(item => ({ 
            menuItemId: item.id, 
            name: item.name, 
            price: item.price, 
            quantity: item.qty 
          })),
          paymentMethod: paymentMethod === 'CASH' ? 'CASH' : 'ONLINE',
          orderType,
          tableId: selectedTable?.id || null,
          tableName: selectedTable?.name || selectedTable ? `Table ${selectedTable.number}` : null
        })
      })

      if (!res.ok) {
        const error = await res.json()
        window.alert('Error: ' + (error.error || 'Failed to place order'))
        setPlacing(false)
        return
      }

      const data = await res.json()
      setOrderNumber(data.order.orderNumber)
      setOrderTotal(data.order.total)
      setOrderId(data.order.id)
      
      if (paymentMethod === 'UPI') {
        setShowUPIPayment(true)
        setPlacing(false)
        return
      }
      
      await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.order.id, verified: true })
      })

      clearCart()
      setShowSuccess(true)
    } catch (e) {
      window.alert('Failed to place order')
    }
    setPlacing(false)
  }

  const confirmUPIPayment = async () => {
    if (!transactionId.trim()) {
      window.alert('Please enter Transaction ID')
      return
    }
    
    setPlacing(true)
    try {
      await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, verified: true, paymentId: transactionId })
      })
      clearCart()
      setShowUPIPayment(false)
      setTransactionId('')
      setShowSuccess(true)
    } catch (e) {
      window.alert('Failed to confirm payment')
    }
    setPlacing(false)
  }

  if (showUPIPayment) {
    const shareUrl = `https://wa.me/?text=Pay%20₹${orderTotal}%20for%20your%20order%20%23${orderNumber}%20at%20${encodeURIComponent(restaurant.name)}%3A%20${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin + '/' + restaurant.slug + '/pay/' + orderId) : ''}`
    
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#e8f5e9', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28 }}>💳</span>
          </div>
          
          <h2 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4, color: '#333' }}>{restaurant.name}</h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Order #{orderNumber}</p>
          
          <div style={{ background: '#fff3e0', borderRadius: 12, padding: 20, marginBottom: 20, border: '2px solid #ff9800' }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Amount to Pay</p>
            <p style={{ fontSize: 36, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>₹{orderTotal}</p>
          </div>
          
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
            Click below to pay securely via UPI
          </p>
          
          <a 
            href={`/${restaurant.slug}/pay/${orderId}`}
            target="_blank"
            style={{ 
              display: 'block',
              width: '100%', 
              padding: 16, 
              background: '#22c55e', 
              color: 'white', 
              border: 'none', 
              borderRadius: 12, 
              fontSize: 18, 
              fontWeight: 'bold',
              textDecoration: 'none',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: 12
            }}
          >
            🔗 Pay Now
          </a>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <a 
              href={shareUrl}
              target="_blank"
              style={{ 
                display: 'block',
                padding: 12, 
                background: '#25d366', 
                color: 'white', 
                border: 'none', 
                borderRadius: 10, 
                fontSize: 14, 
                fontWeight: 'bold',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              📱 WhatsApp
            </a>
            
            <button 
              onClick={() => {
                const url = window.location.origin + '/' + restaurant.slug + '/pay/' + orderId
                navigator.clipboard.writeText(url)
                window.alert('Link copied!')
              }}
              style={{ 
                padding: 12, 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: 10, 
                fontSize: 14, 
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📋 Copy Link
            </button>
          </div>
          
          <button 
            onClick={() => { setShowUPIPayment(false); }}
            style={{ width: '100%', padding: 12, background: 'transparent', color: '#666', border: 'none', fontSize: 14, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 350 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#4caf50', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 40, color: 'white' }}>✓</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Order Placed!</h1>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 4 }}>Order #{orderNumber}</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#d32f2f', marginBottom: 16 }}>₹{orderTotal}</p>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Payment confirmed! Your order is being prepared.</p>
          <Link href={`/${restaurant.slug}`} style={{ 
            background: '#d32f2f', 
            color: 'white', 
            padding: '14px 32px', 
            borderRadius: 8, 
            textDecoration: 'none', 
            fontWeight: 'bold', 
            display: 'inline-block' 
          }}>
            Order More
          </Link>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #ddd' }}>
          <Link href={`/${restaurant.slug}`} style={{ color: '#333', textDecoration: 'none', fontSize: 20 }}>←</Link>
          <h1 style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', margin: 0, marginTop: 8, color: '#333' }}>Your Cart</h1>
        </div>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: 20, marginBottom: 8, color: '#333' }}>Your cart is empty</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>Add items to get started</p>
          <Link href={`/${restaurant.slug}`} style={{ background: '#d32f2f', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold' }}>
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 280, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #ddd', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 768, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/${restaurant.slug}`} style={{ color: '#333', textDecoration: 'none', fontSize: 20 }}>←</Link>
          <h1 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#333' }}>Your Cart</h1>
        </div>
      </div>

      <div style={{ maxWidth: 768, margin: '0 auto', padding: 16 }}>
        {/* Cart Items */}
        <div style={{ marginBottom: 16 }}>
          {cart.map(item => (
            <div key={item.id} style={{ 
              background: '#fff', 
              borderRadius: 12, 
              padding: 12, 
              marginBottom: 10, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ width: 60, height: 60, borderRadius: 8, background: '#fafafa', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>🍽️</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 'bold', margin: 0, marginBottom: 2, color: '#333' }}>{item.name}</h3>
                <p style={{ fontSize: 14, fontWeight: 'bold', color: '#d32f2f', margin: 0 }}>₹{item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #ddd', background: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 'bold', minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#d32f2f', color: 'white', fontSize: 16, cursor: 'pointer' }}>+</button>
              </div>
              <div style={{ textAlign: 'right', minWidth: 50 }}>
                <p style={{ fontSize: 14, fontWeight: 'bold', color: '#333', margin: 0 }}>₹{item.price * item.qty}</p>
                <button onClick={() => removeItem(item.id)} style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 0 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Bill Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#666' }}>
            <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>₹{subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: '#666' }}>
            <span>Tax (8%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: 12, color: '#333' }}>
            <span>Total</span>
            <span style={{ color: '#d32f2f' }}>₹{total}</span>
          </div>
        </div>

        {/* Order Type Selection */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Order Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button 
              onClick={() => { setOrderType('TAKEAWAY'); setSelectedTable(null); }}
              style={{ 
                padding: 14, 
                borderRadius: 10, 
                border: orderType === 'TAKEAWAY' ? '2px solid #d32f2f' : '2px solid #ddd',
                background: orderType === 'TAKEAWAY' ? '#fff5f5' : '#fff',
                cursor: 'pointer',
                fontWeight: orderType === 'TAKEAWAY' ? 'bold' : 'normal'
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>🥡</div>
              <div style={{ fontSize: 14, color: '#333' }}>Takeaway</div>
            </button>
            <button 
              onClick={() => setOrderType('DINE_IN')}
              style={{ 
                padding: 14, 
                borderRadius: 10, 
                border: orderType === 'DINE_IN' ? '2px solid #d32f2f' : '2px solid #ddd',
                background: orderType === 'DINE_IN' ? '#fff5f5' : '#fff',
                cursor: 'pointer',
                fontWeight: orderType === 'DINE_IN' ? 'bold' : 'normal'
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>🍽️</div>
              <div style={{ fontSize: 14, color: '#333' }}>Dine In</div>
            </button>
          </div>
        </div>

        {/* Table Selection for Dine-in */}
        {orderType === 'DINE_IN' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Select Your Table</h3>
            {loadingTables ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>Loading tables...</div>
            ) : tables.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#d32f2f' }}>No tables available. Please select Takeaway.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: selectedTable?.id === table.id ? '2px solid #4caf50' : '2px solid #ddd',
                      background: selectedTable?.id === table.id ? '#e8f5e9' : '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>🪑</div>
                    <div style={{ fontSize: 14, color: '#333' }}>{table.name || `Table ${table.number}`}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Method for Dine-in */}
        {orderType === 'DINE_IN' && selectedTable && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Payment Method</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button 
                onClick={() => setPaymentMethod('UPI')}
                style={{ 
                  padding: 14, 
                  borderRadius: 10, 
                  border: paymentMethod === 'UPI' ? '2px solid #d32f2f' : '2px solid #ddd',
                  background: paymentMethod === 'UPI' ? '#fff5f5' : '#fff',
                  cursor: 'pointer',
                  fontWeight: paymentMethod === 'UPI' ? 'bold' : 'normal'
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>📱</div>
                <div style={{ fontSize: 14, color: '#333' }}>UPI / Online</div>
              </button>
              <button 
                onClick={() => setPaymentMethod('CASH')}
                style={{ 
                  padding: 14, 
                  borderRadius: 10, 
                  border: paymentMethod === 'CASH' ? '2px solid #d32f2f' : '2px solid #ddd',
                  background: paymentMethod === 'CASH' ? '#fff5f5' : '#fff',
                  cursor: 'pointer',
                  fontWeight: paymentMethod === 'CASH' ? 'bold' : 'normal'
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>💵</div>
                <div style={{ fontSize: 14, color: '#333' }}>Cash</div>
              </button>
            </div>
            {paymentMethod === 'CASH' && (
              <div style={{ marginTop: 12, padding: 12, background: '#fff3cd', borderRadius: 8, fontSize: 13, color: '#856404' }}>
                Pay ₹{total} at the counter when your order is ready.
              </div>
            )}
          </div>
        )}

        {/* Customer Details */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>Your Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" placeholder="Full Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
            <input type="tel" placeholder="Phone Number *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
            <input type="email" placeholder="Email (optional)" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
            <textarea placeholder="Special instructions (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, minHeight: 60, resize: 'none' }} />
          </div>
        </div>

        {/* Place Order */}
        <button onClick={placeOrder} disabled={placing} style={{ 
          width: '100%', 
          padding: 16, 
          background: placing ? '#ccc' : '#4caf50',
          color: 'white', 
          border: 'none', 
          borderRadius: 12, 
          fontSize: 16, 
          fontWeight: 'bold', 
          cursor: placing ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          marginBottom: 10
        }}>
          {placing ? 'Processing...' : `Place Order • ₹${total}`}
        </button>

        <button onClick={clearCart} style={{ 
          width: '100%', 
          padding: 12, 
          background: '#fff', 
          color: '#d32f2f', 
          border: '2px solid #d32f2f', 
          borderRadius: 10, 
          fontSize: 14, 
          fontWeight: 'bold',
          cursor: 'pointer' 
        }}>
          Clear Cart
        </button>
      </div>
    </div>
  )
}
