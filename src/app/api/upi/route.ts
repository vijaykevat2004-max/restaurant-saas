export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    const restaurantId = session?.user?.restaurantId as string | null
    
    if (!restaurantId) {
      return NextResponse.json({ paymentLink: null, paymentInstructions: null })
    }
    
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { paymentLink: true, paymentInstructions: true }
    })
    
    return NextResponse.json({ 
      paymentLink: restaurant?.paymentLink || null,
      paymentInstructions: restaurant?.paymentInstructions || null
    })
  } catch (error) {
    console.error('Failed to fetch payment settings:', error)
    return NextResponse.json({ paymentLink: null, paymentInstructions: null })
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
    const { paymentLink, paymentInstructions } = body

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        paymentLink: paymentLink || null,
        paymentInstructions: paymentInstructions || null
      }
    })

    return NextResponse.json({ success: true, paymentLink, paymentInstructions })
  } catch (error) {
    console.error('Failed to save payment settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
