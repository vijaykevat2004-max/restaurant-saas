import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    let event: any
    
    try {
      event = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('Webhook received:', event.event, event.payload?.payment?.entity?.status)

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity
      const orderId = event.payload?.order?.entity?.receipt

      if (orderId) {
        const dbOrder = await prisma.order.findFirst({
          where: { 
            razorpayOrderId: orderId
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
