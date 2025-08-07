import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

const prisma = new PrismaClient()

interface RefrigerantData {
  brand: string
  brandEn: string
  model: string
  year: string
  refrigerant: string
  amount: string
  oil: string
}

// 清理和標準化文本
function cleanText(text: any): string {
  if (!text || text === null || text === undefined) return ''
  return String(text).trim().replace(/\s+/g, ' ')
}

// 解析年份範圍
function parseYear(yearText: string): string {
  if (!yearText) return ''
  // 移除多餘空格，處理各種年份格式
  const cleaned = yearText.replace(/\s+/g, ' ').trim()
  return cleaned
}

// 解析冷媒類型
function parseRefrigerant(refrigerantText: string): string {
  if (!refrigerantText) return 'R1234yf'
  const cleaned = cleanText(refrigerantText)
  
  // 處理 R12>R134a 這種格式
  if (cleaned.includes('>')) {
    return cleaned
  }
  
  // 標準化常見的冷媒類型
  if (cleaned.toLowerCase().includes('r134a')) return 'R134a'
  if (cleaned.toLowerCase().includes('r1234yf')) return 'R1234yf'
  if (cleaned.toLowerCase().includes('r12')) return 'R12>R134a'
  
  return cleaned || 'R1234yf'
}

// 解析數量
function parseAmount(amountText: string): string {
  if (!amountText) return ''
  const cleaned = cleanText(amountText)
  
  // 處理 "See Spec" 等特殊情況
  if (cleaned.toLowerCase().includes('see') || cleaned.toLowerCase().includes('spec')) {
    return 'See Spec'
  }
  
  return cleaned
}

// 判斷品牌類別
function getBrandCategory(brandName: string): 'REGULAR' | 'LUXURY' | 'TRUCK' | 'MALAYSIA' | 'COMMERCIAL' {
  const brand = brandName.toLowerCase()
  
  // 豪華品牌
  if (['audi', 'bmw', 'mercedes', 'lexus', 'jaguar', 'land rover', 'porsche', 'ferrari', 'lamborghini', 'bentley', 'rolls royce', 'maserati', 'alfa romeo'].some(luxury => brand.includes(luxury))) {
    return 'LUXURY'
  }
  
  // 卡車品牌
  if (['volvo', 'scania', 'man', 'iveco', 'daf', 'freightliner', 'kenworth', 'peterbilt', 'isuzu'].some(truck => brand.includes(truck))) {
    return 'TRUCK'
  }
  
  // 馬來西亞品牌
  if (['proton', 'perodua', 'naza'].some(malaysia => brand.includes(malaysia))) {
    return 'MALAYSIA'
  }
  
  return 'REGULAR'
}

async function importRefrigerantData() {
  try {
    console.log('📋 開始導入冷媒數據...')
    
    // 檢查 XLSX 文件
    const filePath = path.join(process.cwd(), 'public', '冷媒充填量表(中.英) (7).xlsx')
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`找不到文件: ${filePath}`)
    }
    
    console.log(`📁 讀取文件: ${filePath}`)
    
    // 讀取 XLSX 文件
    const workbook = XLSX.readFile(filePath)
    console.log(`📊 工作表: ${workbook.SheetNames.join(', ')}`)
    
    let totalImported = 0
    const brandMap = new Map<string, string>() // 品牌名稱到ID的映射
    
    // 處理每個工作表
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n🔄 處理工作表: ${sheetName}`)
      
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      let currentBrand = ''
      let currentBrandEn = ''
      let brandId = ''
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any[]
        
        if (!row || row.length === 0) continue
        
        // 檢查是否為品牌標題行（通常包含品牌名稱）
        const firstCell = cleanText(row[0])
        
        // 檢測品牌標題行（如：ALFA ROMEO(愛快.羅密歐) 此充填冷媒量僅供參考...）
        if (firstCell && !firstCell.match(/^\d/) && firstCell.length > 5 && 
            (firstCell.includes('(') || firstCell.toUpperCase() === firstCell || 
             firstCell.includes('此充填冷媒量僅供參考') || 
             firstCell.includes('填充冷媒量僅供參考'))) {
          
          // 解析品牌名稱
          let brandName = firstCell.split('此充填冷媒量僅供參考')[0].trim()
          brandName = brandName.split('充填冷媒量僅供參考')[0].trim()
          
          // 提取中英文品牌名
          if (brandName.includes('(') && brandName.includes(')')) {
            const match = brandName.match(/^([^(]+)\(([^)]+)\)/)
            if (match) {
              currentBrandEn = match[1].trim()
              currentBrand = match[2].trim()
            } else {
              currentBrand = brandName.split('(')[0].trim()
              currentBrandEn = brandName.split('(')[1]?.replace(')', '').trim() || currentBrand
            }
          } else {
            currentBrand = brandName
            currentBrandEn = brandName
          }
          
          if (currentBrand && !brandMap.has(currentBrand)) {
            // 創建新品牌
            const newBrand = await prisma.vehicleBrand.create({
              data: {
                name: currentBrand,
                nameEn: currentBrandEn,
                category: getBrandCategory(currentBrandEn),
                order: brandMap.size
              }
            })
            
            brandMap.set(currentBrand, newBrand.id)
            brandId = newBrand.id
            console.log(`✅ 創建品牌: ${currentBrand} (${currentBrandEn})`)
          } else if (currentBrand) {
            brandId = brandMap.get(currentBrand) || ''
          }
          
          continue
        }
        
        // 檢查是否為表頭行
        if (firstCell.includes('車型') || firstCell.includes('Car model') || 
            firstCell.includes('年份') || firstCell.includes('Year')) {
          continue
        }
        
        // 處理車型數據行
        if (firstCell && currentBrand && brandId && row.length >= 4) {
          const model = cleanText(row[0])
          const year = parseYear(cleanText(row[1]))
          const refrigerant = parseRefrigerant(cleanText(row[2]))
          const amount = parseAmount(cleanText(row[3]))
          const oil = cleanText(row[4]) || ''
          
          if (model) {
            try {
              await prisma.vehicleModel.create({
                data: {
                  brandId: brandId,
                  modelName: model,
                  year: year,
                  refrigerantType: refrigerant,
                  fillAmount: amount,
                  oilAmount: oil,
                  notes: `來源: XLSX導入 - ${sheetName}`
                }
              })
              
              totalImported++
              
              if (totalImported % 10 === 0) {
                console.log(`📝 已導入 ${totalImported} 條記錄...`)
              }
            } catch (error) {
              console.error(`❌ 導入失敗 - 品牌: ${currentBrand}, 車型: ${model}`, error)
            }
          }
        }
      }
    }
    
    console.log(`\n🎉 導入完成！`)
    console.log(`📊 總計導入: ${totalImported} 條車型記錄`)
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
    
  } catch (error) {
    console.error('❌ 導入冷媒數據時發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  importRefrigerantData()
}

export { importRefrigerantData }