import { prisma } from '@/lib/prisma'
import McDonaldsPayment from './McDonaldsPayment'

interface PageProps {
  params: Promise<{ restaurantSlug: string; orderId: string }>
}

export default async function PayPage({ params }: PageProps) {
  const { restaurantSlug, orderId } = await params
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    select: { id: true, name: true, logo: true, upiId: true, phone: true }
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

  return <McDonaldsPayment restaurant={restaurant} order={order} />
}
