/**
 * 🚗 車輛數據文件上傳API
 * 支援PDF和CSV檔案自動解析
 */

import { NextRequest, NextResponse } from 'next/server'
import { FileParser, VehicleData } from '@/lib/file-parsers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST
(request: NextRequest) {
  console.log('POST /api/vehicle-file-upload 被調用')
  
  try {
    // 測試FormData解析
    console.log('解析FormData...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    console.log('檔案檢查:', { hasFile: !!file, fileName: file?.name, fileSize: file?.size })
    
    if (!file) {
      console.log('無檔案，返回400')
      return NextResponse.json(
        { success: false, error: '請選擇要上傳的檔案' },
        { status: 400 }
      )
    }
    
    // 檢查檔案類型
    const allowedTypes = [
      'application/pdf', 
      'text/csv', 
      'application/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    const allowedExtensions = /\.(pdf|csv|xlsx|xls)$/i
    
    console.log('檔案類型檢查:', { fileType: file.type, fileName: file.name })
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
      console.log('檔案類型不支援')
      return NextResponse.json(
        { success: false, error: '只支援PDF、CSV和Excel檔案格式 (.pdf, .csv, .xlsx, .xls)' },
        { status: 400 }
      )
    }
    
    // 檢查檔案大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('檔案過大')
      return NextResponse.json(
        { success: false, error: '檔案大小不能超過10MB' },
        { status: 400 }
      )
    }
    
    console.log(`📄 開始解析檔案: ${file.name} (${file.size} bytes)`)
    
    // 檢查FileParser是否正常
    try {
      console.log('檢查FileParser...')
      if (!FileParser || typeof FileParser.parseVehicleFile !== 'function') {
        throw new Error('FileParser未正確導入或parseVehicleFile方法不存在')
      }
      console.log('FileParser正常')
    } catch (parserError) {
      console.error('FileParser檢查失敗:', parserError)
      return NextResponse.json({
        success: false,
        error: 'FileParser初始化失敗',
        details: parserError instanceof Error ? parserError.message : '未知錯誤'
      }, { status: 500 })
    }

    // 將File對象轉換為Buffer以確保兼容性
    console.log('轉換檔案格式...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('檔案轉換完成，大小:', buffer.length)

    // 解析檔案
    console.log('開始文件解析...')
    const parseResult = await FileParser.parseVehicleFile(buffer, file.name)
    console.log('解析結果:', { success: parseResult.success, dataLength: parseResult.data?.length })

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: '檔案解析失敗',
        details: parseResult.errors.join(', ')
      }, { status: 400 })
    }

    // 返回解析結果
    return NextResponse.json({
      success: true,
      data: parseResult.data,
      summary: parseResult.summary,
      errors: parseResult.errors,
      message: `成功解析 ${parseResult.data.length} 筆車輛數據`
    })
    
  } catch (error) {
    console.error('❌ 檔案上傳處理錯誤:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '檔案處理時發生錯誤',
        details: error instanceof Error ? error.message : '未知錯誤',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// 🎯 批量導入車輛數據
export async function PUT(request: NextRequest) {
  try {
    const { vehicles, action = 'preview' } = await request.json()
    
    if (!vehicles || !Array.isArray(vehicles)) {
      return NextResponse.json(
        { success: false, error: '無效的車輛數據' },
        { status: 400 }
      )
    }
    
    if (action === 'preview') {
      // 預覽模式：只返回處理結果，不實際寫入資料庫
      const processed = await processVehiclesForImport(vehicles)
      return NextResponse.json({
        success: true,
        preview: processed,
        message: `準備導入 ${processed.newBrands.length} 個新品牌、${processed.newModels.length} 個新型號`
      })
    }
    
    if (action === 'import') {
      // 導入模式：實際寫入資料庫
      const result = await importVehiclesToDatabase(vehicles)
      return NextResponse.json(result)
    }
    
    return NextResponse.json(
      { success: false, error: '無效的操作類型' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('❌ 車輛數據導入錯誤:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '數據導入時發生錯誤',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

// 🔄 處理車輛數據準備導入
async function processVehiclesForImport(vehicles: VehicleData[]) {
  const existingBrands = await prisma.vehicleBrand.findMany({
    select: { name: true, nameEn: true }
  })
  
  const existingModels = await prisma.vehicleModel.findMany({
    select: { modelName: true, brand: { select: { name: true } } }
  })
  
  const brandNames = new Set(existingBrands.map(b => b.name.toLowerCase()))
  const modelKeys = new Set(existingModels.map(m => `${m.brand.name.toLowerCase()}-${m.modelName.toLowerCase()}`))
  
  const newBrands: { name: string, nameEn?: string, category: string }[] = []
  const newModels: { 
    brandName: string, 
    modelName: string, 
    year?: string,
    refrigerantType?: string,
    fillAmount?: string,
    oilType?: string,
    oilAmount?: string,
    notes?: string
  }[] = []
  const duplicates: string[] = []
  
  // 分析車輛數據
  vehicles.forEach((vehicle) => {
    const brandKey = vehicle.brand.toLowerCase()
    const modelKey = `${brandKey}-${vehicle.model.toLowerCase()}`
    
    // 檢查品牌
    if (!brandNames.has(brandKey)) {
      const existingNewBrand = newBrands.find(b => b.name.toLowerCase() === brandKey)
      if (!existingNewBrand) {
        newBrands.push({
          name: vehicle.brand,
          nameEn: vehicle.brandEn,
          category: 'passenger' // 預設為轎車
        })
        brandNames.add(brandKey)
      }
    }
    
    // 檢查型號
    if (!modelKeys.has(modelKey)) {
      const existingNewModel = newModels.find(m => 
        m.brandName.toLowerCase() === brandKey && 
        m.modelName.toLowerCase() === vehicle.model.toLowerCase()
      )
      
      if (!existingNewModel) {
        newModels.push({
          brandName: vehicle.brand,
          modelName: vehicle.model,
          year: vehicle.year,
          refrigerantType: vehicle.refrigerantType || 'R134a',
          fillAmount: vehicle.fillAmount || '',
          oilType: vehicle.oilType,
          oilAmount: vehicle.oilAmount,
          notes: vehicle.notes
        })
        modelKeys.add(modelKey)
      }
    } else {
      duplicates.push(`${vehicle.brand} ${vehicle.model}`)
    }
  })
  
  return {
    newBrands,
    newModels,
    duplicates,
    summary: {
      totalVehicles: vehicles.length,
      newBrandsCount: newBrands.length,
      newModelsCount: newModels.length,
      duplicatesCount: duplicates.length
    }
  }
}

// 💾 將車輛數據導入資料庫
async function importVehiclesToDatabase(vehicles: VehicleData[]) {
  const processed = await processVehiclesForImport(vehicles)
  
  try {
    // 開始交易
    const result = await prisma.$transaction(async (tx) => {
      // 1. 創建新品牌
      const createdBrands: { [key: string]: string } = {}
      
      for (const brandData of processed.newBrands) {
        const brand = await tx.vehicleBrand.create({
          data: {
            name: brandData.name,
            nameEn: brandData.nameEn || brandData.name,
            category: brandData.category,
            order: 0
          }
        })
        createdBrands[brandData.name.toLowerCase()] = brand.id
      }
      
      // 獲取所有現有品牌ID
      const existingBrands = await tx.vehicleBrand.findMany({
        select: { id: true, name: true }
      })
      
      existingBrands.forEach(brand => {
        createdBrands[brand.name.toLowerCase()] = brand.id
      })
      
      // 2. 創建新型號
      const createdModels: string[] = []
      
      for (const modelData of processed.newModels) {
        const brandId = createdBrands[modelData.brandName.toLowerCase()]
        
        if (brandId) {
          const model = await tx.vehicleModel.create({
            data: {
              brandId: brandId,
              modelName: modelData.modelName,
              year: modelData.year,
              refrigerantType: modelData.refrigerantType || 'R134a',
              fillAmount: modelData.fillAmount || '',
              oilType: modelData.oilType,
              oilAmount: modelData.oilAmount,
              notes: modelData.notes
            }
          })
          createdModels.push(model.id)
        }
      }
      
      return {
        brandsCreated: processed.newBrands.length,
        modelsCreated: createdModels.length,
        duplicatesSkipped: processed.duplicates.length
      }
    })
    
    console.log(`✅ 成功導入: ${result.brandsCreated} 品牌, ${result.modelsCreated} 型號`)
    
    return {
      success: true,
      message: `成功導入 ${result.brandsCreated} 個品牌和 ${result.modelsCreated} 個型號`,
      result
    }
    
  } catch (error) {
    console.error('❌ 資料庫導入錯誤:', error)
    return {
      success: false,
      error: '資料庫寫入失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    }
  }
}

// 📋 獲取CSV範本
export async function GET() {
  try {
    console.log('GET /api/vehicle-file-upload called')
    
    const template = [
      '品牌,品牌英文,車款,型號英文,年份,排氣量,冷媒類型,充填量,油類型,油量,備註',
      'Toyota,Toyota,Camry,Camry,2020,2.0L,R1234yf,650g,PAG46,120ml,範例資料',
      'Honda,Honda,Civic,Civic,2019,1.5L,R134a,475g,PAG46,100ml,範例資料',
      'BMW,BMW,320i,320i,2021,2.0L,R1234yf,750g,PAG100,180ml,渦輪引擎'
    ].join('\n')

    return new NextResponse(template, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="vehicle_template.csv"',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      }
    })
    
  } catch (error) {
    console.error('GET /api/vehicle-file-upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Template generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 