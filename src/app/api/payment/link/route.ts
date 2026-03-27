import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, restaurantSlug, amount, customerPhone, customerName } = body

    if (!orderId || !restaurantSlug || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      select: { name: true, razorpayKeyId: true, razorpayKeySecret: true, upiId: true }
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const RAZORPAY_KEY_ID = restaurant.razorpayKeyId
    const RAZORPAY_KEY_SECRET = restaurant.razorpayKeySecret

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || 
        RAZORPAY_KEY_ID.includes('XXXXXXXX') || 
        RAZORPAY_KEY_SECRET.includes('XXXXXXXX')) {
      return NextResponse.json({ 
        mockMode: true,
        paymentUrl: null,
        message: 'Payment links not configured. Please add Razorpay keys in settings.'
      })
    }

    const paymentLinkRes = await fetch('https://api.razorpay.com/v1/payment-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        description: `Payment for Order`,
        customer: {
          name: customerName || 'Customer',
          contact: customerPhone || '',
          email: ''
        },
        notify: {
          sms: true,
          email: true
        },
        reminder_enable: true,
        notes: {
          orderId: orderId
        }
      })
    })

    if (!paymentLinkRes.ok) {
      const error = await paymentLinkRes.json()
      console.error('Payment link error:', error)
      return NextResponse.json({ error: error.error?.description || 'Failed to create payment link' }, { status: 400 })
    }

    const paymentLinkData = await paymentLinkRes.json()

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: paymentLinkData.id }
    })

    return NextResponse.json({
      paymentUrl: paymentLinkData.short_url,
      paymentId: paymentLinkData.id,
      amount: paymentLinkData.amount / 100,
      currency: paymentLinkData.currency
    })
  } catch (error) {
    console.error('Payment link error:', error)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}
