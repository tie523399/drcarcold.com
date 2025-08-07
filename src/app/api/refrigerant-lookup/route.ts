import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// 🔄 統一冷媒查詢API - 使用VehicleModel架構
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandName = searchParams.get('brandName') || searchParams.get('brand')
    const modelName = searchParams.get('modelName')
    const year = searchParams.get('year')
    const refrigerant = searchParams.get('refrigerant')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const language = searchParams.get('language') || 'zh' // 新增語言參數，預設為中文
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}

    // 品牌篩選
    if (brandName) {
      where.brand = {
        OR: [
          { name: { contains: brandName } },
          { nameEn: { contains: brandName } }
        ]
      }
    }

    // 車型篩選 (支持中英文)
    if (modelName) {
      where.OR = [
        ...(where.OR || []),
        { modelName: { contains: modelName } },
        { modelNameEn: { contains: modelName } }
      ]
    }

    // 年份篩選
    if (year) {
      where.year = { contains: year }
    }

    // 冷媒類型篩選
    if (refrigerant) {
      where.refrigerantType = { contains: refrigerant }
    }

    // 分類篩選
    if (category) {
      where.brand = {
        ...where.brand,
        category: category
      }
    }

    // 關鍵字搜尋 (支持中英文)
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { modelName: { contains: search } },
        { modelNameEn: { contains: search } },
        { year: { contains: search } },
        { engine: { contains: search } },
        { engineEn: { contains: search } },
        { refrigerantType: { contains: search } },
        { notes: { contains: search } },
        { notesEn: { contains: search } },
        { brand: { 
          OR: [
            { name: { contains: search } },
            { nameEn: { contains: search } }
          ]
        } }
      ]
    }

    // 查詢車輛型號資料（使用VehicleModel + VehicleBrand）
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
      take: limit
    })

    // 轉換為雙語冷媒查詢格式
    const results = vehicles.map(vehicle => {
      const isEnglish = language === 'en'
      
      return {
        id: vehicle.id,
        // 品牌資訊 (根據語言選擇)
        brand: isEnglish ? vehicle.brand.nameEn : vehicle.brand.name,
        brandDisplay: isEnglish ? vehicle.brand.nameEn : vehicle.brand.name,
        brandCn: vehicle.brand.name,
        brandEn: vehicle.brand.nameEn,
        brandCategory: vehicle.brand.category,
        
        // 車輛基本資訊 (根據語言選擇)
        model: isEnglish ? (vehicle.modelNameEn || vehicle.modelName) : vehicle.modelName,
        modelCn: vehicle.modelName,
        modelEn: vehicle.modelNameEn || vehicle.modelName,
        year: vehicle.year,
        engine: isEnglish ? (vehicle.engineEn || vehicle.engine) : vehicle.engine,
        engineCn: vehicle.engine,
        engineEn: vehicle.engineEn || vehicle.engine,
        category: isEnglish ? (vehicle.categoryEn || vehicle.category) : vehicle.category,
        categoryCn: vehicle.category,
        categoryEn: vehicle.categoryEn || vehicle.category,
        
        // 冷媒資訊
        refrigerantType: vehicle.refrigerantType,
        refrigerantAmount: vehicle.refrigerantAmount,
        
        // 冷凍油資訊
        oilType: vehicle.oilType,
        oilAmount: vehicle.oilAmount,
        
        // 額外資訊 (根據語言選擇)
        notes: isEnglish ? (vehicle.notesEn || vehicle.notes || '') : (vehicle.notes || ''),
        notesCn: vehicle.notes || '',
        notesEn: vehicle.notesEn || '',
        
        // 語言和資料來源
        language: language,
        dataSource: vehicle.dataSource,
        
        // 向後兼容字段
        engineType: isEnglish ? (vehicle.engineEn || vehicle.engine) : vehicle.engine,
        fillAmount: vehicle.refrigerantAmount,
        
        // 完整的車輛型號資訊
        vehicleModel: {
          ...vehicle,
          brand: vehicle.brand
        }
      }
    })

    // 取得品牌統計
    const brandStats = await prisma.vehicleBrand.findMany({
      where: category ? { category } : {},
      include: {
        _count: {
          select: { models: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      brands: brandStats.map(brand => ({
        id: brand.id,
        name: brand.name,
        nameEn: brand.nameEn,
        category: brand.category,
        modelCount: brand._count.models
      }))
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