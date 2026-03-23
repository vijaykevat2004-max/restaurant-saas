'use client'
import { useEffect, useState, useRef } from 'react'
import Navbar from '@/components/Navbar'

interface MenuItem { id: string; name: string; description: string; price: number; image: string | null; categoryId: string }
interface Category { id: string; name: string; menuItems: MenuItem[] }

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [debug, setDebug] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', price: '', description: '', categoryId: '' })
  const [categoryName, setCategoryName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadData() }, [])
  
  useEffect(() => { console.log('Categories updated:', categories) }, [categories])

  async function loadData() {
    try {
      const res = await fetch('/api/menu')
      const data = await res.json()
      setDebug({ apiStatus: res.status, data })
      console.log('Menu API response:', res.status, data)
      if (!res.ok) {
        window.alert('Error: ' + (data.error || 'Failed to load menu'))
      }
      setCategories(data.categories || [])
    } catch (e) { 
      console.error(e)
      setDebug({ error: String(e) })
    }
    setLoading(false)
  }

  function handleEdit(item: MenuItem) {
    setEditing(item)
    setForm({name: item.name, price: item.price.toString(), description: item.description || '', categoryId: item.categoryId})
    setImagePreview(item.image || '')
    setImageFile(null)
    setShowModal(true)
  }

  function handleAdd(categoryId?: string) {
    setEditing(null)
    setForm({name: '', price: '', description: '', categoryId: categoryId || (categories[0]?.id || '')})
    setImagePreview('')
    setImageFile(null)
    setShowModal(true)
  }

  function handleAddCategory() {
    setEditingCategory(null)
    setCategoryName('')
    setShowCategoryModal(true)
  }

  function handleEditCategory(cat: Category) {
    setEditingCategory(cat)
    setCategoryName(cat.name)
    setShowCategoryModal(true)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleSave() {
    const price = parseFloat(form.price)
    if (!form.name || !form.price) { 
      window.alert('Please fill name and price')
      return 
    }
    if (!form.categoryId) {
      window.alert('Please select a category from the dropdown')
      return
    }
    
    console.log('Saving item:', { name: form.name, price, categoryId: form.categoryId })
    setDebug({ saving: true, form: { name: form.name, price, categoryId: form.categoryId } })
    
    let imageUrl = imagePreview
    if (imageFile) {
      const formData = new FormData()
      formData.append('file', imageFile)
      const uploadRes = await fetch('/api/upload', {method: 'POST', body: formData})
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }
    }

    try {
      if (editing) {
        const res = await fetch('/api/menu/' + editing.id, {method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name: form.name, description: form.description, price, image: imageUrl || null})})
        if (!res.ok) {
          const data = await res.json()
          window.alert('Error updating: ' + (data.error || 'Failed'))
          return
        }
        window.alert('Item updated successfully!')
      } else {
        const res = await fetch('/api/menu', {
          method: 'POST', 
          headers: {'Content-Type':'application/json'}, 
          body: JSON.stringify({
            name: form.name, 
            description: form.description, 
            price, 
            image: imageUrl || null, 
            categoryId: form.categoryId
          })
        })
        const data = await res.json()
        console.log('Add item response:', res.status, data)
        
        if (!res.ok) {
          window.alert('Error adding: ' + (data.error || 'Failed') + ' (Status: ' + res.status + ')')
          return
        }
        window.alert('Item added successfully!')
      }
      setShowModal(false)
      loadData()
    } catch (e) {
      console.error('Error:', e)
      window.alert('Something went wrong: ' + e)
    }
  }

  async function handleSaveCategory() {
    if (!categoryName.trim()) { window.alert('Please enter category name'); return }
    
    if (editingCategory) {
      await fetch('/api/menu/category/' + editingCategory.id, {method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name: categoryName})})
    } else {
      await fetch('/api/menu/category', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name: categoryName})})
    }
    setShowCategoryModal(false)
    loadData()
  }

  async function handleDelete(id: string) {
    if (window.confirm('Delete this item?')) { await fetch('/api/menu/' + id, {method: 'DELETE'}); loadData() }
  }

  async function handleDeleteCategory(id: string) {
    if (window.confirm('Delete this category and all its items?')) { 
      await fetch('/api/menu/category/' + id, {method: 'DELETE'}); 
      loadData() 
    }
  }

  if (loading) return (<div><Navbar /><div style={{padding: 20}}>Loading...</div></div>)

  return (
    <div>
      <Navbar />
      <div style={{padding: 24, maxWidth: 1200, margin: '0 auto'}}>
        <h1 style={{fontSize: 28, fontWeight: 'bold', marginBottom: 8}}>Menu Management</h1>
        <p style={{color: '#666', marginBottom: 24}}>Manage your restaurant menu</p>
        
        {/* Debug Info */}
        {debug && (
          <div style={{background: '#f0f0f0', padding: 16, marginBottom: 16, borderRadius: 8, fontSize: 12}}>
            <strong>Debug:</strong> {JSON.stringify(debug)}
          </div>
        )}
        
        <div style={{display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap'}}>
          <button onClick={handleAddCategory} style={{background: '#8b5cf6', color: 'white', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: 'none', fontWeight: 'bold'}}>+ Add Category</button>
          <button onClick={() => handleAdd()} style={{background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: 'none', fontWeight: 'bold'}}>+ Add Menu Item</button>
        </div>

        {categories.length === 0 ? (
          <div style={{textAlign: 'center', padding: 60, background: 'white', borderRadius: 16}}>
            <div style={{fontSize: 64, marginBottom: 16}}>📋</div>
            <h2 style={{fontSize: 20, marginBottom: 8}}>No categories yet</h2>
            <p style={{color: '#666', marginBottom: 24}}>Start by adding a category for your menu</p>
            <button onClick={handleAddCategory} style={{background: '#f97316', color: 'white', padding: '14px 28px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Add First Category</button>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} style={{marginBottom: 32}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                <h2 style={{fontSize: 22, fontWeight: 'bold', color: '#f97316'}}>{cat.name}</h2>
                <div style={{display: 'flex', gap: 8}}>
                  <button onClick={() => handleAdd(cat.id)} style={{background: '#22c55e', color: 'white', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13}}>+ Add Item</button>
                  <button onClick={() => handleEditCategory(cat)} style={{background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13}}>Edit</button>
                  <button onClick={() => handleDeleteCategory(cat.id)} style={{background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13}}>Delete</button>
                </div>
              </div>
              
              {cat.menuItems.length === 0 ? (
                <div style={{textAlign: 'center', padding: 30, background: '#f9f9f9', borderRadius: 12, marginBottom: 16}}>
                  <p style={{color: '#888'}}>No items in this category</p>
                  <button onClick={() => handleAdd(cat.id)} style={{marginTop: 12, background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13}}>+ Add First Item</button>
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16}}>
                  {cat.menuItems.map(item => (
                    <div key={item.id} style={{border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: 'white'}}>
                      <div style={{height: 140, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        {item.image ? <img src={item.image} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <span style={{fontSize: 48, color: '#d1d5db'}}>🍔</span>}
                      </div>
                      <div style={{padding: 14}}>
                        <h3 style={{fontSize: 16, fontWeight: 'bold', marginBottom: 4}}>{item.name}</h3>
                        <p style={{fontSize: 13, color: '#666', marginBottom: 8, minHeight: 36}}>{item.description || 'No description'}</p>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{fontSize: 18, fontWeight: 'bold', color: '#f97316'}}>₹{item.price}</span>
                          <div style={{display: 'flex', gap: 4}}>
                            <button onClick={() => handleEdit(item)} style={{background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12}}>Edit</button>
                            <button onClick={() => handleDelete(item.id)} style={{background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12}}>Del</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {showModal && (
          <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
            <div style={{background: 'white', padding: 32, borderRadius: 16, width: 500, maxHeight: '90vh', overflow: 'auto'}}>
              <h2 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24}}>{editing ? 'Edit' : 'Add'} Menu Item</h2>
              
              <div style={{marginBottom: 16}}>
                <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Category</label>
                <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 16}}>
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              
              <div style={{marginBottom: 16}}><label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Item Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8}} placeholder="e.g., Classic Burger" /></div>
              <div style={{marginBottom: 16}}><label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Price (₹)</label><input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8}} placeholder="149" /></div>
              <div style={{marginBottom: 16}}><label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8}} placeholder="Describe the item..." /></div>
              <div style={{marginBottom: 24}}>
                <label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8}} />
                {imagePreview && <img src={imagePreview} alt="Preview" style={{marginTop: 12, width: '100%', height: 150, objectFit: 'cover', borderRadius: 8}} />}
              </div>
              <div style={{display: 'flex', gap: 12}}>
                <button onClick={() => setShowModal(false)} style={{flex: 1, padding: '14px 20px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer'}}>Cancel</button>
                <button onClick={handleSave} style={{flex: 1, padding: '14px 20px', background: '#22c55e', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>{editing ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
            <div style={{background: 'white', padding: 32, borderRadius: 16, width: 400}}>
              <h2 style={{fontSize: 24, fontWeight: 'bold', marginBottom: 24}}>{editingCategory ? 'Edit' : 'Add'} Category</h2>
              <div style={{marginBottom: 24}}><label style={{display: 'block', marginBottom: 6, fontWeight: 'bold'}}>Category Name</label><input value={categoryName} onChange={e => setCategoryName(e.target.value)} style={{width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8}} placeholder="e.g., Burgers, Drinks" /></div>
              <div style={{display: 'flex', gap: 12}}>
                <button onClick={() => setShowCategoryModal(false)} style={{flex: 1, padding: '14px 20px', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer'}}>Cancel</button>
                <button onClick={handleSaveCategory} style={{flex: 1, padding: '14px 20px', background: '#22c55e', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>{editingCategory ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
