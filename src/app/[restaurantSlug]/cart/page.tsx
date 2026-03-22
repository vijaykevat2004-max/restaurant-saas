import { prisma } from '@/lib/prisma'
import CartPageClient from './CartPageClient'

interface PageProps {
  params: Promise<{ restaurantSlug: string }>
}

export default async function CartPage({ params }: PageProps) {
  const { restaurantSlug } = await params
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug }
  })

  if (!restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Restaurant Not Found</h1>
        </div>
      </div>
    )
  }

  return <CartPageClient restaurant={restaurant} />
}
