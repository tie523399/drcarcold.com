import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 🔄 統一車輛數據API - 使用VehicleModel架構
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 分頁參數
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 搜尋參數
    const brandName = searchParams.get('brand')
    const modelName = searchParams.get('model')
    const refrigerant = searchParams.get('refrigerant')
    const year = searchParams.get('year')
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    // 建立查詢條件
    const where: any = {}

    if (brandName) {
      where.brand = {
        OR: [
          { name: { contains: brandName } },
          { nameEn: { contains: brandName } }
        ]
      }
    }

    if (modelName) {
      where.modelName = {
        contains: modelName
      }
    }

    if (refrigerant) {
      where.refrigerantType = {
        contains: refrigerant
      }
    }

    if (year) {
      where.year = {
        contains: year
      }
    }

    if (category) {
      where.brand = {
        ...where.brand,
        category: category
      }
    }

    if (search) {
      where.OR = [
        { modelName: { contains: search } },
        { year: { contains: search } },
        { refrigerantType: { contains: search } },
        { engineType: { contains: search } },
        { brand: { 
          OR: [
            { name: { contains: search } },
            { nameEn: { contains: search } }
          ]
        } }
      ]
    }

    // 查詢車輛型號數據（使用VehicleModel表格）
    const vehicles = await prisma.vehicleModel.findMany({
      where,
      include: {
        brand: true
      },
      orderBy: [
        { brand: { name: 'asc' } },
        { modelName: 'asc' },
        { year: 'desc' }
      ],
      skip,
      take: limit
    })

    // 獲取總數
    const total = await prisma.vehicleModel.count({ where })

    // 獲取品牌列表（用於篩選器）
    const brands = await prisma.vehicleBrand.findMany({
      select: { 
        id: true,
        name: true, 
        nameEn: true,
        category: true 
      },
      orderBy: { name: 'asc' }
    })

    // 獲取冷媒類型列表
    const refrigerants = await prisma.vehicleModel.findMany({
      select: { refrigerantType: true },
      distinct: ['refrigerantType'],
      orderBy: { refrigerantType: 'asc' }
    })

    // 獲取年份列表
    const years = await prisma.vehicleModel.findMany({
      where: { year: { not: null } },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' }
    })

    // 轉換為舊格式兼容（保持向後兼容）
    const formattedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      brand: vehicle.brand.name,
      brandEn: vehicle.brand.nameEn,
      model: vehicle.modelName,
      info: vehicle.engineType,
      year: vehicle.year,
      refrigerant: vehicle.refrigerantType,
      amount: vehicle.fillAmount,
      oil: vehicle.oilAmount,
      source: 'vehicleModel',
      isActive: true,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      // 新架構的完整數據
      vehicleModel: {
        ...vehicle,
        brand: vehicle.brand
      }
    }))

    return NextResponse.json({
      success: true,
      data: formattedVehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        brands: brands.map(b => ({
          value: b.name,
          label: b.name,
          labelEn: b.nameEn,
          category: b.category
        })),
        refrigerants: refrigerants
          .filter(r => r.refrigerantType)
          .map(r => ({
            value: r.refrigerantType,
            label: r.refrigerantType
          })),
        years: years
          .filter(y => y.year)
          .map(y => ({
            value: y.year,
            label: y.year
          }))
      }
    })

  } catch (error) {
    console.error('車輛數據查詢失敗:', error)
    return NextResponse.json({
      success: false,
      error: '查詢車輛數據失敗'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      brandId,
      brandName,
      modelName,
      year,
      engineType,
      refrigerantType,
      fillAmount,
      oilType,
      oilAmount,
      notes
    } = body

    // 驗證必要欄位
    if (!modelName || !refrigerantType || !fillAmount) {
      return NextResponse.json({
        success: false,
        error: '車型名稱、冷媒類型和充填量為必填欄位'
      }, { status: 400 })
    }

    let targetBrandId = brandId

    // 如果沒有提供品牌ID但有品牌名稱，嘗試查找或創建品牌
    if (!targetBrandId && brandName) {
      let brand = await prisma.vehicleBrand.findFirst({
        where: {
          OR: [
            { name: brandName },
            { nameEn: brandName }
          ]
        }
      })

      if (!brand) {
        // 創建新品牌
        brand = await prisma.vehicleBrand.create({
          data: {
            name: brandName,
            nameEn: brandName,
            category: 'regular', // 預設類別
            order: 0
          }
        })
      }

      targetBrandId = brand.id
    }

    if (!targetBrandId) {
      return NextResponse.json({
        success: false,
        error: '必須提供有效的品牌ID或品牌名稱'
      }, { status: 400 })
    }

    // 創建車輛型號記錄
    const vehicleModel = await prisma.vehicleModel.create({
      data: {
        brandId: targetBrandId,
        modelName,
        year,
        engineType,
        refrigerantType,
        fillAmount,
        oilType,
        oilAmount,
        notes
      },
      include: {
        brand: true
      }
    })

    return NextResponse.json({
      success: true,
      data: vehicleModel,
      message: '車輛型號資料已新增'
    })

  } catch (error) {
    console.error('新增車輛型號失敗:', error)
    return NextResponse.json({
      success: false,
      error: '新增車輛型號失敗'
    }, { status: 500 })
  }
}