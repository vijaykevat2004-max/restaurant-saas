export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const phone = order.restaurant.phone?.replace(/\D/g, '') || ''
    const message = encodeURIComponent(
      `Hi! I've placed order #${order.orderNumber} for ₹${order.total} at ${order.restaurant.name}. ` +
      `Order Type: ${order.orderType}${order.tableName ? ` (Table: ${order.tableName})` : ''}. ` +
      `Please confirm my payment of ₹${order.total}.`
    )

    const whatsappUrl = phone ? `https://wa.me/${phone}?text=${message}` : null

    return NextResponse.json({
      whatsappUrl,
      phone: order.restaurant.phone,
      message: decodeURIComponent(message)
    })
  } catch (error) {
    console.error('WhatsApp verification error:', error)
    return NextResponse.json({ error: 'Failed to generate WhatsApp link' }, { status: 500 })
  }
}
