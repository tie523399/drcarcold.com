import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/vehicle-models
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('brandId')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (brandId) {
      where.brandId = brandId
    }
    
    if (search) {
      where.modelName = {
        contains: search,
      }
    }

    const models = await prisma.vehicleModel.findMany({
      where,
      include: {
        brand: true,
      },
      orderBy: [
        { modelName: 'asc' },
        { year: 'desc' },
      ],
    })

    return NextResponse.json(models)
  } catch (error) {
    console.error('Error fetching vehicle models:', error)
    return NextResponse.json(
      { error: '獲取車型資料失敗' },
      { status: 500 }
    )
  }
}

// POST /api/vehicle-models
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const model = await prisma.vehicleModel.create({
      data: body,
    })
    
    return NextResponse.json(model, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle model:', error)
    return NextResponse.json(
      { error: '創建車型失敗' },
      { status: 500 }
    )
  }
} 