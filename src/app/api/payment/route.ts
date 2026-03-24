export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, orderId: localOrderId, receipt, restaurantSlug } = body

    let RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
    let RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
    let restaurantName = 'Restaurant'

    if (restaurantSlug) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug: restaurantSlug },
        select: { id: true, name: true, razorpayKeyId: true, razorpayKeySecret: true }
      })
      
      if (restaurant && restaurant.razorpayKeyId && restaurant.razorpayKeySecret) {
        RAZORPAY_KEY_ID = restaurant.razorpayKeyId
        RAZORPAY_KEY_SECRET = restaurant.razorpayKeySecret
        restaurantName = restaurant.name
      }
    }

    const isValidKey = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && 
        !RAZORPAY_KEY_ID.includes('XXXXXXXX') && 
        !RAZORPAY_KEY_SECRET.includes('XXXXXXXX') &&
        RAZORPAY_KEY_ID !== 'rzp_test_XXXXXXXXXXXXX' &&
        RAZORPAY_KEY_SECRET !== 'your-super-secret-key-change-in-production-abc123'

    if (!isValidKey) {
      const mockOrderId = `mock_${Date.now()}`
      if (localOrderId) {
        await prisma.order.update({
          where: { id: localOrderId },
          data: { razorpayOrderId: mockOrderId }
        }).catch(() => {})
      }
      return NextResponse.json({ 
        mockMode: true,
        orderId: mockOrderId,
        amount: Math.round(amount * 100),
        currency: 'INR'
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
        receipt: receipt || `order_${Date.now()}`
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
