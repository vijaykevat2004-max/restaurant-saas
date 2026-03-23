'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
}

interface Category {
  id: string
  name: string
  menuItems: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  phone: string | null
  address: string | null
  openingHours: string | null
  categories: Category[]
}

export default function CustomerMenuClient({ restaurant }: { restaurant: Restaurant }) {
  const [cart, setCart] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`cart_${restaurant.slug}`)
    if (saved) setCart(JSON.parse(saved))
  }, [restaurant.slug])

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.id === item.id)
    let newCart
    if (existing) {
      newCart = cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c)
    } else {
      newCart = [...cart, {id: item.id, name: item.name, price: item.price, qty: 1, image: item.image}]
    }
    setCart(newCart)
    localStorage.setItem(`cart_${restaurant.slug}`, JSON.stringify(newCart))
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const categories = restaurant.categories.filter(c => c.menuItems.length > 0)
  const filteredItems = selectedCategory 
    ? restaurant.categories.find(c => c.id === selectedCategory)?.menuItems || []
    : restaurant.categories.flatMap(c => c.menuItems)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        color: 'white',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {restaurant.logo ? (
              <img src={restaurant.logo} alt={restaurant.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                🍔
              </div>
            )}
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 'bold', margin: 0 }}>{restaurant.name}</h1>
              {restaurant.address && <p style={{ fontSize: 12, opacity: 0.9, margin: 0 }}>{restaurant.address}</p>}
            </div>
          </div>
          <Link href={`/${restaurant.slug}/cart`} style={{ 
            background: 'white',
            color: '#ff6b35',
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: 18,
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            🛒
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#ff4444', color: 'white',
                width: 20, height: 20, borderRadius: '50%',
                fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Restaurant Info */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px' }}>
        {restaurant.openingHours && (
          <div style={{ background: '#f8f8f8', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🕐</span>
            <span style={{ color: '#666', fontSize: 14 }}>{restaurant.openingHours}</span>
          </div>
        )}
        {restaurant.phone && (
          <a href={`tel:${restaurant.phone}`} style={{ background: '#e8f5e9', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#2e7d32' }}>
            <span style={{ fontSize: 18 }}>📞</span>
            <span style={{ fontSize: 14, fontWeight: 'bold' }}>{restaurant.phone}</span>
          </a>
        )}
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'inline-flex', gap: 8, paddingBottom: 8 }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '10px 20px',
                borderRadius: 25,
                border: 'none',
                cursor: 'pointer',
                background: !selectedCategory ? '#ff6b35' : '#f0f0f0',
                color: !selectedCategory ? 'white' : '#333',
                fontWeight: 'bold',
                fontSize: 14,
                whiteSpace: 'nowrap'
              }}
            >
              🍽️ All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 25,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedCategory === cat.id ? '#ff6b35' : '#f0f0f0',
                  color: selectedCategory === cat.id ? 'white' : '#333',
                  fontWeight: 'bold',
                  fontSize: 14,
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Menu Grid */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {filteredItems.map(item => (
            <div key={item.id} style={{ 
              background: 'white', 
              borderRadius: 16, 
              overflow: 'hidden', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ height: 120, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 48 }}>🍽️</span>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 4, lineHeight: 1.2 }}>{item.name}</h3>
                <p style={{ color: '#888', marginBottom: 8, fontSize: 12, lineHeight: 1.3, minHeight: 30 }}>
                  {item.description?.slice(0, 50) || 'Delicious item'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: '#ff6b35' }}>₹{item.price}</span>
                  <button 
                    onClick={() => addToCart(item)} 
                    style={{ 
                      background: '#ff6b35', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: 20, 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontWeight: 'bold', 
                      fontSize: 14 
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🍽️</div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>No items available</h2>
            <p style={{ color: '#666' }}>Please check back later</p>
          </div>
        )}
      </div>

      {/* Bottom Cart Button */}
      {cartCount > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: 'white',
          padding: '12px 16px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          zIndex: 100
        }}>
          <Link href={`/${restaurant.slug}/cart`} style={{ 
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            display: 'block',
            textAlign: 'center',
            padding: '14px',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: 16,
            boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
          }}>
            View Cart ({cartCount} items) →
          </Link>
        </div>
      )}
    </div>
  )
}
