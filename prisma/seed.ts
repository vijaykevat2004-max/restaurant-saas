import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'burger-palace' },
    update: {},
    create: {
      name: 'Burger Palace',
      slug: 'burger-palace',
      description: 'Best burgers in town with fresh ingredients',
      address: '123 Main Street, City, State 12345',
      phone: '+1 234 567 8900',
      email: 'contact@burgerpalace.com',
      openingHours: '9:00 AM - 10:00 PM',
    },
  })

  console.log('Created restaurant:', restaurant.name)

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-burgers' },
      update: {},
      create: {
        id: 'cat-burgers',
        name: 'Burgers',
        displayOrder: 1,
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-sides' },
      update: {},
      create: {
        id: 'cat-sides',
        name: 'Sides',
        displayOrder: 2,
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-drinks' },
      update: {},
      create: {
        id: 'cat-drinks',
        name: 'Drinks',
        displayOrder: 3,
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-desserts' },
      update: {},
      create: {
        id: 'cat-desserts',
        name: 'Desserts',
        displayOrder: 4,
        restaurantId: restaurant.id,
      },
    }),
  ])

  console.log('Created categories:', categories.length)

  await Promise.all([
    prisma.menuItem.upsert({
      where: { id: 'item-classic-burger' },
      update: {},
      create: {
        id: 'item-classic-burger',
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, and special sauce',
            price: 149,
        prepTime: 8,
        displayOrder: 1,
        categoryId: 'cat-burgers',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-cheese-burger' },
      update: {},
      create: {
        id: 'item-cheese-burger',
        name: 'Cheese Burger',
        description: 'Classic burger topped with melted cheddar cheese',
        price: 179,
        prepTime: 8,
        displayOrder: 2,
        categoryId: 'cat-burgers',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-double-burger' },
      update: {},
      create: {
        id: 'item-double-burger',
        name: 'Double Burger',
        description: 'Two beef patties for the hungry ones',
        price: 229,
        prepTime: 10,
        displayOrder: 3,
        categoryId: 'cat-burgers',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-veggie-burger' },
      update: {},
      create: {
        id: 'item-veggie-burger',
        name: 'Veggie Burger',
        description: 'Plant-based patty with fresh vegetables',
        price: 199,
        prepTime: 8,
        displayOrder: 4,
        categoryId: 'cat-burgers',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-fries' },
      update: {},
      create: {
        id: 'item-fries',
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        price: 79,
        prepTime: 5,
        displayOrder: 1,
        categoryId: 'cat-sides',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-onion-rings' },
      update: {},
      create: {
        id: 'item-onion-rings',
        name: 'Onion Rings',
        description: 'Crispy battered onion rings',
        price: 99,
        prepTime: 5,
        displayOrder: 2,
        categoryId: 'cat-sides',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-coca-cola' },
      update: {},
      create: {
        id: 'item-coca-cola',
        name: 'Coca Cola',
        description: 'Classic Coca Cola drink',
        price: 49,
        prepTime: 1,
        displayOrder: 1,
        categoryId: 'cat-drinks',
      },
    }),
    prisma.menuItem.upsert({
      where: { id: 'item-ice-cream' },
      update: {},
      create: {
        id: 'item-ice-cream',
        name: 'Ice Cream',
        description: 'Vanilla ice cream with chocolate sauce',
        price: 79,
        prepTime: 2,
        displayOrder: 1,
        categoryId: 'cat-desserts',
      },
    }),
  ])

  console.log('Created menu items')

  const hashedPassword = await hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'super@admin.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'super@admin.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@burgerpalace.com' },
    update: {},
    create: {
      name: 'Restaurant Admin',
      email: 'admin@burgerpalace.com',
      password: hashedPassword,
      role: 'RESTAURANT_ADMIN',
      restaurantId: restaurant.id,
    },
  })

  await prisma.user.upsert({
    where: { email: 'cook@burgerpalace.com' },
    update: {},
    create: {
      name: 'Chef Cook',
      email: 'cook@burgerpalace.com',
      password: hashedPassword,
      role: 'COOK',
      restaurantId: restaurant.id,
    },
  })

  console.log('Created users')

  await prisma.order.create({
    data: {
      orderNumber: '1001',
      status: 'PENDING',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      total: 377,
      subtotal: 349,
      tax: 28,
      notes: 'Extra pickles please',
      restaurantId: restaurant.id,
      items: {
        create: [
          {
            menuItemId: 'item-classic-burger',
            menuItemName: 'Classic Burger',
            quantity: 2,
            price: 149,
          },
          {
            menuItemId: 'item-fries',
            menuItemName: 'French Fries',
            quantity: 1,
            price: 79,
          },
        ],
      },
    },
  })

  console.log('Created sample orders')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
