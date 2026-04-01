export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, paymentNote, verified } = body

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

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, message: 'Already verified' })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus: 'PAID',
        paymentId: paymentNote || `paid_${Date.now()}`,
        status: 'PENDING'
      }
    })

    sseManager.emit(order.restaurantId, {
      type: 'payment:verified',
      data: { orderId, status: 'PENDING' }
    })

    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
