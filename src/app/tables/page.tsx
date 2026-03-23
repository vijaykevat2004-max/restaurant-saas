'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

interface Table {
  id: string
  number: number
  name: string | null
  isOccupied: boolean
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [form, setForm] = useState({ number: '', name: '' })
  const [occupiedTables, setOccupiedTables] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/all-orders')
      ])
      
      const tablesData = await tablesRes.json()
      const ordersData = await ordersRes.json()
      
      const orders = Array.isArray(ordersData) ? ordersData : []
      const activeTables = orders
        .filter((o: any) => ['PENDING', 'PREPARING', 'READY', 'AWAITING_CASH'].includes(o.status) && o.orderType === 'DINE_IN' && o.tableId)
        .map((o: any) => o.tableId)
      
      setOccupiedTables(activeTables)
      
      const tablesWithStatus = (tablesData.tables || []).map((t: any) => ({
        ...t,
        isOccupied: activeTables.includes(t.id)
      }))
      
      setTables(tablesWithStatus)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    const number = parseInt(form.number)
    if (!number) {
      window.alert('Please enter table number')
      return
    }

    try {
      if (editingTable) {
        await fetch(`/api/tables?id=${editingTable.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name || `Table ${number}` })
        })
      } else {
        await fetch('/api/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number, name: form.name || `Table ${number}` })
        })
      }
      setShowModal(false)
      setForm({ number: '', name: '' })
      setEditingTable(null)
      loadData()
    } catch (e) {
      window.alert('Failed to save table')
    }
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setForm({ number: table.number.toString(), name: table.name || '' })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this table?')) return
    try {
      await fetch(`/api/tables?id=${id}`, { method: 'DELETE' })
      loadData()
    } catch (e) {
      window.alert('Failed to delete table')
    }
  }

  const toggleOccupied = async (table: Table) => {
    if (!table.isOccupied) {
      window.alert('Table is already free. Mark orders from the Orders page.')
      return
    }
    await loadData()
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>Table Management</h1>
            <p style={{ color: '#666', marginTop: 4 }}>Manage your restaurant tables</p>
          </div>
          <button 
            onClick={() => { setEditingTable(null); setForm({ number: '', name: '' }); setShowModal(true) }}
            style={{ background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 10, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + Add Table
          </button>
        </div>

        {tables.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🪑</div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>No tables yet</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>Add tables for dine-in customers</p>
            <button 
              onClick={() => setShowModal(true)}
              style={{ background: '#f97316', color: 'white', padding: '14px 28px', borderRadius: 10, border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Add First Table
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {tables.map(table => (
              <div 
                key={table.id} 
                style={{ 
                  background: 'white', 
                  borderRadius: 16, 
                  padding: 20, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: table.isOccupied ? '3px solid #ef4444' : '3px solid #22c55e'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>
                      {table.isOccupied ? '🪑' : '🪑'}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>{table.name || `Table ${table.number}`}</h3>
                    <p style={{ color: '#666', fontSize: 14, margin: 0 }}>#{table.number}</p>
                  </div>
                  <div 
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: 20, 
                      fontSize: 12, 
                      fontWeight: 'bold',
                      background: table.isOccupied ? '#fee2e2' : '#dcfce7',
                      color: table.isOccupied ? '#dc2626' : '#16a34a'
                    }}
                  >
                    {table.isOccupied ? '🔴 Occupied' : '🟢 Free'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => handleEdit(table)}
                    style={{ flex: 1, padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(table.id)}
                    style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, background: '#fffbeb', borderRadius: 12, padding: 16 }}>
          <p style={{ color: '#92400e', fontSize: 14, margin: 0 }}>
            💡 Tables show as "Occupied" when they have active dine-in orders. Tables automatically free up when orders are completed.
          </p>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: 400 }}>
            <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
              {editingTable ? 'Edit Table' : 'Add Table'}
            </h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Table Number *</label>
              <input 
                type="number" 
                value={form.number}
                onChange={(e) => setForm({...form, number: e.target.value})}
                disabled={!!editingTable}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16, background: editingTable ? '#f5f5f5' : 'white' }}
                placeholder="1"
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Table Name (optional)</label>
              <input 
                type="text" 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16 }}
                placeholder="e.g., Window Seat, VIP"
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '14px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                style={{ flex: 1, padding: '14px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
              >
                {editingTable ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
