import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Restaurant slug required' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const tables = await prisma.table.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { number: 'asc' },
    })

    const activeOrders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        orderType: 'DINE_IN',
        status: { in: ['PENDING', 'PREPARING', 'READY', 'AWAITING_CASH'] }
      },
      select: { tableId: true }
    })

    const occupiedTableIds = activeOrders
      .filter(o => o.tableId)
      .map(o => o.tableId)

    const tablesWithStatus = tables.map(table => ({
      ...table,
      isAvailable: !occupiedTableIds.includes(table.id)
    }))

    return NextResponse.json({ tables: tablesWithStatus })
  } catch (error) {
    console.error('Failed to fetch tables:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}
