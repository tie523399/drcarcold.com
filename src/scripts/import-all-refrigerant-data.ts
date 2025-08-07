import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as fs from 'fs'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

const prisma = new PrismaClient()

interface RefrigerantData {
  brandName: string
  brandNameEn: string
  category: string
  modelName: string
  year?: string
  engine?: string
  refrigerantType: string
  refrigerantAmount: string
  oilType?: string
  oilAmount?: string
  notes?: string
}

// 品牌映射表（中文->英文）
const brandMapping: Record<string, string> = {
  'BMW': 'BMW',
  '奧迪': 'AUDI',
  '賓士': 'MERCEDES-BENZ',
  '福斯': 'VOLKSWAGEN',
  '豐田': 'TOYOTA',
  '本田': 'HONDA', 
  '日產': 'NISSAN',
  '三菱': 'MITSUBISHI',
  '馬自達': 'MAZDA',
  '速霸陸': 'SUBARU',
  '現代': 'HYUNDAI',
  '起亞': 'KIA',
  '雷克薩斯': 'LEXUS',
  '英菲尼迪': 'INFINITI',
  '謳歌': 'ACURA',
  '特斯拉': 'TESLA',
  '福特': 'FORD',
  '雪佛蘭': 'CHEVROLET',
  '別克': 'BUICK',
  '凱迪拉克': 'CADILLAC',
  '林肯': 'LINCOLN',
  '捷豹': 'JAGUAR',
  '路虎': 'LAND ROVER',
  '沃爾沃': 'VOLVO',
  '保時捷': 'PORSCHE',
  '法拉利': 'FERRARI',
  '蘭博基尼': 'LAMBORGHINI',
  '阿斯頓馬丁': 'ASTON MARTIN',
  '賓利': 'BENTLEY',
  '勞斯萊斯': 'ROLLS-ROYCE',
  '斯巴魯': 'SUBARU',
  '阿爾法羅密歐': 'ALFA ROMEO'
}

// 解析 Excel 資料
function parseExcelFile(filePath: string): RefrigerantData[] {
  try {
    console.log(`📖 正在讀取檔案: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  檔案不存在: ${filePath}`)
      return []
    }

    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    const results: RefrigerantData[] = []
    
    // 跳過標題行
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      
      if (!row || row.length === 0 || !row[0]) continue
      
      // 解析品牌資訊
      let brandInfo = String(row[0] || '').trim()
      let brandName = ''
      let brandNameEn = ''
      let category = '一般車輛'
      
      // 嘗試從第一列提取品牌資訊
      if (brandInfo.includes(' ')) {
        const parts = brandInfo.split(' ')
        brandName = parts[0]
        if (parts[1]) {
          // 如果第二部分看起來像英文，就當作英文品牌名
          if (/^[A-Z\s-]+$/i.test(parts[1])) {
            brandNameEn = parts[1].toUpperCase()
          } else {
            category = parts[1]
          }
        }
      } else {
        brandName = brandInfo
      }
      
      // 使用映射表獲取英文品牌名
      if (!brandNameEn && brandMapping[brandName]) {
        brandNameEn = brandMapping[brandName]
      } else if (!brandNameEn) {
        brandNameEn = brandName.toUpperCase()
      }
      
      // 解析其他欄位
      const modelName = String(row[1] || '').trim()
      const year = String(row[2] || '').trim()
      const engine = String(row[3] || '').trim()
      const refrigerantType = String(row[4] || 'R1234yf').trim()
      const refrigerantAmount = String(row[5] || '').trim()
      const oilType = String(row[6] || '').trim()
      const oilAmount = String(row[7] || '').trim()
      const notes = String(row[8] || '').trim()
      
      if (!modelName) continue
      
      results.push({
        brandName,
        brandNameEn,
        category,
        modelName,
        year: year || undefined,
        engine: engine || undefined,
        refrigerantType,
        refrigerantAmount: refrigerantAmount || '500g',
        oilType: oilType || undefined,
        oilAmount: oilAmount || undefined,
        notes: notes || undefined
      })
    }
    
    console.log(`✅ 成功解析 ${results.length} 條記錄從 ${filePath}`)
    return results
    
  } catch (error) {
    console.error(`❌ 解析 ${filePath} 時發生錯誤:`, error)
    return []
  }
}

// 解析 JSON 資料（作為備用）
function parseJsonFile(filePath: string): RefrigerantData[] {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  JSON檔案不存在: ${filePath}`)
      return []
    }
    
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const results: RefrigerantData[] = []
    
    if (Array.isArray(jsonData)) {
      for (const item of jsonData) {
        // 處理JSON格式的資料
        if (typeof item === 'object' && item.brand) {
          results.push({
            brandName: item.brand || '',
            brandNameEn: brandMapping[item.brand] || item.brand?.toUpperCase() || '',
            category: item.category || '一般車輛',
            modelName: item.model || '',
            year: item.year,
            engine: item.engine,
            refrigerantType: item.refrigerant || 'R1234yf',
            refrigerantAmount: item.amount || '500g',
            oilType: item.oilType,
            oilAmount: item.oilAmount,
            notes: item.notes
          })
        }
      }
    }
    
    console.log(`✅ 成功解析 ${results.length} 條記錄從 JSON: ${filePath}`)
    return results
    
  } catch (error) {
    console.error(`❌ 解析JSON ${filePath} 時發生錯誤:`, error)
    return []
  }
}

async function importAllRefrigerantData() {
  try {
    console.log('🚀 開始匯入所有冷媒充填資料...')
    
    // 清除現有資料
    console.log('🧹 清除現有資料...')
    await prisma.vehicleModel.deleteMany()
    await prisma.vehicleBrand.deleteMany()
    
    let allData: RefrigerantData[] = []
    
    // 檔案列表（按優先順序）
    const fileList = [
      '冷媒充填量表(中.英) (2).xlsx',
      '馬來西亞.xlsx',
      '冷媒充填量表(中.英) (2)_converted.json',
      '冷媒充填量表(中.英) (5)_converted.json',
      '馬來西亞_converted.json'
    ]
    
    // 嘗試讀取所有檔案
    for (const fileName of fileList) {
      if (fileName.endsWith('.xlsx')) {
        const data = parseExcelFile(fileName)
        allData = allData.concat(data)
      } else if (fileName.endsWith('.json')) {
        const data = parseJsonFile(fileName)
        allData = allData.concat(data)
      }
    }
    
    if (allData.length === 0) {
      console.log('❌ 沒有找到任何可用的資料檔案')
      return
    }
    
    console.log(`📊 總共收集到 ${allData.length} 條原始記錄`)
    
    // 去重和整理資料
    const brandMap = new Map<string, string>()
    const processedData = new Map<string, RefrigerantData>()
    
    for (const item of allData) {
      if (!item.brandName || !item.modelName) continue
      
      // 建立唯一鍵來去重
      const uniqueKey = `${item.brandName}-${item.modelName}-${item.year || 'N/A'}`
      
      // 如果已存在，選擇資料更完整的版本
      if (processedData.has(uniqueKey)) {
        const existing = processedData.get(uniqueKey)!
        // 比較完整度，保留更完整的資料
        const existingFields = Object.values(existing).filter(v => v && v.trim()).length
        const newFields = Object.values(item).filter(v => v && v.trim()).length
        
        if (newFields > existingFields) {
          processedData.set(uniqueKey, item)
        }
      } else {
        processedData.set(uniqueKey, item)
      }
    }
    
    const uniqueData = Array.from(processedData.values())
    console.log(`🔧 去重後剩餘 ${uniqueData.length} 條記錄`)
    
    let totalImported = 0
    
    // 逐一匯入資料
    for (const vehicleData of uniqueData) {
      try {
        // 創建或獲取品牌
        let brandId = brandMap.get(vehicleData.brandName)
        
        if (!brandId) {
          // 判斷品牌類別
          let brandCategory = 'REGULAR'
          if (vehicleData.category?.includes('馬來西亞') || vehicleData.category?.includes('Malaysia')) {
            brandCategory = 'MALAYSIA'
          } else if (['BMW', 'MERCEDES', 'AUDI', 'LEXUS', 'TESLA', 'PORSCHE'].some(luxury => 
            vehicleData.brandNameEn.toUpperCase().includes(luxury))) {
            brandCategory = 'LUXURY'
          }
          
          const newBrand = await prisma.vehicleBrand.create({
            data: {
              name: vehicleData.brandName,
              nameEn: vehicleData.brandNameEn,
              category: brandCategory as any,
              order: brandMap.size
            }
          })
          
          brandId = newBrand.id
          brandMap.set(vehicleData.brandName, brandId)
          console.log(`✅ 創建品牌: ${vehicleData.brandName} (${vehicleData.brandNameEn})`)
        }
        
        // 創建車型記錄
        await prisma.vehicleModel.create({
          data: {
            brandId: brandId,
            modelName: vehicleData.modelName,
            year: vehicleData.year,
            engine: vehicleData.engine,
            category: vehicleData.category,
            refrigerantType: vehicleData.refrigerantType,
            refrigerantAmount: vehicleData.refrigerantAmount,
            oilType: vehicleData.oilType,
            oilAmount: vehicleData.oilAmount,
            notes: vehicleData.notes || ''
          }
        })
        
        totalImported++
        
        if (totalImported % 100 === 0) {
          console.log(`📝 已匯入 ${totalImported} 條記錄...`)
        }
        
      } catch (error) {
        console.error(`❌ 匯入記錄失敗: ${vehicleData.brandName} ${vehicleData.modelName}`, error)
      }
    }
    
    console.log(`\n🎉 匯入完成！`)
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
    
    console.log('\n📈 品牌統計:')
    brandStats.forEach(brand => {
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
      }
    })
    
    console.log('\n🧪 冷媒類型統計:')
    refrigerantStats.forEach(stat => {
      console.log(`  ${stat.refrigerantType}: ${stat._count} 個車型`)
    })
    
  } catch (error) {
    console.error('❌ 匯入所有冷媒資料時發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  importAllRefrigerantData()
}

export { importAllRefrigerantData }