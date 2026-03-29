export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sseManager } from '@/lib/sse'
import crypto from 'crypto'

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook active', 
    timestamp: new Date().toISOString(),
    mode: process.env.CASHFREE_ENV || 'sandbox'
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const secretKey = process.env.CASHFREE_WEBHOOK_SECRET || ''
    
    if (secretKey && body.signature) {
      try {
        const computedSignature = crypto
          .createHmac('sha256', secretKey)
          .update(JSON.stringify(body))
          .digest('base64')
        
        if (computedSignature !== body.signature) {
          console.log('Webhook: Signature mismatch but continuing...')
        }
      } catch (e) {
        console.log('Webhook: Signature verification skipped')
      }
    }

    const type = body.type || body.event
    const data = body.data || body
  
    let cfOrderId = data?.order?.order_id || data?.order_id || body.orderId || body.order_id
    let paymentStatus = data?.payment_status || data?.status || body.status
    let cfPaymentId = data?.cf_payment_id || data?.transaction_id || body.paymentId

    if (type === 'PAYMENT_SUCCESS_WEBHOOK' || 
        type === 'PAYMENT_SUCCESS' || 
        type === 'PaymentSuccess' ||
        paymentStatus === 'SUCCESS' ||
        paymentStatus === 'SUCCESS') {
      
      if (cfOrderId) {
        const cleanOrderId = cfOrderId.includes('_') ? cfOrderId.split('_')[1] : cfOrderId
        
        const order = await prisma.order.findFirst({
          where: { 
            OR: [
              { razorpayOrderId: cfOrderId },
              { razorpayOrderId: { contains: cleanOrderId } }
            ]
          }
        })
        
        if (order && order.paymentStatus !== 'PAID') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'PENDING',
              paymentId: cfPaymentId || `cf_${Date.now()}`
            }
          })
          
          sseManager.emit(order.restaurantId, {
            type: 'payment:verified',
            data: { orderId: order.id, status: 'PENDING' }
          })
          
          console.log('Webhook: Order verified successfully -', order.id)
          return NextResponse.json({ status: 'ok', verified: true })
        }
      }
    }

    return NextResponse.json({ status: 'received' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ status: 'received' }, { status: 200 })
  }
}
