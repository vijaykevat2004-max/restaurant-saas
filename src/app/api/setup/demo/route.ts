export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { restaurantName, phone } = body

    const slug = (restaurantName || 'demo-restaurant').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const existing = await prisma.restaurant.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ restaurant: existing, message: 'Restaurant already exists' })
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: restaurantName || 'Demo Restaurant',
        slug,
        description: 'A sample restaurant for testing',
        phone: phone || null,
        paymentLink: body.paymentLink || 'https://upi.me/pay/demo@upi',
        paymentInstructions: 'Pay via any UPI app to complete your order',
      }
    })

    const category1 = await prisma.category.create({
      data: {
        name: 'Popular Items',
        description: 'Most ordered dishes',
        displayOrder: 1,
        restaurantId: restaurant.id,
      }
    })

    const category2 = await prisma.category.create({
      data: {
        name: 'Beverages',
        description: 'Drinks and beverages',
        displayOrder: 2,
        restaurantId: restaurant.id,
      }
    })

    await prisma.menuItem.createMany({
      data: [
        { name: 'Margherita Pizza', description: 'Classic Italian pizza with tomato and mozzarella', price: 299, categoryId: category1.id, prepTime: 15 },
        { name: 'Chicken Burger', description: 'Juicy grilled chicken with fresh vegetables', price: 199, categoryId: category1.id, prepTime: 10 },
        { name: 'Paneer Tikka', description: 'Grilled paneer cubes with spices', price: 249, categoryId: category1.id, prepTime: 12 },
        { name: 'Masala Dosa', description: 'Crispy crepe with spiced potatoes', price: 149, categoryId: category1.id, prepTime: 10 },
        { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 99, categoryId: category2.id, prepTime: 5 },
        { name: 'Mango Lassi', description: 'Sweet yogurt smoothie with mango', price: 79, categoryId: category2.id, prepTime: 3 },
        { name: 'Masala Chai', description: 'Traditional Indian spiced tea', price: 49, categoryId: category2.id, prepTime: 3 },
        { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda water', price: 59, categoryId: category2.id, prepTime: 2 },
      ]
    })

    await prisma.table.createMany({
      data: [
        { number: 1, name: 'Table 1', status: 'AVAILABLE', restaurantId: restaurant.id },
        { number: 2, name: 'Table 2', status: 'AVAILABLE', restaurantId: restaurant.id },
        { number: 3, name: 'Table 3', status: 'AVAILABLE', restaurantId: restaurant.id },
        { number: 4, name: 'Table 4', status: 'AVAILABLE', restaurantId: restaurant.id },
        { number: 5, name: 'Table 5', status: 'AVAILABLE', restaurantId: restaurant.id },
        { number: 6, name: 'Table 6', status: 'AVAILABLE', restaurantId: restaurant.id },
      ]
    })

    return NextResponse.json({ 
      restaurant,
      url: `/${slug}`,
      message: 'Demo restaurant created successfully' 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Demo setup error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create demo' }, { status: 500 })
  }
}
