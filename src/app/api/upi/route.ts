export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    const restaurantId = session?.user?.restaurantId as string | null
    
    if (!restaurantId) {
      return NextResponse.json({ upiId: null })
    }
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { upiId: true }
    })
    
    const upiId = restaurant?.upiId || null
    return NextResponse.json({ upiId })
  } catch (error) {
    console.error('Failed to fetch UPI:', error)
    return NextResponse.json({ upiId: null })
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
    const { upiId } = body

    if (!upiId) {
      return NextResponse.json({ error: 'UPI ID required' }, { status: 400 })
    }

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { upiId }
    })

    return NextResponse.json({ success: true, upiId })
  } catch (error) {
    console.error('Failed to save UPI ID:', error)
    return NextResponse.json({ error: 'Failed to save UPI ID' }, { status: 500 })
  }
}
