'use client'
import { useEffect, useState, useRef } from 'react'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [restaurant, setRestaurant] = useState<any>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    email: '',
    openingHours: '',
    logo: '',
    whatsappNumber: ''
  })
  
  const [upiId, setUpiId] = useState('')
  const [paymentMode, setPaymentMode] = useState('own_upi')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [cashfreeAppId, setCashfreeAppId] = useState('')
  const [cashfreeSecret, setCashfreeSecret] = useState('')

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
          logo: menuData.restaurant.logo || '',
          whatsappNumber: menuData.restaurant.whatsappNumber || ''
        })
        setLogoPreview(menuData.restaurant.logo || null)
      }
      
      const upiRes = await fetch('/api/upi')
      const upiData = await upiRes.json()
        setUpiId(upiData.upiId || '')
        setPaymentMode(upiData.paymentMode || 'own_upi')
        setWhatsappNumber(menuData.restaurant.whatsappNumber || '')
        setCashfreeAppId(upiData.cashfreeAppId || '')
        setCashfreeSecret(upiData.cashfreeSecret ? '••••••••' : '')
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logos')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (data.url) {
        const logoUrl = data.url
        setForm({...form, logo: logoUrl})
        setLogoPreview(logoUrl)
        setMessage('Logo uploaded! Save to apply.')
      }
    } catch (err) {
      console.error(err)
      setMessage('Upload failed')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    if (!form.name.trim()) {
      setMessage('Please enter restaurant name')
      setSaving(false)
      setTimeout(() => { setMessage('') }, 3000)
      return
    }
    
    try {
      const method = restaurant ? 'PATCH' : 'POST'
      const res = await fetch('/api/restaurant', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (!restaurant) {
          setRestaurant(data.restaurant)
        }
        setMessage('Settings saved successfully!')
      } else {
        const data = await res.json()
        setMessage('Error: ' + (data.error || 'Failed to save'))
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
        body: JSON.stringify({ 
          upiId, 
          paymentMode,
          cashfreeAppId,
          cashfreeSecret
        })
      })
      
      if (res.ok) {
        setMessage('Payment settings saved!')
      } else {
        const data = await res.json()
        setMessage('Error: ' + (data.error || 'Failed to save'))
      }
    } catch (e) {
      setMessage('Error saving payment settings')
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
    if (message.includes('success') || message.includes('UPI') || message.includes('Logo') || message.includes('uploaded')) return '#dcfce7'
    return '#fef2f2'
  }

  const getMessageColor = () => {
    if (message.includes('success') || message.includes('UPI') || message.includes('Logo') || message.includes('uploaded')) return '#166534'
    return '#dc2626'
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: 40 }}>
      <Navbar />
      <div style={{padding: 16, maxWidth: 800, margin: '0 auto'}}>
        <h1 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 4, color: '#333'}}>Settings</h1>
        <p style={{color: '#666', marginBottom: 20}}>Manage your restaurant</p>

        {message ? (
          <div style={{background: getMessageBg(), color: getMessageColor(), padding: 12, borderRadius: 10, marginBottom: 16, textAlign: 'center', fontWeight: 'bold', fontSize: 14}}>
            {message}
          </div>
        ) : null}

        <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize: 16, fontWeight: 'bold', marginBottom: 16}}>Restaurant Logo</h2>
          
          <div style={{display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'}}>
            {logoPreview ? (
              <div style={{position: 'relative'}}>
                <img src={logoPreview} alt="Logo" style={{width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '2px solid #e0e0e0'}} />
                <button 
                  onClick={() => { setLogoPreview(null); setForm({...form, logo: ''}) }}
                  style={{position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ff4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12}}
                >✕</button>
              </div>
            ) : (
              <div style={{width: 80, height: 80, borderRadius: 12, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>
                🍔
              </div>
            )}
            <div style={{flex: 1, minWidth: 200}}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                style={{display: 'none'}}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  background: '#ff6b35',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: 14
                }}
              >
                {uploading ? 'Uploading...' : '📷 Choose Image'}
              </button>
              <p style={{color: '#888', fontSize: 12, marginTop: 6}}>JPG, PNG, GIF supported (max 5MB)</p>
            </div>
          </div>
        </div>

        <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize: 16, fontWeight: 'bold', marginBottom: 16}}>Restaurant Information</h2>
          
          <div style={{marginBottom: 14}}>
            <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#555', fontSize: 13}}>Restaurant Name</label>
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box'}} />
          </div>
          
          <div style={{marginBottom: 14}}>
            <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#555', fontSize: 13}}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 15, minHeight: 70, boxSizing: 'border-box'}} placeholder="Tell customers about your restaurant..." />
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
            <div style={{marginBottom: 14}}>
              <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#555', fontSize: 13}}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box'}} placeholder="+91 98765 43210" />
            </div>
            <div style={{marginBottom: 14}}>
              <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#555', fontSize: 13}}>WhatsApp</label>
              <input value={form.whatsappNumber} onChange={(e) => setForm({...form, whatsappNumber: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box'}} placeholder="919876543210" />
            </div>
          </div>
          
          <div style={{marginBottom: 14}}>
            <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#555', fontSize: 13}}>Email</label>
            <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box'}} placeholder="contact@restaurant.com" />
          </div>
          
          <div style={{marginBottom: 14}}>
            <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#555', fontSize: 13}}>Address</label>
            <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box'}} placeholder="123 Main Street, City" />
          </div>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#555', fontSize: 13}}>Opening Hours</label>
            <input value={form.openingHours} onChange={(e) => setForm({...form, openingHours: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box'}} placeholder="9:00 AM - 10:00 PM" />
          </div>
          
          <button onClick={handleSave} disabled={saving} style={{background: saving ? '#ccc' : '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 14}}>
            {saving ? 'Saving...' : '💾 Save Info'}
          </button>
        </div>

        <div style={{background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize: 16, fontWeight: 'bold', marginBottom: 4}}>💳 Payment Settings</h2>
          <p style={{color: '#888', fontSize: 13, marginBottom: 16}}>Receive payments directly to your account</p>
          
          <div style={{marginBottom: 16}}>
            <label style={{display: 'block', marginBottom: 8, fontWeight: 'bold', color: '#333', fontSize: 14}}>Payment Method</label>
            
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12}}>
              <div 
                onClick={() => setPaymentMode('upi_qr')}
                style={{
                  flex: '1 1 140px', padding: 14, borderRadius: 10, border: paymentMode === 'upi_qr' ? '2px solid #22c55e' : '2px solid #e0e0e0',
                  background: paymentMode === 'upi_qr' ? '#f0fdf4' : 'white', cursor: 'pointer', textAlign: 'center'
                }}
              >
                <div style={{fontSize: 24, marginBottom: 4}}>📱</div>
                <div style={{fontWeight: 'bold', fontSize: 13, color: paymentMode === 'upi_qr' ? '#22c55e' : '#333'}}>UPI QR Code</div>
                <div style={{fontSize: 11, color: '#888', marginTop: 2}}>Scan & Pay</div>
              </div>
              
              <div 
                onClick={() => setPaymentMode('own_cashfree')}
                style={{
                  flex: '1 1 140px', padding: 14, borderRadius: 10, border: paymentMode === 'own_cashfree' ? '2px solid #22c55e' : '2px solid #e0e0e0',
                  background: paymentMode === 'own_cashfree' ? '#f0fdf4' : 'white', cursor: 'pointer', textAlign: 'center'
                }}
              >
                <div style={{fontSize: 24, marginBottom: 4}}>💰</div>
                <div style={{fontWeight: 'bold', fontSize: 13, color: paymentMode === 'own_cashfree' ? '#22c55e' : '#333'}}>My Cashfree</div>
                <div style={{fontSize: 11, color: '#888', marginTop: 2}}>Your account</div>
              </div>
              
              <div 
                onClick={() => setPaymentMode('platform')}
                style={{
                  flex: '1 1 140px', padding: 14, borderRadius: 10, border: paymentMode === 'platform' ? '2px solid #22c55e' : '2px solid #e0e0e0',
                  background: paymentMode === 'platform' ? '#f0fdf4' : 'white', cursor: 'pointer', textAlign: 'center'
                }}
              >
                <div style={{fontSize: 24, marginBottom: 4}}>🏦</div>
                <div style={{fontWeight: 'bold', fontSize: 13, color: paymentMode === 'platform' ? '#22c55e' : '#333'}}>Platform</div>
                <div style={{fontSize: 11, color: '#888', marginTop: 2}}>Auto settle</div>
              </div>
            </div>
          </div>
          
          {paymentMode === 'upi_qr' && (
            <div style={{background: '#e3f2fd', borderRadius: 10, padding: 16}}>
              <p style={{fontWeight: 'bold', color: '#1565c0', marginBottom: 10, fontSize: 14}}>📱 UPI QR Code Payment (Recommended)</p>
              <p style={{fontSize: 12, color: '#1565c0', marginBottom: 12}}>Customers scan QR code and pay directly to your UPI. Works with any UPI app (GPay, PhonePe, Paytm).</p>
              
              <div style={{marginBottom: 12}}>
                <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#1565c0', fontSize: 13}}>Your UPI ID</label>
                <input value={upiId} onChange={(e) => setUpiId(e.target.value)} style={{width: '100%', padding: 12, border: '1px solid #1976d2', borderRadius: 10, fontSize: 14, background: 'white', boxSizing: 'border-box'}} placeholder="yourname@ybl or yourname@oksbi" />
              </div>
              <p style={{fontSize: 11, color: '#666', marginBottom: 0}}>Examples: ram@ybl, payable@yesbank, 9876543210@upi</p>
            </div>
          )}

          {paymentMode === 'own_cashfree' && (
            <div style={{background: '#e8f5e9', borderRadius: 10, padding: 16}}>
              <p style={{fontWeight: 'bold', color: '#2e7d32', marginBottom: 10, fontSize: 14}}>💰 Your Own Cashfree Account</p>
              <p style={{fontSize: 12, color: '#2e7d32', marginBottom: 12}}>Get paid directly to your Cashfree account.</p>
              
              <div style={{marginBottom: 12}}>
                <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#2e7d32', fontSize: 13}}>Cashfree App ID</label>
                <input value={cashfreeAppId} onChange={(e) => setCashfreeAppId(e.target.value)} style={{width: '100%', padding: 12, border: '1px solid #22c55e', borderRadius: 10, fontSize: 14, background: 'white', boxSizing: 'border-box'}} placeholder="Your Cashfree App ID (e.g., TEST...)" />
              </div>
              
              <div style={{marginBottom: 12}}>
                <label style={{display: 'block', marginBottom: 4, fontWeight: 'bold', color: '#2e7d32', fontSize: 13}}>Cashfree Secret Key</label>
                <input type="password" value={cashfreeSecret} onChange={(e) => setCashfreeSecret(e.target.value)} style={{width: '100%', padding: 12, border: '1px solid #22c55e', borderRadius: 10, fontSize: 14, background: 'white', boxSizing: 'border-box'}} placeholder="cfsk_ma_test_..." />
              </div>
              
              <div style={{background: '#c8e6c9', borderRadius: 8, padding: 12, marginTop: 12}}>
                <p style={{fontSize: 11, color: '#2e7d32', marginBottom: 6}}><strong>How to get Cashfree credentials:</strong></p>
                <ol style={{fontSize: 11, color: '#2e7d32', margin: 0, paddingLeft: 16, lineHeight: 1.6}}>
                  <li>Go to <a href="https://www.cashfree.com" target="_blank" style={{color: '#1b5e20'}}>cashfree.com</a> and sign up</li>
                  <li>Get sandbox credentials from Dashboard → Developers</li>
                  <li>Copy App ID and Secret Key here</li>
                </ol>
              </div>
            </div>
          )}
          
          {paymentMode === 'platform' && (
            <div style={{background: '#fff3cd', borderRadius: 10, padding: 16}}>
              <p style={{fontWeight: 'bold', color: '#856404', marginBottom: 10, fontSize: 14}}>🏦 Platform Payment Gateway</p>
              <p style={{fontSize: 12, color: '#856404', marginBottom: 10}}>Payments processed by platform. Platform settles to your account.</p>
              <p style={{fontSize: 11, color: '#666', marginBottom: 0}}>Available soon.</p>
            </div>
          )}
          
          <button onClick={handleSaveUPI} disabled={saving} style={{background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: 14, marginTop: 16}}>
            {saving ? 'Saving...' : '💾 Save Payment Settings'}
          </button>
        </div>

        <div style={{background: '#fffbeb', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
          <h2 style={{fontSize: 16, fontWeight: 'bold', marginBottom: 12}}>🔗 Your Store Link</h2>
          
          <div style={{background: '#fff', borderRadius: 10, padding: 14, marginBottom: 12}}>
            <p style={{fontSize: 12, color: '#888', marginBottom: 4}}>Share this URL with customers:</p>
            <code style={{fontSize: 14, fontWeight: 'bold', color: '#ff6b35', wordBreak: 'break-all'}}>
              {window.location.origin}/{restaurant?.slug || 'your-store'}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
