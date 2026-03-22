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
}

export default function CartPageClient({ restaurant }: { restaurant: Restaurant }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [placing, setPlacing] = useState(false)
  const [showProcessing, setShowProcessing] = useState(false)
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
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#22c55e', marginBottom: 12 }}>Order Placed!</h1>
          <p style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>Order <strong>#{orderNumber}</strong></p>
          <p style={{ fontSize: 16, color: '#888', marginBottom: 24 }}>Amount: <strong>₹{orderTotal}</strong></p>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>Your order is being prepared!</p>
          <Link href={`/${restaurant.slug}`} style={{ background: '#f97316', color: 'white', padding: '14px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 16, display: 'inline-block' }}>
            Order More
          </Link>
        </div>
      </div>
    )
  }

  if (showProcessing) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20, animation: 'pulse 1s infinite' }}>💳</div>
          <h2 style={{ fontSize: 20 }}>Processing payment...</h2>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <div style={{ background: '#f97316', color: 'white', padding: '20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>Your Cart</h1>
        </div>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
          <h2 style={{ fontSize: 24, marginBottom: 20 }}>Your cart is empty</h2>
          <Link href={`/${restaurant.slug}`} style={{ background: '#f97316', color: 'white', padding: '14px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 16 }}>
            Browse Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div style={{ background: '#f97316', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>Your Cart - {restaurant.name}</h1>
      </div>
      
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <Link href={`/${restaurant.slug}`} style={{ color: '#666', textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>
          ← Back to Menu
        </Link>

        <div style={{ marginTop: 20 }}>
          {cart.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>🍔</span>}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>{item.name}</h3>
                <p style={{ fontSize: 20, fontWeight: 'bold', color: '#f97316' }}>₹{item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => updateQty(item.id, -1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #ddd', background: 'white', fontSize: 20, cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                <span style={{ fontSize: 20, fontWeight: 'bold', minWidth: 30, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #ddd', background: 'white', fontSize: 20, cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              </div>
              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <p style={{ fontSize: 18, fontWeight: 'bold' }}>₹{item.price * item.qty}</p>
                <button onClick={() => removeItem(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 24, marginTop: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 16 }}>
            <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>₹{subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 16 }}>
            <span>Tax (8%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 'bold', borderTop: '2px solid #eee', paddingTop: 16, marginTop: 16 }}>
            <span>Total</span>
            <span style={{ color: '#f97316' }}>₹{total}</span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 12, padding: 24, marginTop: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Your Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="Full Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ padding: 14, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }} />
            <input type="tel" placeholder="Phone Number *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ padding: 14, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }} />
            <input type="email" placeholder="Email (optional)" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} style={{ padding: 14, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }} />
            <textarea placeholder="Special instructions (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={{ padding: 14, border: '1px solid #ddd', borderRadius: 8, fontSize: 16, minHeight: 80, resize: 'vertical' }} />
          </div>
        </div>

        <button 
          onClick={placeOrder}
          disabled={placing}
          style={{ width: '100%', padding: '18px', marginTop: 24, background: placing ? '#ccc' : '#22c55e', color: 'white', border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 'bold', cursor: placing ? 'not-allowed' : 'pointer' }}
        >
          {placing ? 'Processing...' : `Place Order - ₹${total}`}
        </button>

        <button onClick={clearCart} style={{ width: '100%', padding: '12px', marginTop: 12, background: 'none', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, fontSize: 16, cursor: 'pointer' }}>
          Clear Cart
        </button>
      </div>
    </div>
  )
}
