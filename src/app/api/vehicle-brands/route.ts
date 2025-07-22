import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/vehicle-brands
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category ? { category } : {}

    const brands = await prisma.vehicleBrand.findMany({
      where,
      include: {
        _count: {
          select: { models: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching vehicle brands:', error)
    return NextResponse.json(
      { error: '獲取品牌列表失敗' },
      { status: 500 }
    )
  }
}

// POST /api/vehicle-brands
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const brand = await prisma.vehicleBrand.create({
      data: body,
    })
    
    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle brand:', error)
    return NextResponse.json(
      { error: '創建品牌失敗' },
      { status: 500 }
    )
  }
} 