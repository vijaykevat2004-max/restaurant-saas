'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

interface Staff {
  id: string
  name: string
  email: string
  role: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'COOK' })
  const [error, setError] = useState('')

  useEffect(() => { loadStaff() }, [])

  async function loadStaff() {
    try {
      const res = await fetch('/api/staff')
      const data = await res.json()
      setStaff(data.users || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleAdd() {
    if (!form.name || !form.email || !form.password) {
      setError('All fields required')
      return
    }

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (res.ok) {
        setShowModal(false)
        setForm({ name: '', email: '', password: '', role: 'COOK' })
        setError('')
        loadStaff()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add staff')
      }
    } catch (e) {
      setError('Failed to add staff')
    }
  }

  async function handleDelete(id: string) {
    if (window.confirm('Delete this staff member?')) {
      await fetch('/api/staff/' + id, { method: 'DELETE' })
      loadStaff()
    }
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      RESTAURANT_ADMIN: '#8b5cf6',
      COOK: '#f97316',
      CASHIER: '#22c55e',
      CUSTOMER: '#6b7280'
    }
    const labels: Record<string, string> = {
      RESTAURANT_ADMIN: 'Admin',
      COOK: 'Cook',
      CASHIER: 'Cashier',
      CUSTOMER: 'Customer'
    }
    return { color: colors[role] || '#6b7280', label: labels[role] || role }
  }

  return (
    <div>
      <Navbar />
      <div style={{padding: 24, maxWidth: 1000, margin: '0 auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
          <h1 style={{fontSize: 28, fontWeight: 'bold'}}>Staff Management</h1>
        </div>
        <p style={{color: '#666', marginBottom: 24}}>Manage your restaurant team members</p>

        {error && (
          <div style={{background: '#fef2f2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 20}}>
            {error}
          </div>
        )}

        <div style={{background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 24}}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '16px 20px', background: '#f3f4f6', fontWeight: 'bold', borderBottom: '1px solid #e5e7eb'}}>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Actions</div>
          </div>
          
          {staff.map((member, i) => {
            const { color, label } = getRoleBadge(member.role)
            return (
              <div key={member.id} style={{display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '16px 20px', borderBottom: i < staff.length - 1 ? '1px solid #e5e7eb' : 'none', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <div style={{width: 40, height: 40, borderRadius: '50%', background: '#f97316', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18}}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{fontWeight: 'bold'}}>{member.name}</span>
                </div>
                <div style={{color: '#666'}}>{member.email}</div>
                <div><span style={{background: color + '20', color: color, padding: '4px 12px', borderRadius: 16, fontSize: 13, fontWeight: 'bold'}}>{label}</span></div>
                <div>
                  {member.role !== 'RESTAURANT_ADMIN' && (
                    <button onClick={() => handleDelete(member.id)} style={{background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12}}>Remove</button>
                  )}
                </div>
              </div>
            )
          })}
          
          {staff.length === 0 && (
            <div style={{padding: 40, textAlign: 'center', color: '#666'}}>
              No staff members yet
            </div>
          )}
        </div>

        <button onClick={() => setShowModal(true)} style={{background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 14}}>
          + Add Staff Member
        </button>

        {showModal && (
          <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
            <div style={{background: 'white', padding: 32, borderRadius: 16, width: 450}}>
              <h2 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24}}>Add Staff Member</h2>
              
              <div style={{marginBottom: 16}}>
                <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8}} placeholder="John Doe" />
              </div>
              
              <div style={{marginBottom: 16}}>
                <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8}} placeholder="john@restaurant.com" />
              </div>
              
              <div style={{marginBottom: 16}}>
                <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8}} placeholder="Min 6 characters" />
              </div>
              
              <div style={{marginBottom: 24}}>
                <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16}}>
                  <option value="COOK">Cook</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="RESTAURANT_ADMIN">Admin</option>
                </select>
              </div>
              
              <div style={{display: 'flex', gap: 12}}>
                <button onClick={() => { setShowModal(false); setError('') }} style={{flex: 1, padding: '14px 20px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer'}}>Cancel</button>
                <button onClick={handleAdd} style={{flex: 1, padding: '14px 20px', background: '#22c55e', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Add Staff</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
