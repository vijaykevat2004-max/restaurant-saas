export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === 'production' 
  ? 'https://api.cashfree.com/api/v2'
  : 'https://sandbox.cashfree.com/api/v2'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ paid: true, status: 'PAID' })
    }

    if (order.razorpayOrderId?.startsWith('CF_') && process.env.CASHFREE_APP_ID) {
      try {
        const response = await fetch(`${CASHFREE_BASE_URL}/orders/${order.razorpayOrderId}`, {
          method: 'GET',
          headers: new Headers({
            'x-client-id': process.env.CASHFREE_APP_ID || '',
            'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
            'x-api-version': '2023-08-01'
          })
        })

        const data = await response.json()

        if (data.order_status === 'PAID') {
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'PAID' }
          })
          return NextResponse.json({ paid: true, status: 'PAID' })
        }
      } catch (e) {
        console.error('Cashfree check error:', e)
      }
    }

    return NextResponse.json({ paid: false, status: order.paymentStatus })
  } catch (error) {
    console.error('Payment check error:', error)
    return NextResponse.json({ error: 'Failed to check payment' }, { status: 500 })
  }
}
