'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [restaurant, setRestaurant] = useState<any>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    email: '',
    openingHours: '',
    logo: ''
  })
  
  const [upiId, setUpiId] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const menuRes = await fetch('/api/menu')
      const menuData = await menuRes.json()
      if (menuData.restaurant) {
        setRestaurant(menuData.restaurant)
        setForm({
          name: menuData.restaurant.name || '',
          description: menuData.restaurant.description || '',
          phone: menuData.restaurant.phone || '',
          address: menuData.restaurant.address || '',
          email: menuData.restaurant.email || '',
          openingHours: menuData.restaurant.openingHours || '',
          logo: menuData.restaurant.logo || ''
        })
        setLogoPreview(menuData.restaurant.logo || null)
      }
      
      const upiRes = await fetch('/api/upi')
      const upiData = await upiRes.json()
      setUpiId(upiData.upiId || '')
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/restaurant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (res.ok) {
        setMessage('Settings saved successfully!')
      } else {
        setMessage('Failed to save settings')
      }
    } catch (e) {
      setMessage('Error saving settings')
    }
    
    setSaving(false)
    setTimeout(() => { setMessage('') }, 3000)
  }

  const handleSaveUPI = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId })
      })
      
      if (res.ok) {
        setMessage('UPI settings saved!')
      } else {
        setMessage('Failed to save UPI settings')
      }
    } catch (e) {
      setMessage('Error saving UPI settings')
    }
    
    setSaving(false)
    setTimeout(() => { setMessage('') }, 3000)
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{padding: 20, textAlign: 'center'}}>Loading...</div>
      </div>
    )
  }

  const getMessageBg = () => {
    if (message.includes('success') || message.includes('UPI')) return '#dcfce7'
    return '#fef2f2'
  }

  const getMessageColor = () => {
    if (message.includes('success') || message.includes('UPI')) return '#166534'
    return '#dc2626'
  }

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh' }}>
      <Navbar />
      <div style={{padding: 24, maxWidth: 800, margin: '0 auto'}}>
        <h1 style={{fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#333'}}>Settings</h1>
        <p style={{color: '#666', marginBottom: 32}}>Manage your restaurant settings</p>

        {message ? (
          <div style={{background: getMessageBg(), color: getMessageColor(), padding: 14, borderRadius: 12, marginBottom: 20, textAlign: 'center', fontWeight: 'bold'}}>
            {message}
          </div>
        ) : null}

        <div style={{background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Restaurant Logo</h2>
          
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" style={{width: 80, height: 80, borderRadius: 16, objectFit: 'cover', border: '2px solid #e0e0e0'}} />
            ) : (
              <div style={{width: 80, height: 80, borderRadius: 16, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32}}>
                🍔
              </div>
            )}
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#555'}}>Logo URL</label>
              <input 
                type="url" 
                value={form.logo} 
                onChange={(e) => {
                  setForm({...form, logo: e.target.value})
                  setLogoPreview(e.target.value)
                }} 
                style={{width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 14}}
                placeholder="https://example.com/logo.png"
              />
              <p style={{color: '#888', fontSize: 12, marginTop: 4}}>Paste an image URL for your restaurant logo</p>
            </div>
          </div>
        </div>

        <div style={{background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Restaurant Information</h2>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#555'}}>Restaurant Name</label>
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} style={{width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16}} />
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#555'}}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} style={{width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16, minHeight: 80}} placeholder="Tell customers about your restaurant..." />
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
            <div style={{marginBottom: 16}}>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#555'}}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} style={{width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16}} placeholder="+91 98765 43210" />
            </div>
            <div style={{marginBottom: 16}}>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#555'}}>Email</label>
              <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} style={{width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16}} placeholder="contact@restaurant.com" />
            </div>
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#555'}}>Address</label>
            <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} style={{width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16}} placeholder="123 Main Street, City" />
          </div>
          
          <div style={{marginBottom: 24}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#555'}}>Opening Hours</label>
            <input value={form.openingHours} onChange={(e) => setForm({...form, openingHours: e.target.value})} style={{width: '100%', padding: 14, border: '1px solid #e0e0e0', borderRadius: 12, fontSize: 16}} placeholder="9:00 AM - 10:00 PM" />
          </div>
          
          <button onClick={handleSave} disabled={saving} style={{background: saving ? '#ccc' : '#22c55e', color: 'white', padding: '14px 28px', borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 16}}>
            {saving ? 'Saving...' : 'Save Restaurant Info'}
          </button>
        </div>

        <div style={{background: 'white', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize: 18, fontWeight: 'bold', marginBottom: 8}}>Payment Settings</h2>
          <p style={{color: '#666', marginBottom: 20, fontSize: 14}}>Configure how you receive payments from customers</p>
          
          <div style={{background: '#e8f5e9', borderRadius: 12, padding: 20, marginBottom: 20}}>
            <p style={{fontWeight: 'bold', color: '#2e7d32', marginBottom: 8, fontSize: 16}}>UPI Payment (Recommended)</p>
            <p style={{color: '#2e7d32', fontSize: 14, marginBottom: 16}}>Customers can pay using Google Pay, PhonePe, Paytm, or any UPI app.</p>
            
            <div style={{marginBottom: 16}}>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#2e7d32'}}>Your UPI ID</label>
              <input value={upiId} onChange={(e) => setUpiId(e.target.value)} style={{width: '100%', padding: 14, border: '1px solid #22c55e', borderRadius: 12, fontSize: 16, background: 'white'}} placeholder="yourname@upi" />
            </div>
            
            <button onClick={handleSaveUPI} disabled={saving} style={{background: '#2e7d32', color: 'white', padding: '12px 24px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 15}}>
              {saving ? 'Saving...' : 'Save UPI Settings'}
            </button>
          </div>
        </div>

        <div style={{background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Your Store Links</h2>
          
          <div style={{background: '#f8f8f8', borderRadius: 12, padding: 16, marginBottom: 16}}>
            <p style={{fontSize: 14, color: '#666', marginBottom: 8}}>Store URL:</p>
            <code style={{fontSize: 16, fontWeight: 'bold', color: '#ff6b35'}}>
              {window.location.origin}/{restaurant?.slug || 'your-store'}
            </code>
          </div>
          
          <p style={{color: '#666', fontSize: 14}}>Share this URL with your customers so they can browse your menu and place orders!</p>
        </div>
      </div>
    </div>
  )
}
