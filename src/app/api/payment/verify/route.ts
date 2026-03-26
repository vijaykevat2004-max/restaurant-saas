export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, verified } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, message: 'Already verified' })
    }

    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

    if (verified) {
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          paymentStatus: 'PAID',
          paymentId: razorpay_payment_id || `upi_${Date.now()}`,
          status: 'PENDING'
        }
      })

      sseManager.emit(order.restaurantId, {
        type: 'payment:verified',
        data: { orderId, status: 'PENDING' }
      })

      return NextResponse.json({ success: true, verified: true })
    }

    if (razorpay_signature && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_SECRET.includes('XXXXXXXX')) {
      const generated_signature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id || `upi_${Date.now()}`,
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
