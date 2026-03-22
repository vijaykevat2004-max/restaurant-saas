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
  categories: Category[]
}

export default function CustomerMenuClient({ restaurant }: { restaurant: Restaurant }) {
  const [cart, setCart] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div style={{ background: '#f97316', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>{restaurant.name}</h1>
        <p style={{ opacity: 0.9 }}>{restaurant.description || 'Delicious food delivered to you'}</p>
      </div>
      
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold' }}>Menu</h2>
          <Link href={`/${restaurant.slug}/cart`} style={{ 
            background: '#22c55e', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: 8, 
            textDecoration: 'none', 
            fontWeight: 'bold',
            position: 'relative'
          }}>
            Cart ({cartCount})
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -8,
                background: '#ef4444', color: 'white',
                width: 20, height: 20, borderRadius: '50%',
                fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {categories.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                background: !selectedCategory ? '#f97316' : '#e5e7eb',
                color: !selectedCategory ? 'white' : '#374151',
                fontWeight: 'bold'
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedCategory === cat.id ? '#f97316' : '#e5e7eb',
                  color: selectedCategory === cat.id ? 'white' : '#374151',
                  fontWeight: 'bold'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filteredItems.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ height: 180, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 64 }}>🍽️</span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>{item.name}</h3>
                <p style={{ color: '#666', marginBottom: 12, fontSize: 14, minHeight: 40 }}>{item.description || 'Delicious item'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 24, fontWeight: 'bold', color: '#f97316' }}>₹{item.price}</span>
                  <button 
                    onClick={() => addToCart(item)} 
                    style={{ 
                      background: '#f97316', 
                      color: 'white', 
                      padding: '10px 20px', 
                      borderRadius: 8, 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontWeight: 'bold', 
                      fontSize: 16 
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
    </div>
  )
}
