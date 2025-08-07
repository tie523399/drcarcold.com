import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

function cleanText(text: any): string {
  if (!text || text === null || text === undefined) return ''
  return String(text).trim().replace(/\s+/g, ' ')
}

async function analyzeXlsxStructure() {
  try {
    console.log('📊 分析 XLSX 文件結構...')
    
    const filePath = path.join(process.cwd(), 'public', '冷媒充填量表(中.英) (7).xlsx')
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`找不到文件: ${filePath}`)
    }
    
    console.log(`📁 讀取文件: ${filePath}`)
    
    const workbook = XLSX.readFile(filePath)
    console.log(`📊 工作表: ${workbook.SheetNames.join(', ')}`)
    
    // 只分析第一個工作表
    const sheetName = workbook.SheetNames[0]
    console.log(`\n🔍 分析工作表: ${sheetName}`)
    
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    let foundAlfaRomeo = false
    let sampleCount = 0
    
    for (let i = 0; i < data.length && sampleCount < 10; i++) {
      const row = data[i] as any[]
      
      if (!row || row.length === 0) continue
      
      const firstCell = cleanText(row[0])
      
      // 尋找 ALFA ROMEO 品牌
      if (firstCell && firstCell.includes('ALFA ROMEO')) {
        console.log(`\n🎯 找到 ALFA ROMEO 品牌標題:`)
        console.log(`行 ${i}: ${row.map((cell, idx) => `[${idx}] ${cleanText(cell)}`).join(' | ')}`)
        foundAlfaRomeo = true
        continue
      }
      
      // 如果找到了 ALFA ROMEO，開始分析後續的數據行
      if (foundAlfaRomeo && firstCell && !firstCell.includes('車型') && !firstCell.includes('Car model')) {
        console.log(`\n📝 數據行 ${i}:`)
        for (let j = 0; j < Math.min(row.length, 6); j++) {
          const cellValue = cleanText(row[j])
          console.log(`  [${j}] ${cellValue || '(空)'} ${j === 0 ? '← 車型' : j === 1 ? '← 年份?' : j === 2 ? '← 冷媒?' : j === 3 ? '← 填充量?' : j === 4 ? '← 油量?' : ''}`)
        }
        
        sampleCount++
        
        if (sampleCount >= 5) break
      }
    }
    
    console.log('\n✅ 分析完成！')
    
  } catch (error) {
    console.error('❌ 分析 XLSX 結構時發生錯誤:', error)
    throw error
  }
}

if (require.main === module) {
  analyzeXlsxStructure()
}

export { analyzeXlsxStructure }