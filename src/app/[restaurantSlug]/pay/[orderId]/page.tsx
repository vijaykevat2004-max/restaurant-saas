import { prisma } from '@/lib/prisma'
import PaymentClient from './PaymentClient'

interface PageProps {
  params: Promise<{ restaurantSlug: string; orderId: string }>
}

export default async function PayPage({ params }: PageProps) {
  const { restaurantSlug, orderId } = await params
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: { id: true, name: true, logo: true, upiId: true, razorpayKeyId: true, razorpayKeySecret: true }
  })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true, total: true, status: true, paymentStatus: true, customerName: true }
  })

  if (!restaurant || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>❌ Order Not Found</h1>
          <p style={{ color: '#666' }}>This payment link is invalid or expired.</p>
        </div>
      </div>
    )
  }

  if (order.paymentStatus === 'PAID') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#4caf50', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 40, color: 'white' }}>✓</span>
          </div>
          <h1 style={{ fontSize: 24, marginBottom: 8, color: '#22c55e' }}>Already Paid!</h1>
          <p style={{ color: '#666', marginBottom: 8 }}>Order #{order.orderNumber}</p>
          <p style={{ fontSize: 24, fontWeight: 'bold', color: '#d32f2f' }}>₹{order.total}</p>
        </div>
      </div>
    )
  }

  return <PaymentClient restaurant={restaurant} order={order} />
}
