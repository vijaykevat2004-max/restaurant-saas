export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === 'production' 
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg'

export async function POST(req: NextRequest) {
  try {
    const { orderId, restaurantSlug } = await req.json()

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
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    const appId = process.env.CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      return NextResponse.json({ 
        error: 'Payment gateway not configured',
        message: 'Payment gateway is being set up. Please try again later.'
      }, { status: 503 })
    }

    const cfOrderId = `ORD_${order.orderNumber}_${Date.now()}`
    const customerId = `cust_${order.id.slice(-10)}`

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: cfOrderId }
    })

    const payload = {
      order_id: cfOrderId,
      order_amount: order.total,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: order.customerName || 'Customer',
        customer_email: order.customerEmail || 'customer@example.com',
        customer_phone: order.customerPhone || '9999999999'
      },
      order_meta: {
        return_url: `https://restaurant-saas-vijay19.vercel.app/${order.restaurant.slug}/pay/${orderId}?success=1`,
        notify_url: `https://restaurant-saas-vijay19.vercel.app/api/payment/webhook`
      }
    }

    console.log('Creating Cashfree order:', { cfOrderId, amount: order.total })

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2025-01-01'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log('Cashfree API response status:', response.status)
    console.log('Cashfree API response:', JSON.stringify(data))

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Cashfree API error',
        message: data.message || data.error || `API error: ${response.status}`
      }, { status: 500 })
    }

    if (data.cf_order_id || data.payment_session_id) {
      return NextResponse.json({
        cfOrderId: data.cf_order_id || cfOrderId,
        paymentSessionId: data.payment_session_id,
        publishableKey: appId,
        amount: order.total
      })
    }

    return NextResponse.json({ 
      error: 'Failed to create payment',
      message: data.message || 'Unexpected response from Cashfree'
    }, { status: 500 })
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ 
      error: 'Payment service error',
      message: 'Please try again later'
    }, { status: 500 })
  }
}
