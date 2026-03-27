import { prisma } from '@/lib/prisma'
import McDonaldsPayment from './McDonaldsPayment'

interface PageProps {
  params: Promise<{ restaurantSlug: string; orderId: string }>
}

export default async function PayPage({ params }: PageProps) {
  const { restaurantSlug, orderId } = await params
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: { name: true, logo: true, upiId: true }
  })

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true, total: true, paymentStatus: true }
  })

  if (!restaurant || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>❌ Order Not Found</h1>
          <p style={{ color: '#666' }}>This payment link is invalid.</p>
        </div>
      </div>
    )
  }

  if (order.paymentStatus === 'PAID') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#22c55e', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 40, color: 'white' }}>✓</span>
          </div>
          <h1 style={{ fontSize: 24, color: '#22c55e', marginBottom: 8 }}>Already Paid!</h1>
          <p style={{ color: '#666', marginBottom: 8 }}>Order #{order.orderNumber}</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#d32f2f' }}>₹{order.total}</p>
        </div>
      </div>
    )
  }

  return (
    <McDonaldsPayment 
      restaurantName={restaurant.name}
      restaurantLogo={restaurant.logo}
      upiId={restaurant.upiId || 'yourname@upi'}
      amount={order.total}
      orderNumber={order.orderNumber}
      orderId={order.id}
      onSuccess={() => {}}
    />
  )
}
