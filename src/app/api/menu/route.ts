import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    const restaurantId = session?.user?.restaurantId as string | null

    if (!restaurantId) {
      return NextResponse.json({ categories: [], restaurant: null })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })
    
    if (!restaurant) {
      return NextResponse.json({ categories: [], restaurant: null })
    }

    const categories = await prisma.category.findMany({
      where: { 
        isActive: true,
        restaurantId: restaurant.id
      },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({ 
      categories,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description
      }
    })
  } catch (error) {
    console.error('Failed to fetch menu:', error)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}
