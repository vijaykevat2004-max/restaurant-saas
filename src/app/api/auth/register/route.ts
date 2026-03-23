import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, restaurantName, restaurantSlug, restaurantLogo } = await req.json()

    if (!name || !email || !password || !restaurantName || !restaurantSlug) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const slug = restaurantSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    const existingSlug = await prisma.restaurant.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'This URL is already taken' }, { status: 400 })
    }

    const hashedPassword = await hash(password, 12)

    const restaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        logo: restaurantLogo || null,
        description: `Welcome to ${restaurantName}`,
        categories: {
          create: [
            { name: 'Burgers', description: 'Delicious burgers', displayOrder: 1 },
            { name: 'Sides', description: 'Tasty sides', displayOrder: 2 },
            { name: 'Drinks', description: 'Refreshing drinks', displayOrder: 3 },
            { name: 'Desserts', description: 'Sweet treats', displayOrder: 4 },
          ],
        },
      },
    })

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'RESTAURANT_ADMIN',
        restaurantId: restaurant.id,
      },
    })

    return NextResponse.json({ message: 'Restaurant created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
