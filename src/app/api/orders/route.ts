import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'

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
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
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
    const { items, customerName, customerEmail, customerPhone, notes, restaurantSlug, paymentMethod = 'CASH' } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (!restaurantSlug) {
      return NextResponse.json({ error: 'Restaurant slug is required' }, { status: 400 })
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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'AWAITING_PAYMENT',
        subtotal,
        tax,
        total,
        customerName: customerName || 'Guest',
        customerEmail,
        customerPhone,
        notes,
        paymentMethod,
        paymentStatus: paymentMethod === 'ONLINE' ? 'PENDING' : 'PENDING',
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
      details: error?.message || String(error),
      stack: error?.stack 
    }, { status: 500 })
  }
}
