'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    restaurantName: '', 
    restaurantSlug: '',
    restaurantLogo: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'restaurantSlug') {
      setForm({ ...form, [name]: value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, restaurantLogo: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!form.name || !form.email || !form.password || !form.restaurantName || !form.restaurantSlug) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (form.restaurantSlug.length < 3) {
      setError('Restaurant URL must be at least 3 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      router.push('/login?registered=true')
    } catch (e) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 32, maxWidth: 480, width: '100%', margin: '0 auto', boxShadow: '0 4px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
            🍔 RestaurantHub
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>Start your online ordering business</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 12, marginBottom: 20, textAlign: 'center', fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>👤 Your Account</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', color: '#555', fontSize: 14 }}>Your Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', color: '#555', fontSize: 14 }}>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', color: '#555', fontSize: 14 }}>Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>🏪 Your Restaurant</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', color: '#555', fontSize: 14 }}>Restaurant Name *</label>
            <input
              type="text"
              name="restaurantName"
              value={form.restaurantName}
              onChange={handleChange}
              placeholder="My Burger Place"
              style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', color: '#555', fontSize: 14 }}>Restaurant Logo URL</label>
            <input
              type="url"
              name="restaurantLogo"
              value={form.restaurantLogo}
              onChange={handleLogoUrlChange}
              placeholder="https://example.com/logo.png"
              style={{ width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Paste an image URL for your restaurant logo</p>
            {form.restaurantLogo && (
              <div style={{ marginTop: 8 }}>
                <img src={form.restaurantLogo} alt="Logo Preview" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid #e0e0e0' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', color: '#555', fontSize: 14 }}>Your Store URL *</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f8f8', borderRadius: 12, padding: '0 14px', border: '1px solid #e0e0e0' }}>
              <span style={{ color: '#888', fontSize: 14, whiteSpace: 'nowrap' }}>yoursite.com/</span>
              <input
                type="text"
                name="restaurantSlug"
                value={form.restaurantSlug}
                onChange={handleChange}
                placeholder="my-burger-place"
                style={{ flex: 1, padding: 14, border: 'none', background: 'transparent', fontSize: 16 }}
                required
              />
            </div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Your customers will order from this URL</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 16,
              background: loading ? '#ccc' : 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(255,107,53,0.3)'
            }}
          >
            {loading ? '⏳ Creating Account...' : '🚀 Create My Restaurant'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#666', fontSize: 14 }}>
          Already have an account? <Link href="/login" style={{ color: '#ff6b35', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  )
}
