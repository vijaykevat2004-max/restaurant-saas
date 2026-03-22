'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  subtotal: number
  tax: number
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  paymentMethod: string | null
  paymentStatus: string | null
  notes: string | null
  createdAt: string
  items: { quantity: number; price: number; menuItemName: string }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const loadOrders = () => {
    fetch('/api/all-orders').then(r => r.json()).then(d => { setOrders(d); setLoading(false) })
  }

  useEffect(() => { loadOrders() }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status})})
    loadOrders()
    setSelectedOrder(null)
  }

  const verifyPayment = async (orderId: string) => {
    await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ orderId, verified: true })
    })
    loadOrders()
    setSelectedOrder(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT': return '#f59e0b'
      case 'PENDING': return '#3b82f6'
      case 'PREPARING': return '#f59e0b'
      case 'READY': return '#22c55e'
      case 'COMPLETED': return '#6b7280'
      case 'CANCELLED': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT': return '⏳'
      case 'PENDING': return '📋'
      case 'PREPARING': return '👨‍🍳'
      case 'READY': return '✅'
      case 'COMPLETED': return '🎉'
      case 'CANCELLED': return '❌'
      default: return '📋'
    }
  }

  const counts = {
    all: orders.length,
    AWAITING_PAYMENT: orders.filter(o => o.status === 'AWAITING_PAYMENT').length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    PREPARING: orders.filter(o => o.status === 'PREPARING').length,
    READY: orders.filter(o => o.status === 'READY').length,
    COMPLETED: orders.filter(o => o.status === 'COMPLETED').length
  }

  const statusFilters = ['all', 'AWAITING_PAYMENT', 'PENDING', 'PREPARING', 'READY', 'COMPLETED']
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div>
      <Navbar />
      <div style={{padding: 24, maxWidth: 1200, margin: '0 auto'}}>
        <h1 style={{fontSize: 28, fontWeight: 'bold', marginBottom: 8}}>Orders</h1>
        <p style={{color: '#666', marginBottom: 24}}>{orders.length} total orders • {counts.AWAITING_PAYMENT} awaiting payment</p>

        <div style={{display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap'}}>
          {statusFilters.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', 
              fontWeight: 'bold', background: filter === s ? '#f97316' : '#e5e7eb', 
              color: filter === s ? 'white' : '#374151'
            }}>
              {s === 'all' ? 'All' : s === 'AWAITING_PAYMENT' ? '⏳ Awaiting Payment' : s} ({counts[s as keyof typeof counts] || 0})
            </button>
          ))}
        </div>

        {loading ? <div style={{textAlign: 'center', padding: 40}}>Loading...</div> : filtered.length === 0 ? (
          <div style={{textAlign: 'center', padding: 60, background: 'white', borderRadius: 16}}>
            <div style={{fontSize: 48}}>📋</div>
            <div style={{fontSize: 18, color: '#666', marginTop: 12}}>No orders found</div>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {filtered.map(order => (
              <div key={order.id} style={{background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `6px solid ${getStatusColor(order.status)}`}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16}}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                      <span style={{fontSize: 28, fontWeight: 'bold'}}>#{order.orderNumber}</span>
                      <span style={{padding: '6px 16px', borderRadius: 20, background: getStatusColor(order.status) + '20', color: getStatusColor(order.status), fontWeight: 'bold'}}>
                        {getStatusIcon(order.status)} {order.status === 'AWAITING_PAYMENT' ? 'Awaiting Payment' : order.status}
                      </span>
                    </div>
                    <p style={{color: '#666', marginTop: 8}}>
                      <strong>{order.customerName}</strong> {order.customerPhone && `• ${order.customerPhone}`}
                      <br/>
                      <span style={{fontSize: 13}}>{new Date(order.createdAt).toLocaleString()}</span>
                    </p>
                    {order.notes && <p style={{color: '#f59e0b', marginTop: 8, fontSize: 14, background: '#fffbeb', padding: '8px 12px', borderRadius: 6}}>📝 {order.notes}</p>}
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: 28, fontWeight: 'bold', color: '#f97316'}}>₹{order.total}</div>
                    <div style={{fontSize: 13, color: '#888', marginTop: 4}}>
                      {order.paymentMethod && `Pay: ${order.paymentMethod}`}
                      {order.paymentStatus && order.paymentStatus !== 'PENDING' && ` • ${order.paymentStatus}`}
                    </div>
                  </div>
                </div>

                <div style={{marginBottom: 16}}>
                  <h4 style={{fontSize: 14, color: '#888', marginBottom: 8}}>Items:</h4>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {order.items?.map((item, i) => (
                      <span key={i} style={{background: '#f3f4f6', padding: '6px 14px', borderRadius: 20, fontSize: 14}}>
                        {item.quantity}x {item.menuItemName} - ₹{item.price * item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                  {order.status === 'AWAITING_PAYMENT' && (
                    <>
                      <button onClick={() => verifyPayment(order.id)} style={{background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
                        ✓ Verify & Accept Payment
                      </button>
                      <button onClick={() => updateStatus(order.id, 'CANCELLED')} style={{background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer'}}>
                        Cancel Order
                      </button>
                    </>
                  )}
                  {order.status === 'PENDING' && (
                    <button onClick={() => updateStatus(order.id, 'PREPARING')} style={{background: '#f59e0b', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
                      👨‍🍳 Start Preparing
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button onClick={() => updateStatus(order.id, 'READY')} style={{background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
                      ✅ Mark Ready
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button onClick={() => updateStatus(order.id, 'COMPLETED')} style={{background: '#6b7280', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
                      🎉 Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
