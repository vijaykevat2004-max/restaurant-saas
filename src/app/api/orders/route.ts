import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const restaurantId = session?.user?.restaurantId as string | null

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (restaurantId) {
      where.restaurantId = restaurantId
    }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        restaurant: {
          select: { id: true, name: true, slug: true },
        },
        table: {
          select: { id: true, number: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      items, 
      customerName, 
      customerEmail, 
      customerPhone, 
      notes, 
      restaurantSlug, 
      paymentMethod = 'ONLINE',
      orderType = 'TAKEAWAY',
      tableId = null,
      tableName = null
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!restaurantSlug) {
      return NextResponse.json({ error: 'Restaurant slug is required' }, { status: 400 })
    }

    if (orderType === 'DINE_IN' && (!customerName || !customerPhone)) {
      return NextResponse.json({ error: 'Name and phone required for dine-in' }, { status: 400 })
    }

    if (orderType === 'TAKEAWAY' && !customerPhone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    let subtotal = 0
    for (const item of items) {
      subtotal += Number(item.price) * item.quantity
    }
    const tax = subtotal * 0.08
    const total = subtotal + tax

    const lastOrder = await prisma.order.findFirst({
      where: { restaurantId: restaurant.id },
      orderBy: { orderNumber: 'desc' },
    })
    const orderNumber = String((parseInt(lastOrder?.orderNumber || '1000') + 1))

    let initialStatus = 'AWAITING_PAYMENT'
    let paymentStatus = 'PENDING'

    if (orderType === 'DINE_IN' && paymentMethod === 'CASH') {
      initialStatus = 'AWAITING_CASH'
      paymentStatus = 'PENDING'
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: initialStatus,
        orderType,
        tableId,
        tableName,
        subtotal,
        tax,
        total,
        customerName: customerName || 'Guest',
        customerEmail,
        customerPhone,
        notes,
        paymentMethod,
        paymentStatus,
        restaurantId: restaurant.id,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            menuItemName: item.name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
        },
      },
      include: {
        items: true,
        table: true,
      },
    })

    try {
      sseManager.emit(restaurant.id, {
        type: 'order:created',
        data: order,
      })
    } catch (e) {
      console.error('SSE emit error:', e)
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create order:', error)
    return NextResponse.json({ 
      error: 'Failed to create order', 
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
