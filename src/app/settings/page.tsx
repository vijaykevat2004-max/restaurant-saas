'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [restaurant, setRestaurant] = useState<any>(null)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    email: '',
    openingHours: ''
  })
  
  const [upiSettings, setUpiSettings] = useState({
    upiId: '',
    razorpayKeyId: '',
    razorpayKeySecret: ''
  })

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
          openingHours: menuData.restaurant.openingHours || ''
        })
      }
      
      const upiRes = await fetch('/api/upi')
      const upiData = await upiRes.json()
      setUpiSettings({ ...upiSettings, upiId: upiData.upiId || '' })
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
    setTimeout(() => setMessage(''), 3000)
  }

  const handleSaveUPI = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: upiSettings.upiId })
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
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div><Navbar />
        <div style={{padding: 20, textAlign: 'center'}}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{padding: 24, maxWidth: 800, margin: '0 auto'}}>
        <h1 style={{fontSize: 28, fontWeight: 'bold', marginBottom: 8}}>Settings</h1>
        <p style={{color: '#666', marginBottom: 32}}>Manage your restaurant settings</p>

        {message && (
          <div style={{background: message.includes('success') ? '#dcfce7' : '#fef2f2', color: message.includes('success') ? '#166534' : '#dc2626', padding: 12, borderRadius: 8, marginBottom: 20, textAlign: 'center', fontWeight: 'bold'}}>
            {message}
          </div>
        )}

        <div style={{background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <h2 style={{fontSize: 20, fontWeight: 'bold', marginBottom: 20}}>🏪 Restaurant Information</h2>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Restaurant Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16}} />
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16, minHeight: 80}} placeholder="Tell customers about your restaurant..." />
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
            <div style={{marginBottom: 16}}>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16}} placeholder="+91 98765 43210" />
            </div>
            <div style={{marginBottom: 16}}>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16}} placeholder="contact@restaurant.com" />
            </div>
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Address</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16}} placeholder="123 Main Street, City" />
          </div>
          
          <div style={{marginBottom: 24}}>
            <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Opening Hours</label>
            <input value={form.openingHours} onChange={e => setForm({...form, openingHours: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16}} placeholder="9:00 AM - 10:00 PM" />
          </div>
          
          <button onClick={handleSave} disabled={saving} style={{background: saving ? '#ccc' : '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 16}}>
            {saving ? 'Saving...' : 'Save Restaurant Info'}
          </button>
        </div>

        <div style={{background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <h2 style={{fontSize: 20, fontWeight: 'bold', marginBottom: 8}}>💳 Payment Settings</h2>
          <p style={{color: '#666', marginBottom: 20, fontSize: 14}}>Configure how you receive payments from customers</p>
          
          <div style={{background: '#dcfce7', borderRadius: 8, padding: 16, marginBottom: 20}}>
            <p style={{fontWeight: 'bold', color: '#166534', marginBottom: 8}}>📱 UPI Payment (Recommended)</p>
            <p style={{color: '#166534', fontSize: 14, marginBottom: 16}}>Customers can pay using Google Pay, PhonePe, Paytm, or any UPI app by scanning a QR code.</p>
            
            <div style={{marginBottom: 16}}>
              <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#166534'}}>Your UPI ID</label>
              <input value={upiSettings.upiId} onChange={e => setUpiSettings({...upiSettings, upiId: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #22c55e', borderRadius: 8, fontSize: 16}} placeholder="yourname@upi" />
              <p style={{color: '#666', fontSize: 12, marginTop: 4}}>Enter your UPI ID where you want to receive payments</p>
            </div>
            
            <button onClick={handleSaveUPI} disabled={saving} style={{background: '#166534', color: 'white', padding: '12px 24px', borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold'}}>
              {saving ? 'Saving...' : 'Save UPI Settings'}
            </button>
          </div>
          
          <div style={{background: '#fef3c7', borderRadius: 8, padding: 16}}>
            <p style={{fontWeight: 'bold', color: '#92400e', marginBottom: 8}}>🔒 Razorpay (Advanced)</p>
            <p style={{color: '#92400e', fontSize: 14, marginBottom: 16}}>For automated payment verification and more payment options. Requires Razorpay account.</p>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
              <div>
                <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#92400e', fontSize: 14}}>Razorpay Key ID</label>
                <input value={upiSettings.razorpayKeyId} onChange={e => setUpiSettings({...upiSettings, razorpayKeyId: e.target.value})} style={{width: '100%', padding: 10, border: '1px solid #f59e0b', borderRadius: 6, fontSize: 14}} placeholder="rzp_live_xxx" />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#92400e', fontSize: 14}}>Razorpay Key Secret</label>
                <input type="password" value={upiSettings.razorpayKeySecret} onChange={e => setUpiSettings({...upiSettings, razorpayKeySecret: e.target.value})} style={{width: '100%', padding: 10, border: '1px solid #f59e0b', borderRadius: 6, fontSize: 14}} placeholder="xxxxx" />
              </div>
            </div>
            <p style={{color: '#92400e', fontSize: 12, marginTop: 8}}>Get your keys from <a href="https://dashboard.razorpay.com" target="_blank" style={{color: '#166534'}}>dashboard.razorpay.com</a></p>
          </div>
        </div>

        <div style={{background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <h2 style={{fontSize: 20, fontWeight: 'bold', marginBottom: 20}}>🔗 Your Store Links</h2>
          
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16}}>
            <span style={{fontSize: 14, color: '#666', minWidth: 100}}>Store URL:</span>
            <code style={{background: '#f3f4f6', padding: '8px 16px', borderRadius: 6, flex: 1, fontSize: 14}}>
              {typeof window !== 'undefined' ? window.location.origin : ''}/{restaurant?.slug || 'your-store'}
            </code>
          </div>
          
          <p style={{color: '#666', fontSize: 14}}>Share this URL with your customers so they can browse your menu and place orders!</p>
        </div>
      </div>
    </div>
  )
}
