import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ restaurantSlug: string }>
}

export default async function QRMenuPage({ params }: PageProps) {
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

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
        padding: '20px',
        textAlign: 'center',
        color: 'white'
      }}>
        {restaurant.logo && (
          <img 
            src={restaurant.logo} 
            alt={restaurant.name} 
            style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              objectFit: 'cover',
              marginBottom: 12,
              border: '3px solid white'
            }} 
          />
        )}
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>{restaurant.name}</h1>
        {restaurant.description && (
          <p style={{ fontSize: 14, margin: '8px 0 0', opacity: 0.9 }}>{restaurant.description}</p>
        )}
        {restaurant.address && (
          <p style={{ fontSize: 12, margin: '4px 0 0', opacity: 0.8 }}>{restaurant.address}</p>
        )}
      </div>

      {/* Menu Content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px' }}>
        {restaurant.categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: '#666' }}>Menu coming soon!</p>
          </div>
        ) : (
          restaurant.categories.map((category) => (
            <div key={category.id} style={{ marginBottom: 24 }}>
              <div style={{ 
                borderBottom: '2px solid #d32f2f',
                marginBottom: 12,
                paddingBottom: 8
              }}>
                <h2 style={{ 
                  fontSize: 20, 
                  fontWeight: 'bold', 
                  color: '#d32f2f',
                  margin: 0
                }}>
                  {category.name}
                </h2>
              </div>

              {category.menuItems.length === 0 ? (
                <p style={{ color: '#999', fontSize: 14 }}>No items available</p>
              ) : (
                category.menuItems.map((item) => (
                  <div key={item.id} style={{ 
                    display: 'flex',
                    padding: '12px 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: 16, 
                        fontWeight: 'bold', 
                        margin: 0,
                        color: '#333'
                      }}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p style={{ 
                          fontSize: 13, 
                          color: '#666', 
                          margin: '4px 0 0',
                          lineHeight: 1.4
                        }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 18, 
                      fontWeight: 'bold',
                      color: '#d32f2f',
                      marginLeft: 16
                    }}>
                      ₹{item.price}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))
        )}

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          padding: '24px 0',
          marginTop: 24,
          borderTop: '1px solid #eee'
        }}>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            Scan QR to order online
          </p>
          <Link 
            href={`/${restaurant.slug}`}
            style={{
              display: 'inline-block',
              background: '#d32f2f',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Order Now
          </Link>
        </div>
      </div>
    </div>
  )
}
