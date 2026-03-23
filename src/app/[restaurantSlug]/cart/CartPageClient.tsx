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
}

export default function CartPageClient({ restaurant }: { restaurant: Restaurant }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [placing, setPlacing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [orderTotal, setOrderTotal] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem(`cart_${restaurant.slug}`)
    if (saved) setCart(JSON.parse(saved))
  }, [restaurant.slug])

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
          paymentMethod: 'UPI'
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

  if (showSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'white', borderRadius: 24, padding: 40, textAlign: 'center', maxWidth: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 50, color: 'white' }}>✓</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#22c55e', marginBottom: 12 }}>Order Placed!</h1>
          <p style={{ fontSize: 18, color: '#333', marginBottom: 8 }}>Order #{orderNumber}</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#ff6b35', marginBottom: 24 }}>₹{orderTotal}</p>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Your delicious food is being prepared!</p>
          <Link href={`/${restaurant.slug}`} style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', padding: '16px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 'bold', fontSize: 16, display: 'inline-block', boxShadow: '0 4px 15px rgba(255,107,53,0.3)' }}>
            Order More 🍔
          </Link>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff' }}>
        <div style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', padding: '20px', textAlign: 'center' }}>
          <Link href={`/${restaurant.slug}`} style={{ color: 'white', textDecoration: 'none', fontSize: 24 }}>←</Link>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>Your Cart</h1>
        </div>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#f5f5f5', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 50 }}>🛒</span>
          </div>
          <h2 style={{ fontSize: 24, marginBottom: 20, color: '#333' }}>Your cart is empty</h2>
          <Link href={`/${restaurant.slug}`} style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 'bold', fontSize: 16, display: 'inline-block' }}>
            Browse Menu 🍔
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', paddingBottom: 250 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', color: 'white', padding: '16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/${restaurant.slug}`} style={{ color: 'white', textDecoration: 'none', fontSize: 24 }}>←</Link>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Your Cart</h1>
        </div>
      </div>
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
        {/* Cart Items */}
        <div style={{ marginBottom: 16 }}>
          {cart.map(item => (
            <div key={item.id} style={{ 
              background: 'white', 
              borderRadius: 16, 
              padding: 14, 
              marginBottom: 12, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ width: 65, height: 65, borderRadius: 12, background: '#fafafa', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 26 }}>🍽️</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 2, color: '#333' }}>{item.name}</h3>
                <p style={{ fontSize: 16, fontWeight: 'bold', color: '#ff6b35' }}>₹{item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button 
                  onClick={() => updateQty(item.id, -1)} 
                  style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #e0e0e0', background: 'white', fontSize: 18, cursor: 'pointer', color: '#666' }}
                >−</button>
                <span style={{ fontSize: 18, fontWeight: 'bold', minWidth: 28, textAlign: 'center' }}>{item.qty}</span>
                <button 
                  onClick={() => updateQty(item.id, 1)} 
                  style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#ff6b35', fontSize: 18, cursor: 'pointer', color: 'white' }}
                >+</button>
              </div>
              <div style={{ textAlign: 'right', minWidth: 55 }}>
                <p style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>₹{item.price * item.qty}</p>
                <button onClick={() => removeItem(item.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 0 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 14 }}>💰 Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#666' }}>
            <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>₹{subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: '#666' }}>
            <span>Tax (8%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 'bold', borderTop: '2px solid #eee', paddingTop: 14 }}>
            <span>Total</span>
            <span style={{ color: '#ff6b35' }}>₹{total}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 14 }}>👤 Your Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" placeholder="Full Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15 }} />
            <input type="tel" placeholder="Phone Number *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15 }} />
            <input type="email" placeholder="Email (optional)" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} style={{ padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15 }} />
            <textarea placeholder="Special instructions (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 15, minHeight: 70, resize: 'vertical' }} />
          </div>
        </div>

        {/* Place Order Button */}
        <button onClick={placeOrder} disabled={placing} style={{ 
          width: '100%', 
          padding: '18px', 
          background: placing ? '#ccc' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white', 
          border: 'none', 
          borderRadius: 16, 
          fontSize: 18, 
          fontWeight: 'bold', 
          cursor: placing ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(34,197,94,0.3)',
          marginBottom: 12
        }}>
          {placing ? '⏳ Processing...' : `Place Order • ₹${total}`}
        </button>

        <button onClick={clearCart} style={{ 
          width: '100%', 
          padding: '14px', 
          background: 'white', 
          color: '#ff4444', 
          border: '2px solid #ff4444', 
          borderRadius: 12, 
          fontSize: 15, 
          fontWeight: 'bold',
          cursor: 'pointer' 
        }}>
          Clear Cart
        </button>
      </div>
    </div>
  )
}
