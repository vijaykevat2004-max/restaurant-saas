export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    const restaurantId = session?.user?.restaurantId as string | null
    
    let where: Record<string, unknown> = {
      status: { in: ['PENDING', 'PREPARING', 'READY', 'AWAITING_CASH'] }
    }
    
    if (restaurantId) {
      where.restaurantId = restaurantId
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Kitchen fetch error:', error)
    return NextResponse.json([], { status: 500 })
  }
}
