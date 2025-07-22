/**
 * 🚗 車輛數據文件上傳API
 * 支援PDF和CSV檔案自動解析
 */

import { NextRequest, NextResponse } from 'next/server'
import { FileParser, VehicleData } from '@/lib/file-parsers'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
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
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
      return NextResponse.json(
        { success: false, error: '只支援PDF、CSV和Excel檔案格式 (.pdf, .csv, .xlsx, .xls)' },
        { status: 400 }
      )
    }
    
    // 檢查檔案大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '檔案大小不能超過10MB' },
        { status: 400 }
      )
    }
    
    console.log(`📄 開始解析檔案: ${file.name} (${file.size} bytes)`)
    
    // 解析檔案
    const parseResult = await FileParser.parseVehicleFile(file, file.name)
    
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: '檔案解析失敗',
        details: parseResult.errors
      }, { status: 400 })
    }
    
    console.log(`✅ 解析成功: ${parseResult.data.length} 筆車輛數據`)
    
    return NextResponse.json({
      success: true,
      message: `成功解析 ${parseResult.data.length} 筆車輛數據`,
      data: parseResult.data,
      summary: parseResult.summary,
      errors: parseResult.errors.length > 0 ? parseResult.errors : undefined
    })
    
  } catch (error) {
    console.error('❌ 檔案上傳處理錯誤:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '檔案處理時發生錯誤',
        details: error instanceof Error ? error.message : '未知錯誤'
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
    const template = `品牌,品牌英文,型號,型號英文,年份,引擎排氣量,冷媒類型,充填量,冷凍油類型,冷凍油量,備註
Toyota,Toyota,Camry,Camry,2020,2.0L,R1234yf,650g,PAG46,120ml,
Honda,Honda,Civic,Civic,2019,1.5L,R134a,475g,PAG46,100ml,
BMW,BMW,320i,320i,2021,2.0L,R1234yf,750g,PAG100,180ml,渦輪增壓
Mercedes-Benz,Mercedes-Benz,C-Class,C-Class,2022,2.0L,R1234yf,800g,PAG100,200ml,
Audi,Audi,A4,A4,2020,2.0L,R1234yf,720g,PAG100,160ml,
Nissan,Nissan,Altima,Altima,2019,2.5L,R134a,525g,PAG46,110ml,
Mazda,Mazda,CX-5,CX-5,2021,2.5L,R1234yf,680g,PAG46,140ml,SUV
Volkswagen,Volkswagen,Golf,Golf,2020,1.4L,R1234yf,450g,PAG46,90ml,渦輪增壓
Hyundai,Hyundai,Elantra,Elantra,2019,2.0L,R134a,500g,PAG46,105ml,
Kia,Kia,Forte,Forte,2020,2.0L,R134a,480g,PAG46,100ml,`
    
    return new NextResponse(template, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="冷媒充填量表範本.csv"'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '範本生成失敗' },
      { status: 500 }
    )
  }
} 