import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      isActive: true
    }

    // 品牌篩選
    if (brand) {
      where.brand = {
        contains: brand
      }
    }

    // 關鍵字搜尋
    if (search) {
      where.OR = [
        { brand: { contains: search } },
        { model: { contains: search } },
        { year: { contains: search } },
        { info: { contains: search } },
        { refrigerant: { contains: search } }
      ]
    }

    // 分類篩選 (如果需要)
    if (category) {
      switch (category) {
        case 'regular':
          // 一般車輛 - 只查詢常見品牌
          where.brand = {
            in: ['TOYOTA', 'HONDA', 'NISSAN', 'MAZDA', 'SUBARU', 'SUZUKI', 'LEXUS', 'ACURA', 'INFINITI']
          }
          break
        case 'truck':
          // 大型車輛
          where.brand = {
            in: ['HINO', 'FUSO', 'ISUZU', 'MITSUBISHI']
          }
          break
        case 'malaysia':
          // 馬來西亞車輛
          where.brand = {
            in: ['PROTON', 'PERODUA']
          }
          break
      }
    }

    // 查詢車輛資料
    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: [
        { brand: 'asc' },
        { model: 'asc' },
        { year: 'desc' }
      ],
      take: limit
    })

    // 轉換為冷媒查詢格式
    const results = vehicles.map(vehicle => ({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      engineType: vehicle.info, // Vehicle表的額外資訊字段
      refrigerantType: vehicle.refrigerant,
      refrigerantAmount: vehicle.amount, // Vehicle表的冷媒量字段
      oilType: 'PAG', // 默認油類型
      oilAmount: vehicle.oil, // Vehicle表的冷凍油量字段
      notes: ''
    }))

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length
    })

  } catch (error) {
    console.error('冷媒查詢API錯誤:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '冷媒查詢失敗',
        data: []
      },
      { status: 500 }
    )
  }
}