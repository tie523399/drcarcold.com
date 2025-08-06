import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 搜尋參數
    const brand = searchParams.get('brand')
    const model = searchParams.get('model')
    const refrigerant = searchParams.get('refrigerant')
    const year = searchParams.get('year')
    const search = searchParams.get('search')

    // 建立查詢條件
    const where: any = {
      isActive: true
    }

    if (brand) {
      where.brand = {
        contains: brand
      }
    }

    if (model) {
      where.model = {
        contains: model
      }
    }

    if (refrigerant) {
      where.refrigerant = {
        contains: refrigerant
      }
    }

    if (year) {
      where.year = {
        contains: year
      }
    }

    if (search) {
      where.OR = [
        { brand: { contains: search } },
        { model: { contains: search } },
        { year: { contains: search } },
        { refrigerant: { contains: search } }
      ]
    }

    // 查詢車輛數據
    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: [
        { brand: 'asc' },
        { model: 'asc' },
        { year: 'asc' }
      ],
      skip,
      take: limit
    })

    // 獲取總數
    const total = await prisma.vehicle.count({ where })

    // 獲取品牌列表（用於篩選器）
    const brands = await prisma.vehicle.findMany({
      where: { isActive: true },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' }
    })

    // 獲取冷媒類型列表
    const refrigerants = await prisma.vehicle.findMany({
      where: { 
        isActive: true,
        refrigerant: { not: null }
      },
      select: { refrigerant: true },
      distinct: ['refrigerant'],
      orderBy: { refrigerant: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: vehicles,
      vehicleCount: total,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        brands: brands.map(b => b.brand),
        refrigerants: refrigerants.map(r => r.refrigerant).filter(Boolean)
      }
    })

  } catch (error) {
    console.error('查詢車輛數據失敗:', error)
    return NextResponse.json({
      success: false,
      error: `查詢車輛數據失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      brand,
      model,
      info,
      year,
      refrigerant,
      amount,
      oil,
      source = 'manual'
    } = body

    // 驗證必要欄位
    if (!brand || !model) {
      return NextResponse.json({
        success: false,
        error: '品牌和車型為必填欄位'
      }, { status: 400 })
    }

    // 創建車輛記錄
    const vehicle = await prisma.vehicle.create({
      data: {
        brand,
        model,
        info,
        year,
        refrigerant,
        amount,
        oil,
        source
      }
    })

    return NextResponse.json({
      success: true,
      data: vehicle,
      message: '車輛資料已新增'
    })

  } catch (error) {
    console.error('新增車輛數據失敗:', error)
    return NextResponse.json({
      success: false,
      error: '新增車輛數據失敗'
    }, { status: 500 })
  }
}