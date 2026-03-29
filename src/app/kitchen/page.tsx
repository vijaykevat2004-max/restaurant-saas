'use client'
import { useEffect, useState, useRef } from 'react'
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
  orderType: string
  tableName: string | null
  customerName: string | null
  total: number
  createdAt: string
  items: OrderItem[]
  notes?: string
}

interface CashPopupProps {
  order: Order
  onClose: () => void
  onConfirm: (cashReceived: number) => void
}

function CashPopup({ order, onClose, onConfirm }: CashPopupProps) {
  const [amount, setAmount] = useState(Math.ceil(order.total))
  const [error, setError] = useState('')
  
  const handleSubmit = () => {
    if (amount < order.total) {
      setError('Amount must be at least ₹' + order.total)
      return
    }
    onConfirm(amount)
  }
  
  const change = amount - order.total

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '90%', color: '#333' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>💵 Cash Payment</h2>
        
        <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#666' }}>Order</span>
            <span style={{ fontWeight: 'bold' }}>#{order.orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#666' }}>Customer</span>
            <span>{order.customerName || 'Guest'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: 12 }}>
            <span>Total Due</span>
            <span style={{ color: '#d32f2f' }}>₹{order.total}</span>
          </div>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 'bold', color: '#666', display: 'block', marginBottom: 8 }}>Cash Received</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[100, 200, 500, 1000].map(val => (
              <button key={val} onClick={() => setAmount(val)} style={{
                flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ddd',
                background: amount === val ? '#d32f2f' : '#fff', color: amount === val ? '#fff' : '#333',
                fontWeight: 'bold', cursor: 'pointer'
              }}>₹{val}</button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{
              width: '100%', padding: 14, borderRadius: 8, border: '2px solid #ddd', fontSize: 18,
              fontWeight: 'bold', marginTop: 8, textAlign: 'center'
            }}
          />
        </div>
        
        {error && <div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 'bold' }}>{error}</div>}
        
        {change > 0 && (
          <div style={{ background: '#e8f5e9', borderRadius: 8, padding: 16, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Change to return</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4caf50' }}>₹{change}</div>
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={onClose} style={{ padding: 14, borderRadius: 8, border: '2px solid #ddd', background: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{ padding: 14, borderRadius: 8, border: 'none', background: '#4caf50', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cashPopup, setCashPopup] = useState<Order | null>(null)
  const audioRef = useRef<AudioContext | null>(null)

  const loadOrders = () => {
    fetch('/api/kitchen').then(r => r.json()).then(d => { 
      setOrders(d); 
      setLoading(false)
    }).catch(e => { console.error(e); setLoading(false) })
  }
  
  useEffect(() => { 
    loadOrders() 
    const interval = setInterval(loadOrders, 3000)
    return () => clearInterval(interval)
  }, [])
  
  const updateStatus = async (id: string, newStatus: string, cashReceived?: number) => {
    const body: Record<string, unknown> = { status: newStatus }
    if (cashReceived) {
      body.cashReceived = cashReceived
      body.cashChange = cashReceived - (orders.find(o => o.id === id)?.total || 0)
      body.paymentStatus = 'PAID'
    }
    await fetch('/api/orders/' + id, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(body) 
    })
    setCashPopup(null)
    loadOrders()
  }

  const pending = orders.filter(o => o.status === 'PENDING')
  const awaitingCash = orders.filter(o => o.status === 'AWAITING_CASH')
  const preparing = orders.filter(o => o.status === 'PREPARING')
  const ready = orders.filter(o => o.status === 'READY')
  const awaitingPayment = orders.filter(o => o.status === 'AWAITING_PAYMENT')
  
  const getMinutes = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  
  const OrderCard = ({ order, status }: { order: Order, status: string }) => {
    const isDineIn = order.orderType === 'DINE_IN'
    const borderColor = status === 'PENDING' ? '#e74c3c' : status === 'AWAITING_CASH' ? '#9b59b6' : status === 'PREPARING' ? '#f39c12' : status === 'AWAITING_PAYMENT' ? '#636e72' : '#27ae60'
    const bgColor = status === 'PENDING' ? '#e74c3c' : status === 'AWAITING_CASH' ? '#9b59b6' : status === 'PREPARING' ? '#f39c12' : status === 'AWAITING_PAYMENT' ? '#636e72' : '#27ae60'
    
    return (
      <div style={{ background: '#16213e', borderRadius: 12, padding: 16, marginBottom: 12, borderLeft: `6px solid ${borderColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 36, fontWeight: 'bold', color: borderColor }}>#{order.orderNumber}</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <span style={{ 
                background: isDineIn ? '#3498db' : '#95a5a6', 
                color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' 
              }}>
                {isDineIn ? '🍽️ DINE-IN' : '🥡 TAKEAWAY'}
              </span>
              {isDineIn && order.tableName && (
                <span style={{ background: '#3498db', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>
                  {order.tableName}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, color: getMinutes(order.createdAt) > 10 ? '#e74c3c' : '#888' }}>
              {getMinutes(order.createdAt)} min
            </div>
            {order.customerName && <div style={{ fontSize: 14, color: '#888' }}>{order.customerName}</div>}
          </div>
        </div>
        
        <div style={{ marginBottom: 12, background: '#0f3460', borderRadius: 8, padding: 12 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 18 }}>
              <span style={{ fontWeight: 'bold', color: borderColor, minWidth: 40 }}>{item.quantity}x</span>
              <span>{item.menuItem?.name || 'Item'}</span>
            </div>
          ))}
        </div>
        
        {order.notes && (
          <div style={{ fontSize: 14, color: '#f39c12', marginBottom: 12, fontStyle: 'italic' }}>
            📝 {order.notes}
          </div>
        )}
        
        {status === 'AWAITING_PAYMENT' && (
          <button onClick={async () => {
            await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                orderId: order.id, 
                paymentId: `manual_${Date.now()}`, 
                verified: true 
              })
            })
            loadOrders()
          }} style={{ 
            width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 14, background: '#25D366', color: 'white' 
          }}>✓ VERIFY PAYMENT</button>
        )}
        
        {status === 'PENDING' && (
          <button onClick={() => updateStatus(order.id, 'PREPARING')} style={{ 
            width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 16, background: '#f39c12', color: 'white' 
          }}>START COOKING</button>
        )}
        
        {status === 'AWAITING_CASH' && (
          <button onClick={() => setCashPopup(order)} style={{ 
            width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 16, background: '#9b59b6', color: 'white' 
          }}>💵 COLLECT CASH</button>
        )}
        
        {status === 'PREPARING' && (
          <button onClick={() => updateStatus(order.id, 'READY')} style={{ 
            width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 16, background: '#27ae60', color: 'white' 
          }}>READY TO SERVE</button>
        )}
        
        {status === 'READY' && (
          <button onClick={() => updateStatus(order.id, 'COMPLETED')} style={{ 
            width: '100%', padding: '14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 16, background: '#95a5a6', color: 'white' 
          }}>COMPLETED</button>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh', color: 'white' }}>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#fff' }}>Kitchen Display</h1>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, fontSize: 24 }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#16213e', borderRadius: 16 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>No orders</div>
            <div style={{ fontSize: 24, color: '#aaa' }}>Waiting for orders...</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20, overflowX: 'auto' }}>
            {/* Awaiting Payment Column */}
            <div>
              <div style={{ background: '#636e72', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>⏳ PAYMENT</div>
                <div style={{ fontSize: 18, opacity: 0.9 }}>{awaitingPayment.length} orders</div>
              </div>
              {awaitingPayment.map(order => <OrderCard key={order.id} order={order} status="AWAITING_PAYMENT" />)}
            </div>
            
            {/* Pending Column */}
            <div>
              <div style={{ background: '#e74c3c', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>PENDING</div>
                <div style={{ fontSize: 18, opacity: 0.9 }}>{pending.length} orders</div>
              </div>
              {pending.map(order => <OrderCard key={order.id} order={order} status="PENDING" />)}
            </div>
            
            {/* Awaiting Cash Column */}
            <div>
              <div style={{ background: '#9b59b6', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>💵 CASH</div>
                <div style={{ fontSize: 18, opacity: 0.9 }}>{awaitingCash.length} orders</div>
              </div>
              {awaitingCash.map(order => <OrderCard key={order.id} order={order} status="AWAITING_CASH" />)}
            </div>
            
            {/* Preparing Column */}
            <div>
              <div style={{ background: '#f39c12', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>PREPARING</div>
                <div style={{ fontSize: 18, opacity: 0.9 }}>{preparing.length} orders</div>
              </div>
              {preparing.map(order => <OrderCard key={order.id} order={order} status="PREPARING" />)}
            </div>
            
            {/* Ready Column */}
            <div>
              <div style={{ background: '#27ae60', padding: 16, borderRadius: 12, marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>READY</div>
                <div style={{ fontSize: 18, opacity: 0.9 }}>{ready.length} orders</div>
              </div>
              {ready.map(order => <OrderCard key={order.id} order={order} status="READY" />)}
            </div>
          </div>
        )}
      </div>
      
      {/* Cash Payment Popup */}
      {cashPopup && (
        <CashPopup 
          order={cashPopup} 
          onClose={() => setCashPopup(null)} 
          onConfirm={(cashReceived) => updateStatus(cashPopup.id, 'PREPARING', cashReceived)} 
        />
      )}
    </div>
  )
}
