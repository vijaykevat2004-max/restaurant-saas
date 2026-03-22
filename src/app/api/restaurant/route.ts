import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    const restaurantId = session?.user?.restaurantId as string | null
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'No restaurant associated with this account' }, { status: 401 })
    }
    
    const body = await req.json()
    
    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: body.name,
        description: body.description,
        phone: body.phone,
        address: body.address,
        email: body.email,
        openingHours: body.openingHours
      }
    })

    return NextResponse.json({ restaurant: updated })
  } catch (error) {
    console.error('Failed to update restaurant:', error)
    return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
  }
}
