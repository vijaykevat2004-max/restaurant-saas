export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    let event: any
    
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('Webhook received:', event.event)

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity
      const razorpayOrderId = event.payload?.order?.entity?.id

      if (razorpayOrderId) {
        const dbOrder = await prisma.order.findFirst({
          where: { 
            razorpayOrderId: razorpayOrderId
          }
        })

        if (dbOrder) {
          await prisma.order.update({
            where: { id: dbOrder.id },
            data: {
              paymentStatus: 'PAID',
              status: 'PENDING',
              paymentId: payment?.id
            }
          })

          sseManager.emit(dbOrder.restaurantId, {
            type: 'payment:verified',
            data: { orderId: dbOrder.id, status: 'PENDING' }
          })

          console.log('Payment verified automatically for order:', dbOrder.orderNumber)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
