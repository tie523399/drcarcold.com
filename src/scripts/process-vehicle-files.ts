/**
 * 🚗 處理車輛檔案並匯入數據庫
 * 
 * 📊 處理結構：
 * 欄位1: 品牌+汽車冷媒填充資訊
 * 欄位2: 車型
 * 欄位3: 年份  
 * 欄位4: 冷媒類型 (空白→R1234yf)
 * 欄位5: 冷媒量
 * 欄位6: 冷凍油
 * 
 * 每一行都是一條數據
 */

import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// 🔄 每一行都是一條數據的結構
interface VehicleDataRow {
  brandAndInfo: string  // 欄位1: 品牌+汽車冷媒填充資訊
  model: string         // 欄位2: 車型
  year: string          // 欄位3: 年份
  refrigerant: string   // 欄位4: 冷媒類型 (空白→R1234yf)
  amount: string        // 欄位5: 冷媒量
  oil: string          // 欄位6: 冷凍油
}

interface ProcessingResult {
  success: boolean
  processed: number
  skipped: number
  errors: string[]
  data: VehicleDataRow[]
}

// 品牌映射和提取
const brandMapping: Record<string, string> = {
  'AUDI': 'Audi',
  'BMW': 'BMW', 
  'MERCEDES': 'Mercedes-Benz',
  'MERCEDES-BENZ': 'Mercedes-Benz',
  'VOLKSWAGEN': 'Volkswagen',
  'VW': 'Volkswagen',
  'PORSCHE': 'Porsche',
  'TOYOTA': 'Toyota',
  'HONDA': 'Honda',
  'NISSAN': 'Nissan',
  'MAZDA': 'Mazda',
  'MITSUBISHI': 'Mitsubishi',
  'SUBARU': 'Subaru',
  'LEXUS': 'Lexus',
  'PROTON': 'Proton',
  'PERODUA': 'Perodua',
  'HYUNDAI': 'Hyundai',
  'KIA': 'Kia',
  'FORD': 'Ford',
  'CHEVROLET': 'Chevrolet',
  'PEUGEOT': 'Peugeot',
  'CITROEN': 'Citroën'
}

// 從品牌+汽車冷媒填充資訊欄位中提取品牌名稱
function extractBrand(brandAndInfo: string): string {
  if (!brandAndInfo) return ''
  
  const cleaned = brandAndInfo.toUpperCase().trim()
  
  // 🔍 處理常見的品牌+冷媒填充資訊格式
  // 例如: "AUDI 汽車冷媒填充資訊", "BMW 冷媒充填量表", "TOYOTA Air Conditioning"
  
  // 移除常見的冷媒相關詞彙
  const cleanedBrand = cleaned
    .replace(/汽車冷媒填充資訊/g, '')
    .replace(/冷媒充填量表/g, '')
    .replace(/冷媒填充資訊/g, '')
    .replace(/冷媒充填量/g, '')
    .replace(/冷媒資訊/g, '')
    .replace(/AIR\s*CONDITIONING/g, '')
    .replace(/A\/C\s*SYSTEM/g, '')
    .replace(/REFRIGERANT\s*INFO/g, '')
    .replace(/REFRIGERANT\s*DATA/g, '')
    .replace(/系統/g, '')
    .replace(/資料/g, '')
    .replace(/數據/g, '')
    .trim()
  
  // 尋找已知品牌
  for (const [key, value] of Object.entries(brandMapping)) {
    if (cleanedBrand.includes(key)) {
      return value
    }
  }
  
  // 如果找不到，取第一個詞作為品牌
  const firstWord = cleanedBrand.split(/[\s\/\-\+]+/)[0]
  if (firstWord && firstWord.length > 0) {
    return brandMapping[firstWord] || firstWord
  }
  
  // 最後回退到原始輸入的第一個詞
  const originalFirst = cleaned.split(/[\s\/\-\+]+/)[0]
  return brandMapping[originalFirst] || originalFirst
}

// 清理數據
function cleanData(value: any): string {
  if (!value) return ''
  return String(value).trim().replace(/\s+/g, ' ')
}

// 處理冷媒類型 - 空白自動填入 R1234yf
function processRefrigerant(refrigerant: any): string {
  const cleaned = cleanData(refrigerant)
  if (!cleaned || cleaned === '' || cleaned === '-') {
    return 'R1234yf'  // 🔄 空白自動填入 R1234yf
  }
  return cleaned
}

// 處理Excel檔案
export async function processExcelFile(filePath: string): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    success: false,
    processed: 0,
    skipped: 0,
    errors: [],
    data: []
  }

  try {
    console.log('📊 開始處理Excel檔案:', filePath)
    
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    console.log('📋 Excel總行數:', jsonData.length)

    // 跳過空行和標題行
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      
      // 跳過空行或欄位不足的行
      if (!row || row.length < 6) {
        result.skipped++
        continue
      }

      try {
        const vehicleData: VehicleDataRow = {
          brandAndInfo: cleanData(row[0]),     // 欄位1: 品牌+汽車冷媒填充資訊
          model: cleanData(row[1]),            // 欄位2: 車型
          year: cleanData(row[2]),             // 欄位3: 年份
          refrigerant: processRefrigerant(row[3]), // 欄位4: 冷媒類型 (空白→R1234yf)
          amount: cleanData(row[4]),           // 欄位5: 冷媒量
          oil: cleanData(row[5])              // 欄位6: 冷凍油
        }

        // 提取品牌
        const brand = extractBrand(vehicleData.brandAndInfo)
        
        // 驗證必要欄位
        if (!brand || !vehicleData.model) {
          console.log(`⚠️  跳過第 ${i+1} 行: 品牌或車型為空`)
          result.skipped++
          continue
        }

        result.data.push({
          ...vehicleData,
          brandAndInfo: brand // 替換為提取的品牌名稱
        })
        result.processed++

        // 顯示處理進度
        if (result.processed % 100 === 0) {
          console.log(`✅ 已處理 ${result.processed} 筆數據`)
        }

      } catch (error) {
        result.errors.push(`第 ${i+1} 行處理錯誤: ${error}`)
        result.skipped++
      }
    }

    result.success = true
    console.log(`✅ Excel處理完成: 處理${result.processed}筆, 跳過${result.skipped}筆`)
    return result

  } catch (error) {
    console.error('❌ Excel處理錯誤:', error)
    result.errors.push(`Excel處理錯誤: ${error}`)
    return result
  }
}

// 處理CSV檔案
export async function processCsvFile(filePath: string): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    success: false,
    processed: 0,
    skipped: 0,
    errors: [],
    data: []
  }

  try {
    console.log('📄 開始處理CSV檔案:', filePath)
    
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const rows = parse(fileContent, {
      skip_empty_lines: true,
      trim: true
    })

    console.log('📋 CSV總行數:', rows.length)

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // 跳過空行或欄位不足的行
      if (!row || row.length < 6) {
        result.skipped++
        continue
      }

      try {
        const vehicleData: VehicleDataRow = {
          brandAndInfo: cleanData(row[0]),     // 欄位1: 品牌+汽車冷媒填充資訊
          model: cleanData(row[1]),            // 欄位2: 車型
          year: cleanData(row[2]),             // 欄位3: 年份
          refrigerant: processRefrigerant(row[3]), // 欄位4: 冷媒類型 (空白→R1234yf)
          amount: cleanData(row[4]),           // 欄位5: 冷媒量
          oil: cleanData(row[5])              // 欄位6: 冷凍油
        }

        // 提取品牌
        const brand = extractBrand(vehicleData.brandAndInfo)
        
        // 驗證必要欄位
        if (!brand || !vehicleData.model) {
          console.log(`⚠️  跳過第 ${i+1} 行: 品牌或車型為空`)
          result.skipped++
          continue
        }

        result.data.push({
          ...vehicleData,
          brandAndInfo: brand // 替換為提取的品牌名稱
        })
        result.processed++

        // 顯示處理進度
        if (result.processed % 100 === 0) {
          console.log(`✅ 已處理 ${result.processed} 筆數據`)
        }

      } catch (error) {
        result.errors.push(`第 ${i+1} 行處理錯誤: ${error}`)
        result.skipped++
      }
    }

    result.success = true
    console.log(`✅ CSV處理完成: 處理${result.processed}筆, 跳過${result.skipped}筆`)
    return result

  } catch (error) {
    console.error('❌ CSV處理錯誤:', error)
    result.errors.push(`CSV處理錯誤: ${error}`)
    return result
  }
}

// 匯入到數據庫
export async function importToDatabase(vehicleData: VehicleDataRow[]): Promise<{
  success: boolean
  imported: number
  errors: string[]
}> {
  const result = {
    success: false,
    imported: 0,
    errors: []
  }

  try {
    console.log(`🗄️  開始匯入 ${vehicleData.length} 筆數據到數據庫`)

    for (let i = 0; i < vehicleData.length; i++) {
      const data = vehicleData[i]
      
      try {
        // 使用 brandAndInfo 作為品牌名稱（已經過處理）
        const brandName = data.brandAndInfo
        
        // 先找到或創建品牌
        let brand = await prisma.vehicleBrand.findFirst({
          where: { name: brandName }
        })

        if (!brand) {
          brand = await prisma.vehicleBrand.create({
            data: {
              name: brandName,
              displayName: brandName,
              category: 'OTHER'
            }
          })
          console.log(`🆕 創建新品牌: ${brandName}`)
        }

        // 檢查是否已存在相同的車型數據
        const existingModel = await prisma.vehicleModel.findFirst({
          where: {
            brandId: brand.id,
            name: data.model,
            year: data.year
          }
        })

        if (!existingModel) {
          await prisma.vehicleModel.create({
            data: {
              brandId: brand.id,
              name: data.model,
              year: data.year,
              refrigerant: data.refrigerant,
              refrigerantAmount: data.amount,
              oilAmount: data.oil
            }
          })
          result.imported++
          
          // 顯示匯入進度
          if (result.imported % 50 === 0) {
            console.log(`💾 已匯入 ${result.imported} 筆數據`)
          }
        } else {
          console.log(`⚠️  跳過重複數據: ${brandName} ${data.model} ${data.year}`)
        }

      } catch (error) {
        result.errors.push(`數據庫匯入錯誤 ${data.brandAndInfo} ${data.model}: ${error}`)
      }
    }

    result.success = true
    console.log(`✅ 數據庫匯入完成: 成功匯入 ${result.imported} 筆數據`)
    return result

  } catch (error) {
    console.error('❌ 數據庫操作錯誤:', error)
    result.errors.push(`數據庫操作錯誤: ${error}`)
    return result
  } finally {
    await prisma.$disconnect()
  }
}

// 主要處理函數
export async function processVehicleFiles(filePaths: string[]): Promise<{
  success: boolean
  totalProcessed: number
  totalImported: number
  errors: string[]
}> {
  console.log('🚀 開始處理車輛數據檔案')
  
  const overallResult = {
    success: false,
    totalProcessed: 0,
    totalImported: 0,
    errors: []
  }

  const allVehicleData: VehicleDataRow[] = []

  for (const filePath of filePaths) {
    console.log(`📁 處理檔案: ${filePath}`)
    
    const ext = path.extname(filePath).toLowerCase()
    let processingResult: ProcessingResult

    if (ext === '.xlsx' || ext === '.xls') {
      processingResult = await processExcelFile(filePath)
    } else if (ext === '.csv') {
      processingResult = await processCsvFile(filePath)
    } else {
      overallResult.errors.push(`不支援的檔案格式: ${ext}`)
      continue
    }

    if (processingResult.success) {
      allVehicleData.push(...processingResult.data)
      overallResult.totalProcessed += processingResult.processed
      overallResult.errors.push(...processingResult.errors)
    } else {
      overallResult.errors.push(...processingResult.errors)
    }
  }

  // 匯入到數據庫
  if (allVehicleData.length > 0) {
    console.log(`📊 準備匯入 ${allVehicleData.length} 筆處理後的數據`)
    const importResult = await importToDatabase(allVehicleData)
    overallResult.totalImported = importResult.imported
    overallResult.errors.push(...importResult.errors)
    overallResult.success = importResult.success
  }

  console.log('🎉 處理完成!')
  return overallResult
}