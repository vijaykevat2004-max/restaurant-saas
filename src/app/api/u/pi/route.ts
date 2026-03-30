export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    const restaurantId = session?.user?.restaurantId as string | null
    
    if (!restaurantId) {
      return NextResponse.json({ upiId: null, paymentMode: 'own_upi' })
    }
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { upiId: true, paymentMode: true }
    })
    
    return NextResponse.json({ 
      upiId: restaurant?.upiId || null,
      paymentMode: restaurant?.paymentMode || 'own_upi'
    })
  } catch (error) {
    console.error('Failed to fetch UPI:', error)
    return NextResponse.json({ upiId: null, paymentMode: 'own_upi' })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    const restaurantId = session?.user?.restaurantId as string | null
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { upiId, paymentMode } = body

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        upiId: upiId || null,
        paymentMode: paymentMode || 'own_upi'
      }
    })

    return NextResponse.json({ success: true, upiId, paymentMode })
  } catch (error) {
    console.error('Failed to save UPI ID:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
