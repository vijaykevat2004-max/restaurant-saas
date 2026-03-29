import { prisma } from '@/lib/prisma'
import CustomerMenuClient from './CustomerMenuClient'

interface PageProps {
  params: Promise<{ restaurantSlug: string }>
}

export default async function RestaurantPage({ params }: PageProps) {
  const { restaurantSlug } = await params
  
  let restaurant = null
  try {
    restaurant = await prisma.restaurant.findUnique({
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
  } catch (e) {
    console.error('Error loading restaurant:', e)
  }

  if (!restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h1 style={{ fontSize: 48, marginBottom: 16 }}>🍽️</h1>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Restaurant Not Found</h1>
          <p style={{ color: '#666', marginBottom: 16 }}>This restaurant doesn't exist or is not available.</p>
          <a href="/" style={{ background: '#d32f2f', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none' }}>
            Go Home
          </a>
        </div>
      </div>
    )
  }

  return <CustomerMenuClient restaurant={restaurant} />
}
