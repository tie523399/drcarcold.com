import * as XLSX from 'xlsx'
import * as fs from 'fs'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

interface ConvertedVehicleData {
  brand: string           // 品牌中文名
  brandEn: string        // 品牌英文名
  category: string       // 類別
  model: string          // 車型
  year: string           // 年份
  engine?: string        // 引擎（如果有）
  refrigerant: string    // 冷媒類型
  amount: string         // 冷媒量
  oil: string           // 冷凍油量
}

// 品牌映射表（從標題提取品牌資訊）
const brandMappings: { [key: string]: { cn: string, en: string, category: string } } = {
  'VOLKSWAGEN': { cn: '福斯', en: 'VOLKSWAGEN', category: '德國車' },
  'VOLVO': { cn: '富豪', en: 'VOLVO', category: '歐洲車' },
  'VOLVO TRUCK': { cn: '富豪卡車', en: 'VOLVO TRUCK', category: '商用車' },
  'BMW': { cn: 'BMW', en: 'BMW', category: '德國車' },
  'MERCEDES': { cn: '賓士', en: 'MERCEDES-BENZ', category: '德國車' },
  'AUDI': { cn: '奧迪', en: 'AUDI', category: '德國車' },
  'TOYOTA': { cn: '豐田', en: 'TOYOTA', category: '日本車' },
  'HONDA': { cn: '本田', en: 'HONDA', category: '日本車' },
  'NISSAN': { cn: '日產', en: 'NISSAN', category: '日本車' },
  'MAZDA': { cn: '馬自達', en: 'MAZDA', category: '日本車' },
  'MITSUBISHI': { cn: '三菱', en: 'MITSUBISHI', category: '日本車' },
  'SUBARU': { cn: '速霸陸', en: 'SUBARU', category: '日本車' },
  'HYUNDAI': { cn: '現代', en: 'HYUNDAI', category: '韓國車' },
  'KIA': { cn: '起亞', en: 'KIA', category: '韓國車' },
  'FORD': { cn: '福特', en: 'FORD', category: '美國車' },
  'CHEVROLET': { cn: '雪佛蘭', en: 'CHEVROLET', category: '美國車' },
  'PORSCHE': { cn: '保時捷', en: 'PORSCHE', category: '德國車' },
  'LEXUS': { cn: '凌志', en: 'LEXUS', category: '日本車' },
  'INFINITI': { cn: '英菲尼迪', en: 'INFINITI', category: '日本車' },
  'ACURA': { cn: '謳歌', en: 'ACURA', category: '日本車' },
  'TESLA': { cn: '特斯拉', en: 'TESLA', category: '美國車' },
  'JAGUAR': { cn: '捷豹', en: 'JAGUAR', category: '英國車' },
  'LAND ROVER': { cn: '路虎', en: 'LAND ROVER', category: '英國車' },
  'ALFA ROMEO': { cn: '愛快.羅密歐', en: 'ALFA ROMEO', category: '義大利車' },
  'FIAT': { cn: '飛雅特', en: 'FIAT', category: '義大利車' },
  'CITROEN': { cn: '雪鐵龍', en: 'CITROEN', category: '法國車' },
  'PEUGEOT': { cn: '寶獅', en: 'PEUGEOT', category: '法國車' },
  'RENAULT': { cn: '雷諾', en: 'RENAULT', category: '法國車' },
  'OPEL': { cn: '歐寶', en: 'OPEL', category: '德國車' },
  'SKODA': { cn: '斯柯達', en: 'SKODA', category: '德國車' },
  'MINI': { cn: '迷你', en: 'MINI', category: '英國車' },
  'SMART': { cn: 'SMART', en: 'SMART', category: '德國車' },
  'SUZUKI': { cn: '鈴木', en: 'SUZUKI', category: '日本車' },
  'ISUZU': { cn: '五十鈴', en: 'ISUZU', category: '日本車' },
  'DAIHATSU': { cn: '大發', en: 'DAIHATSU', category: '日本車' },
  'JEEP': { cn: '吉普', en: 'JEEP', category: '美國車' },
  'CHRYSLER': { cn: '克萊斯勒', en: 'CHRYSLER', category: '美國車' },
  'IVECO': { cn: '威凱', en: 'IVECO', category: '義大利車' },
  'DAF': { cn: '達富', en: 'DAF', category: '荷蘭車' },
  'SCANIA': { cn: '掃描', en: 'SCANIA', category: '瑞典車' },
  'MAN': { cn: 'MAN', en: 'MAN', category: '德國車' }
}

function extractBrandFromHeader(headerText: string): { cn: string, en: string, category: string } | null {
  if (!headerText) return null
  
  // 移除空白和特殊字符
  const cleanHeader = headerText.toString().trim().toUpperCase()
  
  // 檢查是否包含品牌關鍵字
  for (const [key, value] of Object.entries(brandMappings)) {
    if (cleanHeader.includes(key)) {
      return value
    }
  }
  
  // 如果找不到，嘗試從括號中提取中文名稱
  const match = headerText.match(/([A-Z\s]+).*?\(([^)]+)\)/)
  if (match) {
    return {
      cn: match[2] || match[1],
      en: match[1].trim(),
      category: '一般車輛'
    }
  }
  
  return null
}

function cleanAndFormatData(rawData: string): string {
  if (!rawData) return ''
  
  return rawData.toString()
    .trim()
    .replace(/\s+/g, ' ')  // 合併多個空白
    .replace(/\n/g, ' ')   // 移除換行
}

function parseRefrigerantAmount(amount: string): string {
  if (!amount) return ''
  
  const cleaned = amount.toString().trim()
  
  // 處理常見格式
  if (cleaned.includes('±')) {
    return cleaned  // 保持原格式如 "800 ± 20"
  }
  
  // 如果只是數字，添加單位
  if (/^\d+$/.test(cleaned)) {
    return cleaned + 'g'
  }
  
  return cleaned
}

function parseOilAmount(oil: string): string {
  if (!oil) return ''
  
  const cleaned = oil.toString().trim()
  
  // 處理 "See Spec" 這類特殊值
  if (cleaned.toLowerCase().includes('see') || cleaned.toLowerCase().includes('spec')) {
    return 'See Spec'
  }
  
  // 處理包含 ± 的格式
  if (cleaned.includes('±')) {
    return cleaned
  }
  
  // 如果只是數字，添加單位
  if (/^\d+$/.test(cleaned)) {
    return cleaned + 'ml'
  }
  
  return cleaned
}

async function convertExcelFormat() {
  try {
    console.log('🚀 開始轉換 Excel 格式...')
    
    const filePath = 'public/冷媒充填量表(中.英) (7).xlsx'
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 找不到檔案: ${filePath}`)
      return
    }
    
    console.log(`📖 讀取檔案: ${filePath}`)
    const workbook = XLSX.readFile(filePath)
    
    const convertedData: ConvertedVehicleData[] = []
    let currentBrand: { cn: string, en: string, category: string } | null = null
    
    // 處理每個工作表
    for (const sheetName of workbook.SheetNames) {
      console.log(`📄 處理工作表: ${sheetName}`)
      
      const worksheet = workbook.Sheets[sheetName]
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1000')
      
      let skipRows = 0  // 跳過的行數
      
      for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
        const row: any[] = []
        
        // 讀取當前行的所有列
        for (let colNum = range.s.c; colNum <= Math.min(range.e.c, 10); colNum++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum })
          const cell = worksheet[cellAddress]
          row[colNum] = cell ? cell.v : ''
        }
        
        // 檢查是否為品牌標題行
        const firstCell = cleanAndFormatData(row[0])
        const brandInfo = extractBrandFromHeader(firstCell)
        
        if (brandInfo) {
          currentBrand = brandInfo
          console.log(`✅ 發現品牌: ${brandInfo.cn} (${brandInfo.en})`)
          skipRows = 0
          continue
        }
        
        // 檢查是否為表頭行（包含 "車型"、"年份" 等關鍵字）
        if (firstCell.includes('車型') || firstCell.includes('Car model') || 
            firstCell.includes('年份') || firstCell.includes('Year')) {
          skipRows = 1
          continue
        }
        
        // 跳過空行或無效行
        if (skipRows > 0) {
          skipRows--
          continue
        }
        
        // 如果沒有當前品牌，跳過
        if (!currentBrand) {
          continue
        }
        
        // 檢查是否為有效的車型資料行
        const model = cleanAndFormatData(row[0])
        const year = cleanAndFormatData(row[1])
        const refrigerant = cleanAndFormatData(row[2])
        const amount = cleanAndFormatData(row[3])
        const oil = cleanAndFormatData(row[4])
        
        if (!model || model.length < 2) {
          continue  // 跳過無效的車型資料
        }
        
        // 建立轉換後的資料記錄
        const convertedRecord: ConvertedVehicleData = {
          brand: currentBrand.cn,
          brandEn: currentBrand.en,
          category: currentBrand.category,
          model: model,
          year: year || '',
          refrigerant: refrigerant || 'R134a',  // 預設冷媒類型
          amount: parseRefrigerantAmount(amount),
          oil: parseOilAmount(oil)
        }
        
        convertedData.push(convertedRecord)
        
        // 每處理100筆顯示進度
        if (convertedData.length % 100 === 0) {
          console.log(`📝 已處理 ${convertedData.length} 筆資料...`)
        }
      }
    }
    
    console.log(`\n🎉 轉換完成！`)
    console.log(`📊 總計轉換: ${convertedData.length} 筆車型資料`)
    
    // 統計品牌數量
    const brandCount = new Set(convertedData.map(item => item.brand)).size
    console.log(`🏷️ 包含品牌: ${brandCount} 個`)
    
    // 顯示前幾筆轉換結果作為範例
    console.log('\n📋 轉換結果範例:')
    convertedData.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.brand}(${item.brandEn}) ${item.model} ${item.year} - ${item.refrigerant} ${item.amount} ${item.oil}`)
    })
    
    // 儲存轉換後的資料為 JSON
    const outputPath = 'converted-refrigerant-data.json'
    fs.writeFileSync(outputPath, JSON.stringify(convertedData, null, 2), 'utf-8')
    console.log(`\n💾 轉換後資料已儲存至: ${outputPath}`)
    
    // 儲存為 CSV 格式
    const csvPath = 'converted-refrigerant-data.csv'
    const csvHeader = '品牌,英文品牌,類別,車型,年份,引擎,冷媒類型,冷媒量,冷凍油量\n'
    const csvContent = convertedData.map(item => 
      `"${item.brand}","${item.brandEn}","${item.category}","${item.model}","${item.year}","${item.engine || ''}","${item.refrigerant}","${item.amount}","${item.oil}"`
    ).join('\n')
    
    fs.writeFileSync(csvPath, csvHeader + csvContent, 'utf-8')
    console.log(`💾 CSV 格式已儲存至: ${csvPath}`)
    
    // 顯示品牌統計
    const brandStats = new Map<string, number>()
    convertedData.forEach(item => {
      const key = `${item.brand}(${item.brandEn})`
      brandStats.set(key, (brandStats.get(key) || 0) + 1)
    })
    
    console.log('\n📈 品牌統計:')
    Array.from(brandStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} 個車型`)
      })
    
    return convertedData
    
  } catch (error) {
    console.error('❌ 轉換過程中發生錯誤:', error)
    throw error
  }
}

if (require.main === module) {
  convertExcelFormat()
}

export { convertExcelFormat }