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
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`cart_${restaurant.slug}`)
    if (saved) setCart(JSON.parse(saved))
  }, [restaurant.slug])

  const addToCart = (item: MenuItem) => {
    setAddingItem(item.id)
    setTimeout(() => setAddingItem(null), 600)
    
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

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('burger')) return '🍔'
    if (lower.includes('pizza')) return '🍕'
    if (lower.includes('drink') || lower.includes('beverage')) return '🥤'
    if (lower.includes('dessert') || lower.includes('sweet')) return '🍰'
    if (lower.includes('coffee') || lower.includes('tea')) return '☕'
    if (lower.includes('ice') || lower.includes('shake')) return '🍨'
    if (lower.includes('side') || lower.includes('fries')) return '🍟'
    if (lower.includes('combo')) return '🍱'
    return '🍽️'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 100, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        background: '#fff',
        borderBottom: '3px solid #d32f2f',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: 768, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {restaurant.logo ? (
              <img src={restaurant.logo} alt={restaurant.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 20 }}>
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#333' }}>{restaurant.name}</h1>
              {restaurant.address && <p style={{ margin: 0, fontSize: 11, color: '#666' }}>{restaurant.address}</p>}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} style={{ width: 40, height: 40, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#333' }}>
                📞
              </a>
            )}
            <Link href={`/${restaurant.slug}/cart`} style={{ 
              width: 44, height: 44, borderRadius: '50%', 
              background: '#d32f2f', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              textDecoration: 'none', position: 'relative'
            }}>
              🛒
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#ffeb3b', color: '#333',
                  width: 20, height: 20, borderRadius: '50%',
                  fontSize: 11, fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        {/* Info Bar */}
        {restaurant.openingHours && (
          <div style={{ background: '#fff3e0', padding: '8px 16px', textAlign: 'center', fontSize: 12, color: '#e65100', borderTop: '1px solid #ffe0b2' }}>
            🕐 {restaurant.openingHours}
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: 768, margin: '0 auto' }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 8, 
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #ddd',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: 16, color: '#999' }}>🔍</span>
            <input 
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 'none', fontSize: 15, outline: 'none', background: 'transparent' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#999' }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 1 && (
        <div style={{ padding: '12px 16px', overflowX: 'auto', background: '#fff' }}>
          <div style={{ maxWidth: 768, margin: '0 auto', display: 'flex', gap: 8 }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                background: !selectedCategory ? '#d32f2f' : '#f5f5f5',
                color: !selectedCategory ? 'white' : '#333',
                fontWeight: 600,
                fontSize: 13,
                whiteSpace: 'nowrap',
                minWidth: 80
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
                  background: selectedCategory === cat.id ? '#d32f2f' : '#f5f5f5',
                  color: selectedCategory === cat.id ? 'white' : '#333',
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  minWidth: 80,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>{getCategoryIcon(cat.name)}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div style={{ padding: '16px', maxWidth: 768, margin: '0 auto' }}>
        <h2 style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>
          {searchQuery ? `Search results for "${searchQuery}"` : (selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Popular Items')}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {searchedItems.map(item => (
            <div key={item.id} style={{ 
              background: '#fff', 
              borderRadius: 12, 
              overflow: 'hidden', 
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              border: '1px solid #eee',
              display: 'flex',
              transition: 'all 0.2s'
            }}>
              <div style={{ width: 100, height: 100, flexShrink: 0, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 40 }}>{getCategoryIcon(item.name)}</span>
                )}
              </div>
              <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 'bold', margin: 0, marginBottom: 4, color: '#333' }}>{item.name}</h3>
                  <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.4 }}>
                    {item.description?.slice(0, 60) || 'Delicious item'}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 'bold', color: '#d32f2f' }}>₹{item.price}</span>
                  <button 
                    onClick={() => addToCart(item)} 
                    style={{ 
                      background: addingItem === item.id ? '#4caf50' : '#d32f2f',
                      color: 'white', 
                      padding: '6px 16px', 
                      borderRadius: 6, 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontWeight: 'bold', 
                      fontSize: 13,
                      transition: 'all 0.2s'
                    }}
                  >
                    {addingItem === item.id ? '✓ ADDED' : '+ ADD'}
                  </button>
                </div>
                {addingItem === item.id && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(76, 175, 80, 0.95)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 'bold', fontSize: 14
                  }}>
                    ✓ Added to cart
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {searchedItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 50, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 18, color: '#333', marginBottom: 4 }}>No items found</h3>
            <p style={{ fontSize: 14, color: '#666' }}>Try searching for something else</p>
          </div>
        )}
      </div>

      {/* Bottom Cart */}
      {cartCount > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          background: '#fff',
          borderTop: '1px solid #ddd',
          padding: '12px 16px',
          zIndex: 99
        }}>
          <Link href={`/${restaurant.slug}/cart`} style={{ 
            background: '#d32f2f',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: 15,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛒</span>
              <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
            </div>
            <span>View Cart →</span>
          </Link>
        </div>
      )}
    </div>
  )
}
