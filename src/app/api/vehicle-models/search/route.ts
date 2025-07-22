import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandId = searchParams.get('brandId')
    const modelId = searchParams.get('modelId')
    const search = searchParams.get('search')

    const where: any = {}

    // 如果指定了品牌
    if (brandId) {
      where.brandId = brandId
    }

    // 如果指定了特定車型
    if (modelId) {
      where.id = modelId
    }

    // 如果有搜尋關鍵字
    if (search) {
      where.OR = [
        { modelName: { contains: search } },
        { engineType: { contains: search } },
        { refrigerantType: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    // @ts-ignore
    const models = await prisma.vehicleModel.findMany({
      where,
      include: {
        brand: true,
      },
      orderBy: [
        { brand: { name: 'asc' } },
        { modelName: 'asc' },
      ],
    })

    return NextResponse.json(models)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search models' },
      { status: 500 }
    )
  }
} 
 