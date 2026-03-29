import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DemoSetup from './DemoSetup'

export default async function HomePage() {
  let restaurants: any[] = []
  try {
    restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        _count: {
          select: { categories: true }
        }
      }
    })
  } catch (e) {
    console.error('Failed to fetch restaurants:', e)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 16 }}>🍽️ RestaurantHub</h1>
        <p style={{ fontSize: 20, opacity: 0.9, marginBottom: 32 }}>Your own online ordering platform</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{ background: 'white', color: '#f97316', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 16 }}>
            Start Your Restaurant
          </Link>
          <Link href="/login" style={{ background: 'transparent', color: 'white', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 16, border: '2px solid white' }}>
            Login
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 60 }}>
        <h2 style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 }}>Available Restaurants</h2>
        
        {restaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🍽️</div>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>No restaurants yet</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>Create a demo restaurant to test the system</p>
            <DemoSetup />
            <div style={{ marginTop: 16 }}>
              <Link href="/register" style={{ background: '#f97316', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold' }}>
                Or Create Your Own Restaurant
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {restaurants.map(restaurant => (
                <Link 
                  key={restaurant.id} 
                  href={`/${restaurant.slug}`}
                  style={{ 
                    background: 'white', 
                    borderRadius: 16, 
                    padding: 24, 
                    textDecoration: 'none', 
                    color: 'inherit',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  {restaurant.logo ? (
                    <img src={restaurant.logo} alt={restaurant.name} style={{ width: '100%', height: 120, borderRadius: 12, marginBottom: 16, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ background: '#f3f4f6', height: 120, borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 48 }}>🍔</span>
                    </div>
                  )}
                  <h3 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{restaurant.name}</h3>
                  <p style={{ color: '#666', marginBottom: 12 }}>{restaurant.description || 'Order online now!'}</p>
                  <span style={{ background: '#22c55e', color: 'white', padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 'bold' }}>
                    Order Now →
                  </span>
                </Link>
              ))}
            </div>
            
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <DemoSetup label="Add Demo Restaurant" />
            </div>
          </>
        )}

        <div style={{ marginTop: 60, padding: 40, background: 'white', borderRadius: 16 }}>
          <h3 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>For Restaurant Owners</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
              <h4 style={{ fontWeight: 'bold', marginBottom: 8 }}>Mobile-Friendly</h4>
              <p style={{ color: '#666', fontSize: 14 }}>Customers order from any device</p>
            </div>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
              <h4 style={{ fontWeight: 'bold', marginBottom: 8 }}>UPI Payments</h4>
              <p style={{ color: '#666', fontSize: 14 }}>Accept payments via any UPI app</p>
            </div>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <h4 style={{ fontWeight: 'bold', marginBottom: 8 }}>Real-Time Orders</h4>
              <p style={{ color: '#666', fontSize: 14 }}>Kitchen display shows orders live</p>
            </div>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
              <h4 style={{ fontWeight: 'bold', marginBottom: 8 }}>Easy Setup</h4>
              <p style={{ color: '#666', fontSize: 14 }}>Create menu in minutes</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/register" style={{ background: '#f97316', color: 'white', padding: '14px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 16, display: 'inline-block' }}>
              Create Your Restaurant - Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
