'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', restaurantName: '', restaurantSlug: '' })
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
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, maxWidth: 480, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 'bold', color: '#f97316', marginBottom: 8 }}>🍔 RestaurantHub</h1>
          <p style={{ color: '#666' }}>Start your online ordering business</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 20, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Your Account</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Your Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }}
              required
            />
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Your Restaurant</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Restaurant Name</label>
            <input
              type="text"
              name="restaurantName"
              value={form.restaurantName}
              onChange={handleChange}
              placeholder="My Burger Place"
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Your Store URL</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: 8, padding: '0 12px' }}>
              <span style={{ color: '#666' }}>{typeof window !== 'undefined' ? window.location.origin : ''}/</span>
              <input
                type="text"
                name="restaurantSlug"
                value={form.restaurantSlug}
                onChange={handleChange}
                placeholder="my-burger-place"
                style={{ flex: 1, padding: 12, border: 'none', background: 'transparent', fontSize: 16 }}
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
              padding: 14,
              background: loading ? '#ccc' : '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Create My Restaurant'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#666' }}>
          Already have an account? <Link href="/login" style={{ color: '#f97316', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  )
}
