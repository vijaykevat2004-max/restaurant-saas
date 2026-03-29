export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Cashfree, CFEnvironment } from 'cashfree-pg'

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

    let appId: string
    let secretKey: string
    let isRestaurantOwn: boolean = false
    let env: CFEnvironment

    if (order.restaurant.cashfreeAppId && order.restaurant.cashfreeSecret) {
      appId = order.restaurant.cashfreeAppId
      secretKey = order.restaurant.cashfreeSecret
      isRestaurantOwn = true
      env = CFEnvironment.SANDBOX
    } else {
      appId = process.env.CASHFREE_APP_ID!
      secretKey = process.env.CASHFREE_SECRET_KEY!
      env = process.env.CASHFREE_ENV === 'production' 
        ? CFEnvironment.PRODUCTION 
        : CFEnvironment.SANDBOX
    }

    if (!appId || !secretKey) {
      return NextResponse.json({ 
        error: 'Payment gateway not configured',
        message: 'Payment gateway is being set up. Please try again later.'
      }, { status: 503 })
    }

    const cf = new Cashfree(env, appId, secretKey)

    const cfOrderId = `ORD_${order.orderNumber}_${Date.now()}`
    const customerId = `cust_${order.id.slice(-10)}`

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: cfOrderId }
    })

    const webhookUrl = isRestaurantOwn
      ? `https://restaurant-saas-vijay19.vercel.app/api/payment/webhook?restaurantId=${order.restaurantId}`
      : `https://restaurant-saas-vijay19.vercel.app/api/payment/webhook`

    const response = await cf.PGCreateOrder({
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
        notify_url: webhookUrl
      }
    })

    const data = response.data

    console.log('Cashfree API response:', JSON.stringify(data))

    if (data.cf_order_id || data.payment_session_id) {
      return NextResponse.json({
        cfOrderId: data.cf_order_id || cfOrderId,
        paymentSessionId: data.payment_session_id,
        publishableKey: appId,
        amount: order.total,
        isRestaurantOwn
      })
    }

    return NextResponse.json({ 
      error: 'Failed to create payment',
      message: 'Unexpected response from Cashfree'
    }, { status: 500 })
  } catch (error: any) {
    console.error('Cashfree SDK error:', error)
    const message = error?.response?.data?.message || error?.message || 'Payment service error'
    return NextResponse.json({ 
      error: 'Cashfree API error',
      message: message
    }, { status: 500 })
  }
}
