export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const restaurantSlug = searchParams.get('restaurantSlug')
    const orderId = searchParams.get('orderId')

    if (!restaurantSlug || !orderId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      restaurant: {
        name: restaurant.name,
        logo: restaurant.logo,
        paymentLink: restaurant.paymentLink,
        paymentInstructions: restaurant.paymentInstructions,
        phone: restaurant.phone,
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentStatus: order.paymentStatus,
      }
    })
  } catch (error) {
    console.error('Payment data error:', error)
    return NextResponse.json({ error: 'Failed to load payment data' }, { status: 500 })
  }
}
