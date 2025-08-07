/**
 * 🚚 匯入所有車輛數據
 * 
 * 從以下來源提取並匯入完整的車輛數據：
 * 1. vehicles_bilingual.csv (2240+ 筆)
 * 2. vehicles_bilingual_import.json (2240+ 筆)
 * 3. 所有 vehicles_*.json 檔案
 * 4. 所有 bilingual_*.json 檔案
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

interface VehicleRecord {
  brandInfo: string
  model: string
  year?: string
  refrigerant: string
  amount: string
  oil?: string
  source: string
}

// 品牌映射
const brandMapping: Record<string, string> = {
  'ALFA ROMEO': 'Alfa Romeo',
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
  'INFINITI': 'Infiniti',
  'ACURA': 'Acura',
  'PROTON': 'Proton',
  'PERODUA': 'Perodua',
  'HYUNDAI': 'Hyundai',
  'KIA': 'Kia',
  'FORD': 'Ford',
  'CHEVROLET': 'Chevrolet',
  'GMC': 'GMC',
  'CHRYSLER': 'Chrysler',
  'JEEP': 'Jeep',
  'DODGE': 'Dodge',
  'CADILLAC': 'Cadillac',
  'BUICK': 'Buick',
  'PEUGEOT': 'Peugeot',
  'CITROEN': 'Citroën',
  'RENAULT': 'Renault',
  'FIAT': 'Fiat',
  'LANCIA': 'Lancia',
  'FERRARI': 'Ferrari',
  'LAMBORGHINI': 'Lamborghini',
  'MASERATI': 'Maserati',
  'JAGUAR': 'Jaguar',
  'LAND ROVER': 'Land Rover',
  'RANGE ROVER': 'Range Rover',
  'MINI': 'Mini',
  'ROLLS ROYCE': 'Rolls-Royce',
  'BENTLEY': 'Bentley',
  'ASTON MARTIN': 'Aston Martin',
  'VOLVO': 'Volvo',
  'SAAB': 'Saab',
  'SKODA': 'Škoda',
  'SEAT': 'SEAT',
  'OPEL': 'Opel',
  'VAUXHALL': 'Vauxhall',
  'SUZUKI': 'Suzuki',
  'DAIHATSU': 'Daihatsu',
  'ISUZU': 'Isuzu',
  'HINO': 'Hino',
  'FUSO': 'Fuso',
  'SCANIA': 'Scania',
  'MAN': 'MAN',
  'DAF': 'DAF',
  'IVECO': 'Iveco',
  'UNKNOWN': 'Other'
}

async function importAllVehicleData() {
  console.log('🚚 開始匯入所有車輛數據...')

  try {
    // 🗑️ 步驟1: 清空現有數據
    console.log('🗑️ 清空現有車輛數據...')
    await prisma.$transaction(async (tx) => {
      await tx.vehicleModel.deleteMany({})
      await tx.vehicleBrand.deleteMany({})
      console.log('✅ 現有數據已清空')
    })

    const allVehicleData: VehicleRecord[] = []

    // 📄 步驟2: 處理 CSV 檔案
    console.log('📄 處理 vehicles_bilingual.csv...')
    const csvData = await processCsvFile()
    allVehicleData.push(...csvData)
    console.log(`✅ CSV 處理完成: ${csvData.length} 筆`)

    // 📊 步驟3: 處理 JSON 檔案
    console.log('📊 處理 vehicles_bilingual_import.json...')
    const jsonData = await processJsonFile()
    allVehicleData.push(...jsonData)
    console.log(`✅ JSON 處理完成: ${jsonData.length} 筆`)

    // 🔍 步驟4: 處理個別品牌 JSON 檔案
    console.log('🔍 處理個別品牌 JSON 檔案...')
    const brandJsonData = await processBrandJsonFiles()
    allVehicleData.push(...brandJsonData)
    console.log(`✅ 品牌JSON處理完成: ${brandJsonData.length} 筆`)

    // 🧹 步驟5: 清理和去重
    console.log('🧹 清理和去重數據...')
    const cleanedData = cleanAndDeduplicateData(allVehicleData)
    console.log(`✅ 清理完成: ${cleanedData.length} 筆有效數據`)

    // 💾 步驟6: 匯入數據庫
    console.log('💾 開始匯入數據庫...')
    const importResult = await importToDatabase(cleanedData)

    console.log('🎉 全部車輛數據匯入完成！')
    console.log(`📊 最終統計:`)
    console.log(`   • 總處理數據: ${allVehicleData.length} 筆`)
    console.log(`   • 有效數據: ${cleanedData.length} 筆`)
    console.log(`   • 創建品牌: ${importResult.brandsCreated} 個`)
    console.log(`   • 創建車型: ${importResult.modelsCreated} 筆`)
    console.log(`   • 跳過重複: ${importResult.duplicatesSkipped} 筆`)
    console.log(`   • 自動填充冷媒: ${cleanedData.filter(d => d.refrigerant === 'R1234yf' && d.source.includes('auto-fill')).length} 筆`)

  } catch (error) {
    console.error('❌ 匯入失敗:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 處理 CSV 檔案
async function processCsvFile(): Promise<VehicleRecord[]> {
  const records: VehicleRecord[] = []
  
  try {
    const csvContent = fs.readFileSync('./vehicles_bilingual.csv', 'utf-8')
    const rows = parse(csvContent, {
      skip_empty_lines: true,
      trim: true
    })

    // 跳過標題行
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length < 5) continue

      const brandInfo = cleanString(row[0]) || 'Unknown'
      const model = cleanString(row[1])
      const year = cleanString(row[3])
      const refrigerant = processRefrigerant(cleanString(row[4]))
      const amount = cleanString(row[5])
      const oil = cleanString(row[6])

      if (model && brandInfo !== 'Unknown') {
        records.push({
          brandInfo: extractBrandFromBilingual(brandInfo),
          model: extractModelFromBilingual(model),
          year,
          refrigerant,
          amount,
          oil,
          source: 'csv_bilingual'
        })
      }
    }
  } catch (error) {
    console.error('CSV 處理錯誤:', error)
  }

  return records
}

// 處理主要 JSON 檔案
async function processJsonFile(): Promise<VehicleRecord[]> {
  const records: VehicleRecord[] = []
  
  try {
    const jsonContent = fs.readFileSync('./vehicles_bilingual_import.json', 'utf-8')
    const data = JSON.parse(jsonContent)

    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        const brandInfo = item.brand?.zh || item.brand?.en || 'Unknown'
        const model = item.model?.zh || item.model?.en || ''
        const year = item.year || ''
        const refrigerant = processRefrigerant(item.refrigerant || '')
        const amount = item.amount || ''
        const oil = item.oil || ''

        if (model && brandInfo !== 'Unknown') {
          records.push({
            brandInfo,
            model,
            year,
            refrigerant,
            amount,
            oil,
            source: 'json_bilingual'
          })
        }
      }
    }
  } catch (error) {
    console.error('JSON 處理錯誤:', error)
  }

  return records
}

// 處理個別品牌 JSON 檔案
async function processBrandJsonFiles(): Promise<VehicleRecord[]> {
  const records: VehicleRecord[] = []
  
  try {
    const jsonFiles = fs.readdirSync('.').filter(file => 
      file.startsWith('vehicles_') && file.endsWith('.json') && 
      file !== 'vehicles_bilingual_import.json'
    )

    for (const file of jsonFiles) {
      try {
        const content = fs.readFileSync(`./${file}`, 'utf-8')
        const data = JSON.parse(content)
        
        const brandName = file.replace('vehicles_', '').replace('.json', '')
        const standardBrand = brandMapping[brandName.toUpperCase()] || brandName

        if (Array.isArray(data)) {
          for (const item of data) {
            const model = item.model || item.name || ''
            const year = item.year || ''
            const refrigerant = processRefrigerant(item.refrigerant || item.refrigerantType || '')
            const amount = item.amount || item.fillAmount || ''
            const oil = item.oil || item.oilAmount || ''

            if (model) {
              records.push({
                brandInfo: standardBrand,
                model,
                year,
                refrigerant,
                amount,
                oil,
                source: `json_${brandName}`
              })
            }
          }
        }
      } catch (error) {
        console.warn(`跳過檔案 ${file}:`, error.message)
      }
    }
  } catch (error) {
    console.error('品牌JSON處理錯誤:', error)
  }

  return records
}

// 從雙語格式中提取品牌
function extractBrandFromBilingual(input: string): string {
  if (!input) return 'Unknown'
  
  const parts = input.split(' / ')
  const brandPart = parts[0] || input
  
  // 移除常見的冷媒相關詞彙
  const cleaned = brandPart
    .replace(/汽車冷媒填充資訊/g, '')
    .replace(/冷媒充填量表/g, '')
    .replace(/冷媒填充資訊/g, '')
    .trim()
  
  return brandMapping[cleaned.toUpperCase()] || cleaned || 'Unknown'
}

// 從雙語格式中提取車型
function extractModelFromBilingual(input: string): string {
  if (!input) return ''
  
  const parts = input.split(' / ')
  return parts[0] || input
}

// 清理字串
function cleanString(input: any): string {
  if (!input) return ''
  return String(input).trim().replace(/\s+/g, ' ')
}

// 處理冷媒類型
function processRefrigerant(input: string): string {
  if (!input || input.trim() === '' || input === '-') {
    return 'R1234yf' // 空白自動填入 R1234yf
  }
  
  const cleaned = input.replace(/→/g, '/').trim()
  
  // 標準化常見格式
  if (cleaned.includes('R12') && cleaned.includes('R134a')) {
    return 'R12→R134a'
  }
  if (cleaned.includes('R134a') && cleaned.includes('R1234yf')) {
    return 'R134a/R1234yf'
  }
  
  return cleaned
}

// 清理和去重
function cleanAndDeduplicateData(data: VehicleRecord[]): VehicleRecord[] {
  const seen = new Set<string>()
  const cleaned: VehicleRecord[] = []
  
  for (const record of data) {
    // 創建唯一鍵
    const key = `${record.brandInfo}|${record.model}|${record.year}`.toLowerCase()
    
    if (!seen.has(key) && record.brandInfo !== 'Unknown' && record.model) {
      seen.add(key)
      
      // 標記自動填充的冷媒
      if (record.refrigerant === 'R1234yf' && !record.source.includes('auto-fill')) {
        record.source += '_auto-fill'
      }
      
      cleaned.push(record)
    }
  }
  
  return cleaned
}

// 匯入到數據庫
async function importToDatabase(records: VehicleRecord[]) {
  const result = {
    brandsCreated: 0,
    modelsCreated: 0,
    duplicatesSkipped: 0,
    errors: [] as string[]
  }

  await prisma.$transaction(async (tx) => {
    // 處理品牌
    const brandMap = new Map<string, string>()
    const processedBrands = new Set<string>()

    for (const record of records) {
      if (processedBrands.has(record.brandInfo)) continue
      processedBrands.add(record.brandInfo)

      let brand = await tx.vehicleBrand.findFirst({
        where: { name: record.brandInfo }
      })

      if (!brand) {
        brand = await tx.vehicleBrand.create({
          data: {
            name: record.brandInfo,
            nameEn: record.brandInfo,
            category: categorizeBrand(record.brandInfo)
          }
        })
        result.brandsCreated++
        console.log(`🆕 創建品牌: ${record.brandInfo}`)
      }

      brandMap.set(record.brandInfo, brand.id)
    }

    // 處理車型
    for (const record of records) {
      const brandId = brandMap.get(record.brandInfo)
      if (!brandId) continue

      try {
        const existing = await tx.vehicleModel.findFirst({
          where: {
            brandId,
            modelName: record.model,
            year: record.year || undefined
          }
        })

        if (!existing) {
          await tx.vehicleModel.create({
            data: {
              brandId,
              modelName: record.model,
              year: record.year || undefined,
              refrigerantType: record.refrigerant,
              fillAmount: record.amount,
              oilAmount: record.oil || undefined,
              notes: `來源: ${record.source}`
            }
          })
          result.modelsCreated++
          
          if (result.modelsCreated % 100 === 0) {
            console.log(`💾 已匯入 ${result.modelsCreated} 筆車型`)
          }
        } else {
          result.duplicatesSkipped++
        }
      } catch (error) {
        result.errors.push(`創建車型失敗: ${record.brandInfo} ${record.model}`)
      }
    }
  })

  return result
}

// 品牌分類
function categorizeBrand(brandName: string): 'REGULAR' | 'LUXURY' | 'TRUCK' | 'MALAYSIA' | 'OTHER' {
  const brand = brandName.toUpperCase()

  // 豪華品牌
  if (['AUDI', 'BMW', 'MERCEDES-BENZ', 'PORSCHE', 'FERRARI', 'LAMBORGHINI', 'MASERATI', 
       'JAGUAR', 'LAND ROVER', 'RANGE ROVER', 'LEXUS', 'INFINITI', 'ACURA',
       'ROLLS-ROYCE', 'BENTLEY', 'ASTON MARTIN'].includes(brand)) {
    return 'LUXURY'
  }

  // 馬來西亞品牌
  if (['PROTON', 'PERODUA', 'NAZA'].includes(brand)) {
    return 'MALAYSIA'
  }

  // 卡車品牌
  if (['HINO', 'FUSO', 'ISUZU', 'SCANIA', 'VOLVO', 'MAN', 'DAF', 'IVECO'].includes(brand)) {
    return 'TRUCK'
  }

  return 'REGULAR'
}

// 執行腳本
if (require.main === module) {
  importAllVehicleData()
    .then(() => {
      console.log('🎉 全部數據匯入完成！')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 匯入失敗:', error)
      process.exit(1)
    })
}

export { importAllVehicleData }