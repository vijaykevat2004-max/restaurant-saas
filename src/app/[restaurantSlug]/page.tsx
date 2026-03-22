import { prisma } from '@/lib/prisma'
import CustomerMenuClient from './CustomerMenuClient'

interface PageProps {
  params: Promise<{ restaurantSlug: string }>
}

export default async function RestaurantPage({ params }: PageProps) {
  const { restaurantSlug } = await params
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { displayOrder: 'asc' }
          }
        }
      }
    }
  })

  if (!restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h1 style={{ fontSize: 48, marginBottom: 16 }}>🍽️</h1>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Restaurant Not Found</h1>
          <p style={{ color: '#666' }}>This restaurant doesn't exist or is not available.</p>
        </div>
      </div>
    )
  }

  return <CustomerMenuClient restaurant={restaurant} />
}
