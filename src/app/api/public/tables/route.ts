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

    const tablesWithStatus = tables.map(table => ({
      ...table,
      isAvailable: table.status === 'AVAILABLE'
    }))

    return NextResponse.json({ tables: tablesWithStatus })
  } catch (error) {
    console.error('Failed to fetch tables:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}
