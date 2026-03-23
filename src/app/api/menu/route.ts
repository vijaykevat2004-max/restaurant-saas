export const dynamic = 'force-dynamic'

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const restaurantId = session?.user?.restaurantId as string | null

    if (!restaurantId) {
      return NextResponse.json({ error: 'No restaurant' }, { status: 400 })
    }

    const { name, description, price, image, categoryId } = await req.json()

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Name, price, and category required' }, { status: 400 })
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        image: image || null,
        categoryId,
      }
    })

    return NextResponse.json({ menuItem }, { status: 201 })
  } catch (error) {
    console.error('Failed to create menu item:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}
