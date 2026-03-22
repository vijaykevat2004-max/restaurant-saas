'use client'
import { useEffect, useState } from 'react'
export default function MenuFullPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', price: '', description: '' })
  useEffect(() => { loadData() }, [])
  async function loadData() {
    try {
      const res = await fetch('/api/menu')
      const data = await res.json()
      setItems(data.categories?.flatMap((c: any) => c.menuItems) || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }
  function handleEdit(item: any) { window.alert('Edit: ' + item.name); setEditing(item); setForm({name: item.name, price: item.price.toString(), description: item.description}); setShowModal(true) }
  async function handleDelete(id: string) { if (window.confirm('Delete?')) { await fetch('/api/menu/' + id, {method: 'DELETE'}); loadData() } }
  async function handleSave() { await fetch('/api/menu/' + editing.id, {method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name: form.name, description: form.description, price: parseFloat(form.price)})}); setShowModal(false); loadData() }
  if (loading) return <div style={{padding: 20}}>Loading...</div>
  return (
    <div style={{padding: 20}}>
      <h1 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 20}}>Menu ({items.length} items)</h1>
      <button onClick={() => {setEditing({id: 'new'}); setForm({name:'',price:'',description:''}); setShowModal(true)}} style={{background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: 8, marginBottom: 20}}>+ Add Item</button>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead><tr style={{background: '#f3f4f6'}}><th style={{border: '1px solid #ddd', padding: 10, textAlign: 'left'}}>Name</th><th style={{border: '1px solid #ddd', padding: 10}}>Price</th><th style={{border: '1px solid #ddd', padding: 10}}>Actions</th></tr></thead>
        <tbody>{items.map(item => <tr key={item.id}><td style={{border: '1px solid #ddd', padding: 10}}>{item.name}</td><td style={{border: '1px solid #ddd', padding: 10}}>Rs.{item.price}</td><td style={{border: '1px solid #ddd', padding: 10}}><button onClick={() => handleEdit(item)} style={{background: '#3b82f6', color: 'white', padding: '5px 15px', borderRadius: 4, marginRight: 10}}>Edit</button><button onClick={() => handleDelete(item.id)} style={{background: '#ef4444', color: 'white', padding: '5px 15px', borderRadius: 4}}>Delete</button></td></tr>)}</tbody>
      </table>
      {showModal && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{background: 'white', padding: 30, borderRadius: 8, width: 400}}><h2 style={{marginBottom: 20}}>{editing?.id === 'new' ? 'Add' : 'Edit'} Item</h2><input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 4}}/><input placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 4}}/><textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{width: '100%', padding: 10, marginBottom: 20, border: '1px solid #ddd', borderRadius: 4}}/><button onClick={() => setShowModal(false)} style={{padding: '10px 20px', marginRight: 10, border: '1px solid #ddd', borderRadius: 4}}>Cancel</button><button onClick={handleSave} style={{padding: '10px 20px', background: '#22c55e', color: 'white', borderRadius: 4}}>Save</button></div></div>}
    </div>
  )
}
