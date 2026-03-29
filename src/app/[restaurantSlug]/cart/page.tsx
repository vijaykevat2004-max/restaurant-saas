import { prisma } from '@/lib/prisma'
import CartPageClient from './CartPageClient'

interface PageProps {
  params: Promise<{ restaurantSlug: string }>
}

export default async function CartPage({ params }: PageProps) {
  const { restaurantSlug } = await params
  
  let restaurant = null
  try {
    restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug }
    })
  } catch (e) {
    console.error('Error loading restaurant:', e)
  }

  if (!restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Restaurant Not Found</h1>
          <a href="/" style={{ color: '#d32f2f' }}>Go Home</a>
        </div>
      </div>
    )
  }

  return <CartPageClient restaurant={restaurant} />
}
