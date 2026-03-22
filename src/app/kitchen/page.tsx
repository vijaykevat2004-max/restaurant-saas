'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

interface OrderItem {
  id: string
  quantity: number
  menuItem: { name: string }
}

interface Order {
  id: string
  orderNumber: number
  status: string
  customerName: string | null
  createdAt: string
  items: OrderItem[]
  notes?: string
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const loadOrders = () => {
    fetch('/api/kitchen').then(r => r.json()).then(d => { setOrders(d); setLoading(false) }).catch(e => { console.error(e); setLoading(false) })
  }
  useEffect(() => { loadOrders(); const interval = setInterval(loadOrders, 3000); return () => clearInterval(interval) }, [])
  const updateStatus = async (id: string, newStatus: string) => {
    await fetch('/api/orders/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
    loadOrders()
  }
  const pending = orders.filter(o => o.status === 'PENDING')
  const preparing = orders.filter(o => o.status === 'PREPARING')
  const ready = orders.filter(o => o.status === 'READY')
  const getMinutes = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  return (
    <div style={{background: '#1a1a2e', minHeight: '100vh', color: 'white'}}>
      <Navbar />
      <div style={{padding: 20}}>
        <h1 style={{fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#fff'}}>Kitchen Display</h1>
        {loading ? <div style={{textAlign: 'center', padding: 60, fontSize: 24}}>Loading...</div> : orders.length === 0 ? (
          <div style={{textAlign: 'center', padding: 60, background: '#16213e', borderRadius: 16}}>
            <div style={{fontSize: 64, marginBottom: 16}}>No orders</div>
            <div style={{fontSize: 24, color: '#aaa'}}>Waiting for orders...</div>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20}}>
            <div><div style={{background: '#e74c3c', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'center'}}><div style={{fontSize: 24, fontWeight: 'bold'}}>PENDING</div><div style={{fontSize: 18, opacity: 0.9}}>{pending.length} orders</div></div>
              {pending.map(order => (
                <div key={order.id} style={{background: '#16213e', borderRadius: 12, padding: 16, marginBottom: 12, borderLeft: '6px solid #e74c3c'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}><span style={{fontSize: 36, fontWeight: 'bold', color: '#e74c3c'}}>#{order.orderNumber}</span><div style={{textAlign: 'right'}}><div style={{fontSize: 16, color: getMinutes(order.createdAt) > 10 ? '#e74c3c' : '#888'}}>{getMinutes(order.createdAt)} min</div>{order.customerName && <div style={{fontSize: 14, color: '#888'}}>{order.customerName}</div>}</div></div>
                  <div style={{marginBottom: 12, background: '#0f3460', borderRadius: 8, padding: 12}}>{order.items.map((item, i) => <div key={i} style={{display: 'flex', gap: 10, marginBottom: 6, fontSize: 18}}><span style={{fontWeight: 'bold', color: '#e74c3c', minWidth: 40}}>{item.quantity}x</span><span>{item.menuItem?.name || 'Item'}</span></div>)}</div>
                  {order.notes && <div style={{fontSize: 14, color: '#f39c12', marginBottom: 12}}>Note: {order.notes}</div>}
                  <button onClick={() => updateStatus(order.id, 'PREPARING')} style={{width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 16, background: '#f39c12', color: 'white'}}>START COOKING</button>
                </div>
              ))}
            </div>
            <div><div style={{background: '#f39c12', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'center'}}><div style={{fontSize: 24, fontWeight: 'bold'}}>PREPARING</div><div style={{fontSize: 18, opacity: 0.9}}>{preparing.length} orders</div></div>
              {preparing.map(order => (
                <div key={order.id} style={{background: '#16213e', borderRadius: 12, padding: 16, marginBottom: 12, borderLeft: '6px solid #f39c12'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}><span style={{fontSize: 36, fontWeight: 'bold', color: '#f39c12'}}>#{order.orderNumber}</span><div style={{textAlign: 'right'}}><div style={{fontSize: 16, color: '#888'}}>{getMinutes(order.createdAt)} min</div>{order.customerName && <div style={{fontSize: 14, color: '#888'}}>{order.customerName}</div>}</div></div>
                  <div style={{marginBottom: 12, background: '#0f3460', borderRadius: 8, padding: 12}}>{order.items.map((item, i) => <div key={i} style={{display: 'flex', gap: 10, marginBottom: 6, fontSize: 18}}><span style={{fontWeight: 'bold', color: '#f39c12', minWidth: 40}}>{item.quantity}x</span><span>{item.menuItem?.name || 'Item'}</span></div>)}</div>
                  <button onClick={() => updateStatus(order.id, 'READY')} style={{width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 16, background: '#27ae60', color: 'white'}}>READY TO SERVE</button>
                </div>
              ))}
            </div>
            <div><div style={{background: '#27ae60', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'center'}}><div style={{fontSize: 24, fontWeight: 'bold'}}>READY</div><div style={{fontSize: 18, opacity: 0.9}}>{ready.length} orders</div></div>
              {ready.map(order => (
                <div key={order.id} style={{background: '#16213e', borderRadius: 12, padding: 16, marginBottom: 12, borderLeft: '6px solid #27ae60'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}><span style={{fontSize: 36, fontWeight: 'bold', color: '#27ae60'}}>#{order.orderNumber}</span><div style={{textAlign: 'right'}}>{order.customerName && <div style={{fontSize: 16, color: '#27ae60', fontWeight: 'bold'}}>{order.customerName}</div>}</div></div>
                  <div style={{marginBottom: 12, background: '#0f3460', borderRadius: 8, padding: 12}}>{order.items.map((item, i) => <div key={i} style={{display: 'flex', gap: 10, marginBottom: 6, fontSize: 18}}><span style={{fontWeight: 'bold', color: '#27ae60', minWidth: 40}}>{item.quantity}x</span><span>{item.menuItem?.name || 'Item'}</span></div>)}</div>
                  <button onClick={() => updateStatus(order.id, 'COMPLETED')} style={{width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 16, background: '#95a5a6', color: 'white'}}>COMPLETED</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
