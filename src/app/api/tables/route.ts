import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const restaurantId = session?.user?.restaurantId as string | null

    if (!restaurantId) {
      return NextResponse.json({ error: 'No restaurant' }, { status: 401 })
    }

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: 'asc' },
    })

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('Failed to fetch tables:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const restaurantId = session?.user?.restaurantId as string | null

    if (!restaurantId) {
      return NextResponse.json({ error: 'No restaurant' }, { status: 401 })
    }

    const body = await req.json()
    const { number, name } = body

    if (!number) {
      return NextResponse.json({ error: 'Table number required' }, { status: 400 })
    }

    const existing = await prisma.table.findFirst({
      where: { restaurantId, number }
    })

    if (existing) {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 400 })
    }

    const table = await prisma.table.create({
      data: {
        number,
        name: name || `Table ${number}`,
        restaurantId
      }
    })

    return NextResponse.json({ table }, { status: 201 })
  } catch (error) {
    console.error('Failed to create table:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 })
    }

    await prisma.table.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete table:', error)
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 })
    }

    const body = await req.json()
    
    const updateData: Record<string, unknown> = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.status !== undefined) updateData.status = body.status
    
    const table = await prisma.table.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ table })
  } catch (error) {
    console.error('Failed to update table:', error)
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}
