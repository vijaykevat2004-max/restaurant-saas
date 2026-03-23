export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, phone, address, email, openingHours, logo, slug } = body

    if (!name) {
      return NextResponse.json({ error: 'Restaurant name required' }, { status: 400 })
    }

    const restaurantSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const existing = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug }
    })

    if (existing) {
      return NextResponse.json({ error: 'Restaurant with this name already exists' }, { status: 400 })
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug: restaurantSlug,
        description: description || null,
        phone: phone || null,
        address: address || null,
        email: email || null,
        openingHours: openingHours || null,
        logo: logo || null
      }
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { restaurantId: restaurant.id }
    })

    return NextResponse.json({ restaurant }, { status: 201 })
  } catch (error) {
    console.error('Failed to create restaurant:', error)
    return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 })
  }
}

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
        openingHours: body.openingHours,
        logo: body.logo || null
      }
    })

    return NextResponse.json({ restaurant: updated })
  } catch (error) {
    console.error('Failed to update restaurant:', error)
    return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
  }
}
