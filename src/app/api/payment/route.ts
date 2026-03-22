export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, orderId: localOrderId, receipt } = body

    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_ID === 'rzp_test_XXXXXXXXXXXXX') {
      return NextResponse.json({ 
        mockMode: true,
        orderId: `mock_${Date.now()}`
      })
    }

    const razorpayOrder = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: receipt || `order_${Date.now()}`,
        method: 'upi'
      })
    })

    if (!razorpayOrder.ok) {
      const error = await razorpayOrder.json()
      return NextResponse.json({ error: error.error?.description || 'Payment failed' }, { status: 400 })
    }

    const razorpayData = await razorpayOrder.json()

    if (localOrderId) {
      await prisma.order.update({
        where: { id: localOrderId },
        data: { razorpayOrderId: razorpayData.id }
      })
    }

    return NextResponse.json({
      id: razorpayData.id,
      amount: razorpayData.amount,
      currency: razorpayData.currency,
      mockMode: false
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 })
  }
}
