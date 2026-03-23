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
  const [addingItem, setAddingItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(`cart_${restaurant.slug}`)
    if (saved) setCart(JSON.parse(saved))
  }, [restaurant.slug])

  const addToCart = (item: MenuItem) => {
    setAddingItem(item.id)
    setTimeout(() => setAddingItem(null), 500)
    
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

  const searchedItems = searchQuery 
    ? filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredItems

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 100 }}>
      {/* Hero Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa726 100%)',
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
        
        <div style={{ position: 'relative', padding: 24, textAlign: 'center', color: 'white' }}>
          {restaurant.logo ? (
            <img 
              src={restaurant.logo} 
              alt={restaurant.name} 
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                border: '4px solid white',
                objectFit: 'cover',
                marginBottom: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }} 
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', fontSize: 36, boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>🍔</div>
          )}
          <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            {restaurant.name}
          </h1>
          <p style={{ fontSize: 14, opacity: 0.95, marginTop: 4 }}>
            {restaurant.address || 'Delicious food delivered to you'}
          </p>
          
          {/* Info badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {restaurant.openingHours && (
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20, fontSize: 12, backdropFilter: 'blur(10px)' }}>
                🕐 {restaurant.openingHours}
              </div>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 20, fontSize: 12, color: 'white', textDecoration: 'none', backdropFilter: 'blur(10px)' }}>
                📞 {restaurant.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '16px 16px 0', position: 'sticky', top: 0, background: 'white', zIndex: 50 }}>
        <div style={{ 
          background: '#f5f5f5', 
          borderRadius: 25, 
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input 
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'transparent', 
              fontSize: 16,
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div style={{ padding: '16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'inline-flex', gap: 8, paddingBottom: 4 }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '10px 18px',
                borderRadius: 25,
                border: 'none',
                cursor: 'pointer',
                background: !selectedCategory ? '#ff6b35' : '#f0f0f0',
                color: !selectedCategory ? 'white' : '#333',
                fontWeight: 'bold',
                fontSize: 14,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              🥘 All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 25,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedCategory === cat.id ? '#ff6b35' : '#f0f0f0',
                  color: selectedCategory === cat.id ? 'white' : '#333',
                  fontWeight: 'bold',
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 14 }}>
          {searchedItems.map(item => (
            <div key={item.id} style={{ 
              background: 'white', 
              borderRadius: 16, 
              overflow: 'hidden', 
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'
            }}
            >
              <div style={{ height: 130, background: '#fafafa', position: 'relative', overflow: 'hidden' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff5f0 0%, #fff0e8 100%)' }}>
                    <span style={{ fontSize: 50 }}>🍽️</span>
                  </div>
                )}
                {addingItem === item.id && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(34,197,94,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold', fontSize: 16
                  }}>
                    ✓ Added!
                  </div>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 4, lineHeight: 1.2, color: '#333' }}>{item.name}</h3>
                <p style={{ color: '#888', marginBottom: 10, fontSize: 12, lineHeight: 1.3, minHeight: 30 }}>
                  {item.description?.slice(0, 45) || 'Delicious item'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: '#ff6b35' }}>₹{item.price}</span>
                  <button 
                    onClick={() => addToCart(item)} 
                    style={{ 
                      background: '#ff6b35', 
                      color: 'white', 
                      padding: '8px 14px', 
                      borderRadius: 20, 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontWeight: 'bold', 
                      fontSize: 14,
                      boxShadow: '0 2px 8px rgba(255,107,53,0.3)'
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {searchedItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 20, marginTop: 20 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
            <h2 style={{ fontSize: 20, marginBottom: 8, color: '#333' }}>No items found</h2>
            <p style={{ color: '#888' }}>Try a different search term</p>
          </div>
        )}
      </div>

      {/* Bottom Cart Button */}
      {cartCount > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 16, 
          left: 16, 
          right: 16, 
          maxWidth: 500,
          margin: '0 auto',
          zIndex: 100
        }}>
          <Link href={`/${restaurant.slug}/cart`} style={{ 
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderRadius: 16,
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: 16,
            boxShadow: '0 4px 20px rgba(34,197,94,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🛒</span>
              <span>{cartCount} items</span>
            </div>
            <span>View Cart →</span>
          </Link>
        </div>
      )}
    </div>
  )
}
