'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface Stats {
  orders: number
  revenue: number
  menuItems: number
  categories: number
}

interface Restaurant {
  id: string
  name: string
  slug: string
  description: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({ orders: 0, revenue: 0, menuItems: 0, categories: 0 })
  const [setupComplete, setSetupComplete] = useState(false)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/my-restaurant')
      const data = await res.json()
      
      if (data.restaurant) {
        setRestaurant(data.restaurant)
        
        const [ordersRes, menuRes] = await Promise.all([
          fetch('/api/all-orders'),
          fetch('/api/menu')
        ])
        
        const orders = await ordersRes.json()
        const menu = await menuRes.json()
        
        const orderList = Array.isArray(orders) ? orders : []
        const todayOrders = orderList.filter((o: any) => 
          o.restaurantId === data.restaurant.id &&
          new Date(o.createdAt).toDateString() === new Date().toDateString()
        )
        
        setStats({
          orders: todayOrders.length,
          revenue: todayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          menuItems: menu.categories?.reduce((sum: number, c: any) => sum + c.menuItems.length, 0) || 0,
          categories: menu.categories?.length || 0
        })
        
        setSetupComplete(menu.categories?.length > 0)
      } else {
        setError('no-restaurant')
      }
    } catch (e) {
      console.error(e)
      setError('error')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 24 }}>Loading...</div>
      </div>
    )
  }

  if (error === 'no-restaurant' || !restaurant) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <Navbar />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>No Restaurant Found</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>You don't have a restaurant associated with your account.</p>
          <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>
            If you just registered, please check if your account was created successfully.
          </p>
          <a href="/register" style={{ background: '#f97316', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold' }}>
            Create Restaurant
          </a>
        </div>
      </div>
    )
  }

  if (!setupComplete) {
    return (
      <div style={{ minHeight: '100vh', background: '#fafafa' }}>
        <Navbar />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 12 }}>Welcome!</h1>
          <p style={{ color: '#666', fontSize: 18, marginBottom: 8 }}>Your restaurant: <strong>{restaurant.name}</strong></p>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>Let's set up your restaurant in a few steps.</p>
          
          <div style={{ display: 'grid', gap: 16, textAlign: 'left' }}>
            <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 32 }}>📋</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: 4 }}>1. Add Menu Categories</h3>
                  <p style={{ color: '#666', fontSize: 14 }}>Create categories like Burgers, Drinks, Sides</p>
                </div>
                <Link href="/menu" style={{ background: '#f97316', color: 'white', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold' }}>Setup →</Link>
              </div>
            </div>
            
            <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 32 }}>🍔</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: 4 }}>2. Add Menu Items</h3>
                  <p style={{ color: '#666', fontSize: 14 }}>Add your food items with prices</p>
                </div>
                <Link href="/menu" style={{ background: '#f97316', color: 'white', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold' }}>Setup →</Link>
              </div>
            </div>
            
            <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 32 }}>💳</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: 4 }}>3. Configure Payment</h3>
                  <p style={{ color: '#666', fontSize: 14 }}>Set up your UPI ID for receiving payments</p>
                </div>
                <Link href="/settings" style={{ background: '#f97316', color: 'white', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold' }}>Setup →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>Dashboard</h1>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 'bold', color: '#f97316' }}>{restaurant.name}</p>
            <p style={{ fontSize: 12, color: '#666' }}>{typeof window !== 'undefined' ? window.location.origin : ''}/{restaurant.slug}</p>
          </div>
        </div>
        <p style={{ color: '#666', marginBottom: 32 }}>Welcome to your restaurant dashboard</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>🛒</span>
              <span style={{ fontSize: 14, color: '#666' }}>Today's Orders</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#3b82f6' }}>{stats.orders}</div>
          </div>
          
          <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>💰</span>
              <span style={{ fontSize: 14, color: '#666' }}>Today's Revenue</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#22c55e' }}>₹{stats.revenue.toFixed(0)}</div>
          </div>
          
          <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>🍔</span>
              <span style={{ fontSize: 14, color: '#666' }}>Menu Items</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#f97316' }}>{stats.menuItems}</div>
          </div>
          
          <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32 }}>📁</span>
              <span style={{ fontSize: 14, color: '#666' }}>Categories</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#8b5cf6' }}>{stats.categories}</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/menu" style={{ background: '#f97316', color: 'white', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 'bold' }}>🍔 Manage Menu</Link>
            <Link href="/orders" style={{ background: '#3b82f6', color: 'white', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 'bold' }}>📋 View Orders</Link>
            <Link href="/kitchen" style={{ background: '#22c55e', color: 'white', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 'bold' }}>👨‍🍳 Kitchen Display</Link>
            <Link href="/staff" style={{ background: '#8b5cf6', color: 'white', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 'bold' }}>👥 Staff</Link>
            <Link href="/settings" style={{ background: '#6b7280', color: 'white', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 'bold' }}>⚙️ Settings</Link>
            <Link href={`/${restaurant.slug}`} target="_blank" style={{ background: '#ec4899', color: 'white', padding: '14px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 'bold' }}>🛒 View Store ↗</Link>
          </div>
        </div>

        <div style={{ background: '#fffbeb', padding: 20, borderRadius: 16, border: '1px solid #f59e0b' }}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', color: '#92400e', marginBottom: 8 }}>💡 Share your store</h3>
          <p style={{ color: '#92400e', fontSize: 14 }}>
            Send this link to your customers: <strong>{typeof window !== 'undefined' ? window.location.origin : ''}/{restaurant.slug}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
