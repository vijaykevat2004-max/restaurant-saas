export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === 'production' 
  ? 'https://api.cashfree.com/api/v2'
  : 'https://sandbox.cashfree.com/api/v2'

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, customerName, customerPhone, restaurantSlug } = await req.json()

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug }
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const cfOrderId = `CF_${orderId}_${Date.now()}`

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: cfOrderId }
    })

    const payload = {
      order_id: cfOrderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: order.customerPhone || `cust_${Date.now()}`,
        customer_name: customerName || order.customerName || 'Customer',
        customer_email: order.customerEmail || 'customer@example.com',
        customer_phone: customerPhone || order.customerPhone || '9999999999'
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://restaurant-saas-vijay19.vercel.app'}/${restaurantSlug}/pay/${orderId}?status=success`,
        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://restaurant-saas-vijay19.vercel.app'}/api/payment/webhook`
      }
    }

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_APP_ID || '',
        'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
        'x-api-version': '2023-08-01'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.cf_order_id) {
      return NextResponse.json({
        cfOrderId: data.cf_order_id,
        orderId: cfOrderId,
        paymentSessionId: data.payment_session_id,
        amount: amount
      })
    }

    return NextResponse.json({ error: data.message || 'Failed to create order' }, { status: 500 })
  } catch (error) {
    console.error('Cashfree order error:', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
