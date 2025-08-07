import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as fs from 'fs'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

const prisma = new PrismaClient()

interface VehicleData {
  brand: string           // 品牌中文名
  brandEn: string        // 品牌英文名
  category: string       // 類別
  model: string          // 車型
  information: string    // 資訊欄位
  year: string           // 年份
  refrigerant: string    // 冷媒類型
  amount: string         // 冷媒量
  oil: string           // 冷凍油量
}

// 品牌映射表（英文 -> 中文）
const brandMappings: { [key: string]: { cn: string, en: string, category: string } } = {
  'VOLKSWAGEN': { cn: '福斯', en: 'VOLKSWAGEN', category: 'EUROPEAN' },
  'VOLVO': { cn: '富豪', en: 'VOLVO', category: 'LUXURY' },
  'VOLVO TRUCK': { cn: '富豪卡車', en: 'VOLVO TRUCK', category: 'REGULAR' },
  'BMW': { cn: 'BMW', en: 'BMW', category: 'LUXURY' },
  'MERCEDES-BENZ': { cn: '賓士', en: 'MERCEDES-BENZ', category: 'LUXURY' },
  'MERCEDES': { cn: '賓士', en: 'MERCEDES-BENZ', category: 'LUXURY' },
  'AUDI': { cn: '奧迪', en: 'AUDI', category: 'LUXURY' },
  'TOYOTA': { cn: '豐田', en: 'TOYOTA', category: 'JAPANESE' },
  'HONDA': { cn: '本田', en: 'HONDA', category: 'JAPANESE' },
  'NISSAN': { cn: '日產', en: 'NISSAN', category: 'JAPANESE' },
  'MAZDA': { cn: '馬自達', en: 'MAZDA', category: 'JAPANESE' },
  'MITSUBISHI': { cn: '三菱', en: 'MITSUBISHI', category: 'JAPANESE' },
  'SUBARU': { cn: '速霸陸', en: 'SUBARU', category: 'JAPANESE' },
  'HYUNDAI': { cn: '現代', en: 'HYUNDAI', category: 'KOREAN' },
  'KIA': { cn: '起亞', en: 'KIA', category: 'KOREAN' },
  'FORD': { cn: '福特', en: 'FORD', category: 'AMERICAN' },
  'CHEVROLET': { cn: '雪佛蘭', en: 'CHEVROLET', category: 'AMERICAN' },
  'PORSCHE': { cn: '保時捷', en: 'PORSCHE', category: 'LUXURY' },
  'LEXUS': { cn: '凌志', en: 'LEXUS', category: 'LUXURY' },
  'INFINITI': { cn: '英菲尼迪', en: 'INFINITI', category: 'LUXURY' },
  'ACURA': { cn: '謳歌', en: 'ACURA', category: 'LUXURY' },
  'TESLA': { cn: '特斯拉', en: 'TESLA', category: 'LUXURY' },
  'JAGUAR': { cn: '捷豹', en: 'JAGUAR', category: 'LUXURY' },
  'LAND ROVER': { cn: '路虎', en: 'LAND ROVER', category: 'LUXURY' },
  'ALFA ROMEO': { cn: '愛快.羅密歐', en: 'ALFA ROMEO', category: 'EUROPEAN' },
  'FIAT': { cn: '飛雅特', en: 'FIAT', category: 'EUROPEAN' },
  'CITROEN': { cn: '雪鐵龍', en: 'CITROEN', category: 'EUROPEAN' },
  'PEUGEOT': { cn: '寶獅', en: 'PEUGEOT', category: 'EUROPEAN' },
  'RENAULT': { cn: '雷諾', en: 'RENAULT', category: 'EUROPEAN' },
  'OPEL': { cn: '歐寶', en: 'OPEL', category: 'EUROPEAN' },
  'SKODA': { cn: '斯柯達', en: 'SKODA', category: 'EUROPEAN' },
  'MINI': { cn: '迷你', en: 'MINI', category: 'LUXURY' },
  'SMART': { cn: 'SMART', en: 'SMART', category: 'EUROPEAN' },
  'SUZUKI': { cn: '鈴木', en: 'SUZUKI', category: 'JAPANESE' },
  'ISUZU': { cn: '五十鈴', en: 'ISUZU', category: 'JAPANESE' },
  'DAIHATSU': { cn: '大發', en: 'DAIHATSU', category: 'JAPANESE' },
  'JEEP': { cn: '吉普', en: 'JEEP', category: 'AMERICAN' },
  'CHRYSLER': { cn: '克萊斯勒', en: 'CHRYSLER', category: 'AMERICAN' },
  'IVECO': { cn: '威凱', en: 'IVECO', category: 'REGULAR' },
  'DAF': { cn: '達富', en: 'DAF', category: 'REGULAR' },
  'SCANIA': { cn: '掃描', en: 'SCANIA', category: 'REGULAR' },
  'MAN': { cn: 'MAN', en: 'MAN', category: 'REGULAR' }
}

function extractBrandFromHeader(headerText: string): { cn: string, en: string, category: string } | null {
  if (!headerText) return null
  
  const cleanHeader = headerText.toString().trim().toUpperCase()
  
  // 檢查是否包含品牌關鍵字
  for (const [key, value] of Object.entries(brandMappings)) {
    if (cleanHeader.includes(key)) {
      return value
    }
  }
  
  return null
}

function cleanAndFormatData(rawData: any): string {
  if (!rawData) return ''
  return rawData.toString().trim().replace(/\s+/g, ' ').replace(/\n/g, ' ')
}

function isTableHeader(cellContent: string): boolean {
  const header = cellContent.toString().toLowerCase()
  return header.includes('car model') || 
         header.includes('information') || 
         header.includes('year') ||
         header.includes('refrigerant') ||
         header.includes('amount') ||
         header.includes('oil')
}

function isReferenceText(cellContent: string): boolean {
  const text = cellContent.toString().toLowerCase()
  return text.includes('refrigerant filling amount') ||
         text.includes('reference only') ||
         text.includes('factory label') ||
         text.includes('correctness')
}

function parseRefrigerantAmount(amount: string): string {
  if (!amount) return ''
  const cleaned = amount.toString().trim()
  if (cleaned.includes('±')) return cleaned
  if (/^\d+$/.test(cleaned)) return cleaned + 'g'
  return cleaned
}

function parseOilAmount(oil: string): string {
  if (!oil) return ''
  const cleaned = oil.toString().trim()
  if (cleaned.toLowerCase().includes('see') || cleaned.toLowerCase().includes('spec')) {
    return 'See Spec'
  }
  if (cleaned.includes('±')) return cleaned
  if (/^\d+$/.test(cleaned)) return cleaned + 'ml'
  return cleaned
}

function extractOilType(oilString: string): string | undefined {
  if (!oilString) return undefined
  
  const oil = oilString.toString().trim()
  
  // 常見油品類型
  const oilTypes = ['PAG 46', 'PAG 100', 'PAG 150', 'ND-OIL 8', 'PAG', 'POE']
  
  for (const type of oilTypes) {
    if (oil.toUpperCase().includes(type)) {
      return type
    }
  }
  
  if (oil.toLowerCase().includes('see') || oil.toLowerCase().includes('spec')) {
    return undefined
  }
  
  return undefined
}

async function directImportEnglish() {
  try {
    console.log('🚀 開始直接處理和導入英文版 Excel 資料...')
    
    const filePath = 'public/冷媒充填量表(中.英) (7).xlsx'
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 找不到檔案: ${filePath}`)
      return
    }
    
    console.log(`📖 讀取檔案: ${filePath}`)
    const workbook = XLSX.readFile(filePath)
    
    // 清除現有資料
    console.log('🧹 清除現有資料...')
    await prisma.vehicleModel.deleteMany()
    await prisma.vehicleBrand.deleteMany()
    
    const vehicleData: VehicleData[] = []
    let currentBrand: { cn: string, en: string, category: string } | null = null
    
    // 處理英文工作表
    const englishSheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('英文') || name.toLowerCase().includes('english')
    ) || workbook.SheetNames[1] // 如果找不到就用第二個工作表
    
    if (!englishSheetName) {
      console.error('❌ 找不到英文版工作表')
      return
    }
    
    const englishSheet = workbook.Sheets[englishSheetName]
    console.log(`📄 處理英文版工作表: ${englishSheetName}`)
    
    const range = XLSX.utils.decode_range(englishSheet['!ref'] || 'A1:Z1000')
    let isInDataSection = false
    
    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      const row: any[] = []
      
      // 讀取當前行的所有列
      for (let colNum = range.s.c; colNum <= Math.min(range.e.c, 10); colNum++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum })
        const cell = englishSheet[cellAddress]
        row[colNum] = cell ? cell.v : ''
      }
      
      const firstCell = cleanAndFormatData(row[0])
      
      // 檢查是否為品牌標題行
      const brandInfo = extractBrandFromHeader(firstCell)
      if (brandInfo) {
        currentBrand = brandInfo
        console.log(`✅ 發現品牌: ${brandInfo.cn} (${brandInfo.en})`)
        isInDataSection = false
        continue
      }
      
      // 跳過說明文字行
      if (isReferenceText(firstCell)) {
        continue
      }
      
      // 檢查是否為表頭行
      if (isTableHeader(firstCell)) {
        isInDataSection = true
        continue
      }
      
      // 如果不在數據區段或沒有當前品牌，跳過
      if (!isInDataSection || !currentBrand) {
        continue
      }
      
      // 解析車型資料行
      const model = cleanAndFormatData(row[0])
      const information = cleanAndFormatData(row[1]) || ''
      const year = cleanAndFormatData(row[2])
      const refrigerant = cleanAndFormatData(row[3])
      const amount = cleanAndFormatData(row[4])
      const oil = cleanAndFormatData(row[5])
      
      // 檢查是否為有效的車型資料
      if (!model || model.length < 2) {
        continue
      }
      
      // 跳過無效的行
      if (model.toLowerCase().includes('car model') || 
          model.toLowerCase().includes('information') ||
          isTableHeader(model)) {
        continue
      }
      
      // 建立車型資料記錄
      const record: VehicleData = {
        brand: currentBrand.cn,
        brandEn: currentBrand.en,
        category: currentBrand.category,
        model: model,
        information: information,
        year: year || '',
        refrigerant: refrigerant || 'R134a',
        amount: parseRefrigerantAmount(amount),
        oil: parseOilAmount(oil)
      }
      
      vehicleData.push(record)
    }
    
    console.log(`📊 解析完成，總共 ${vehicleData.length} 筆車型資料`)
    
    // 去重處理
    const uniqueData = new Map<string, VehicleData>()
    
    for (const item of vehicleData) {
      const uniqueKey = `${item.brand}-${item.model}-${item.year}-${item.information}`
      
      if (uniqueData.has(uniqueKey)) {
        const existing = uniqueData.get(uniqueKey)!
        const existingFields = Object.values(existing).filter(v => v && v.toString().trim()).length
        const newFields = Object.values(item).filter(v => v && v.toString().trim()).length
        
        if (newFields > existingFields) {
          uniqueData.set(uniqueKey, item)
        }
      } else {
        uniqueData.set(uniqueKey, item)
      }
    }
    
    const finalData = Array.from(uniqueData.values())
    console.log(`🔧 去重後剩餘 ${finalData.length} 筆唯一資料`)
    
    // 開始導入資料庫
    const brandMap = new Map<string, string>()
    let totalImported = 0
    
    for (const vehicleRecord of finalData) {
      try {
        // 創建或獲取品牌
        let brandId = brandMap.get(vehicleRecord.brand)
        
        if (!brandId) {
          const newBrand = await prisma.vehicleBrand.create({
            data: {
              name: vehicleRecord.brand,
              nameEn: vehicleRecord.brandEn,
              category: vehicleRecord.category as any,
              order: brandMap.size
            }
          })
          
          brandId = newBrand.id
          brandMap.set(vehicleRecord.brand, brandId)
          console.log(`✅ 創建品牌: ${vehicleRecord.brand} (${vehicleRecord.brandEn}) - ${vehicleRecord.category}`)
        }
        
        // 創建車型記錄
        await prisma.vehicleModel.create({
          data: {
            brandId: brandId,
            modelName: vehicleRecord.model,
            year: vehicleRecord.year || undefined,
            engine: vehicleRecord.information || undefined,
            category: '英文版資料',
            refrigerantType: vehicleRecord.refrigerant,
            refrigerantAmount: vehicleRecord.amount || '500g',
            oilType: extractOilType(vehicleRecord.oil),
            oilAmount: vehicleRecord.oil || undefined,
            notes: ''
          }
        })
        
        totalImported++
        
        // 每匯入100筆顯示進度
        if (totalImported % 100 === 0) {
          console.log(`📝 已匯入 ${totalImported} 筆記錄...`)
        }
        
      } catch (error) {
        console.error(`❌ 匯入記錄失敗: ${vehicleRecord.brand} ${vehicleRecord.model}`, error)
      }
    }
    
    console.log(`\n🎉 英文版直接導入完成！`)
    console.log(`📊 總計匯入: ${totalImported} 條車型記錄`)
    console.log(`🏷️ 總計品牌: ${brandMap.size} 個品牌`)
    
    // 顯示品牌統計
    const brandStats = await prisma.vehicleBrand.findMany({
      include: {
        _count: {
          select: { models: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    console.log('\n📈 品牌統計 (前20名):')
    brandStats
      .sort((a, b) => b._count.models - a._count.models)
      .slice(0, 20)
      .forEach(brand => {
        console.log(`  ${brand.name} (${brand.nameEn}): ${brand._count.models} 個車型`)
      })
    
    // 顯示冷媒類型統計
    const refrigerantStats = await prisma.vehicleModel.groupBy({
      by: ['refrigerantType'],
      _count: true,
      orderBy: {
        _count: {
          refrigerantType: 'desc'
        }
      },
      take: 10
    })
    
    console.log('\n🧪 冷媒類型統計:')
    refrigerantStats.forEach(stat => {
      console.log(`  ${stat.refrigerantType}: ${stat._count} 個車型`)
    })
    
    console.log('\n✅ 資料庫匯入完成！現在可以測試 API 和前端功能了')
    
  } catch (error) {
    console.error('❌ 直接導入英文版過程中發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  directImportEnglish()
}

export { directImportEnglish }