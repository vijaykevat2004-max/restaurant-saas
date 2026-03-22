import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    const restaurantId = session?.user?.restaurantId as string | null
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Category name required' }, { status: 400 })
    }

    const lastCategory = await prisma.category.findFirst({
      where: { restaurantId },
      orderBy: { displayOrder: 'desc' }
    })

    const category = await prisma.category.create({
      data: {
        name,
        displayOrder: (lastCategory?.displayOrder || 0) + 1,
        restaurantId
      }
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
