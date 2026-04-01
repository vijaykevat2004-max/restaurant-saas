export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const restaurantId = session?.user?.restaurantId as string | null
    
    if (!restaurantId) {
      return NextResponse.json({ restaurant: null, error: 'No restaurant associated with this account' }, { status: 200 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        paymentLink: true,
        paymentInstructions: true,
        address: true,
        phone: true
      }
    })

    return NextResponse.json({ restaurant })
  } catch (error) {
    console.error('Failed to get restaurant:', error)
    return NextResponse.json({ restaurant: null })
  }
}
