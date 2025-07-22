/**
 * 🚗 車輛數據文件解析工具
 * 支援PDF、CSV和Excel檔案自動解析為車輛數據
 */

import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { RefrigerantFillData, ExcelParseResult, WorksheetInfo } from '@/types/vehicle'

// 🎯 車輛品牌和型號數據結構
export interface VehicleData {
  brand: string
  brandEn?: string
  model: string
  modelEn?: string
  year?: string
  engineSize?: string
  refrigerantType?: string
  fillAmount?: string
  oilType?: string
  oilAmount?: string
  notes?: string
}

export interface ParseResult {
  success: boolean
  data: VehicleData[]
  errors: string[]
  summary: {
    totalRecords: number
    validRecords: number
    brands: string[]
    years: string[]
  }
}

// 🎯 Excel文件解析
export class ExcelParser {
  static async parseVehicleData(buffer: Buffer): Promise<ParseResult> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const vehicles: VehicleData[] = []
      const errors: string[] = []
      
      console.log(`📊 Excel 檔案包含 ${workbook.SheetNames.length} 個工作表:`, workbook.SheetNames)
      
      // 處理每個工作表
      for (const sheetName of workbook.SheetNames) {
        console.log(`🔍 處理工作表: ${sheetName}`)
        
        const worksheet = workbook.Sheets[sheetName]
        if (!worksheet) continue
        
        try {
          // 轉換為JSON格式
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false,
            defval: ''
          }) as string[][]
          
          if (jsonData.length < 2) {
            errors.push(`工作表 "${sheetName}" 數據不足`)
            continue
          }
          
          // 找到標題行
          const headerRowIndex = this.findHeaderRow(jsonData)
          if (headerRowIndex === -1) {
            errors.push(`工作表 "${sheetName}" 找不到有效的標題行`)
            continue
          }
          
          const headers = jsonData[headerRowIndex].map(h => h?.toString().trim() || '')
          console.log(`📋 工作表 "${sheetName}" 標題:`, headers)
          
          // 處理數據行
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
              continue // 跳過空行
            }
            
            try {
              const vehicle = this.mapRowToVehicle(headers, row, sheetName)
              if (this.validateVehicleData(vehicle)) {
                vehicles.push(vehicle)
              } else {
                errors.push(`工作表 "${sheetName}" 第 ${i + 1} 行數據不完整`)
              }
            } catch (error) {
              errors.push(`工作表 "${sheetName}" 第 ${i + 1} 行解析錯誤: ${error}`)
            }
          }
          
        } catch (error) {
          errors.push(`處理工作表 "${sheetName}" 時發生錯誤: ${error}`)
        }
      }
      
      console.log(`✅ Excel 解析完成: ${vehicles.length} 筆有效數據, ${errors.length} 個錯誤`)
      
      return this.buildResult(vehicles, errors)
      
    } catch (error) {
      console.error('❌ Excel 解析失敗:', error)
      return {
        success: false,
        data: [],
        errors: [`Excel解析失敗: ${error}`],
        summary: { totalRecords: 0, validRecords: 0, brands: [], years: [] }
      }
    }
  }
  
  // 🔍 尋找標題行
  private static findHeaderRow(data: string[][]): number {
    const keyHeaders = [
      '品牌', 'brand', '廠牌', 'make',
      '型號', 'model', '車款',
      '冷媒', 'refrigerant', '冷媒類型'
    ]
    
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i]
      if (!row) continue
      
      const rowText = row.join(' ').toLowerCase()
      const matchCount = keyHeaders.filter(header => 
        rowText.includes(header.toLowerCase())
      ).length
      
      if (matchCount >= 2) {
        return i
      }
    }
    
    return 0 // 預設第一行為標題
  }
  
  // 🗺️ 映射行數據到車輛對象
  private static mapRowToVehicle(headers: string[], row: any[], sheetName: string): VehicleData {
    const vehicle: VehicleData = {
      brand: '',
      model: ''
    }
    
    // 標題映射
    const headerMap = this.createHeaderMap(headers)
    
    headers.forEach((header, index) => {
      const value = row[index]?.toString().trim() || ''
      if (!value) return
      
      const normalizedHeader = this.normalizeHeader(header)
      
      switch (normalizedHeader) {
        case 'brand':
          vehicle.brand = value
          break
        case 'brandEn':
          vehicle.brandEn = value
          break
        case 'model':
          vehicle.model = value
          break
        case 'modelEn':
          vehicle.modelEn = value
          break
        case 'year':
          vehicle.year = this.extractYear(value)
          break
        case 'engineSize':
          vehicle.engineSize = value
          break
        case 'refrigerantType':
          vehicle.refrigerantType = this.normalizeRefrigerant(value)
          break
        case 'fillAmount':
          vehicle.fillAmount = this.normalizeAmount(value)
          break
        case 'oilType':
          vehicle.oilType = this.normalizeOilType(value)
          break
        case 'oilAmount':
          vehicle.oilAmount = this.normalizeAmount(value)
          break
        case 'notes':
          vehicle.notes = value
          break
      }
    })
    
    // 如果品牌為空，嘗試從工作表名稱推斷
    if (!vehicle.brand && sheetName) {
      const inferredBrand = this.inferBrandFromSheetName(sheetName)
      if (inferredBrand) {
        vehicle.brand = inferredBrand
      }
    }
    
    return vehicle
  }
  
  // 🏷️ 建立標題映射
  private static createHeaderMap(headers: string[]): Map<string, number> {
    const map = new Map<string, number>()
    headers.forEach((header, index) => {
      const normalized = this.normalizeHeader(header)
      if (normalized) {
        map.set(normalized, index)
      }
    })
    return map
  }
  
  // 🔧 標題正規化
  private static normalizeHeader(header: string): string {
    const normalized = header.toLowerCase().trim()
    
    // 完整的標題映射表
    const headerMap: { [key: string]: string } = {
      // 品牌相關
      '品牌': 'brand',
      'brand': 'brand',
      'make': 'brand',
      '廠牌': 'brand',
      '製造商': 'brand',
      'manufacturer': 'brand',
      
      // 英文品牌
      '品牌(英文)': 'brandEn',
      '品牌英文': 'brandEn',
      'brand (english)': 'brandEn',
      'brand_en': 'brandEn',
      'brand_english': 'brandEn',
      
      // 型號相關
      '車款': 'model',
      'model': 'model',
      '型號': 'model',
      '車型': 'model',
      '款式': 'model',
      
      // 英文型號
      '型號(英文)': 'modelEn',
      '型號英文': 'modelEn',
      'model (english)': 'modelEn',
      'model_en': 'modelEn',
      'model_english': 'modelEn',
      
      // 年份相關
      '年份': 'year',
      'year': 'year',
      '年度': 'year',
      '出廠年': 'year',
      '生產年': 'year',
      
      // 引擎相關
      '排氣量': 'engineSize',
      'engine size': 'engineSize',
      'engine_size': 'engineSize',
      'displacement': 'engineSize',
      '引擎大小': 'engineSize',
      '排量': 'engineSize',
      
      // 冷媒相關
      '冷媒': 'refrigerantType',
      'refrigerant': 'refrigerantType',
      '冷媒類型': 'refrigerantType',
      'refrigerant type': 'refrigerantType',
      'refrigerant_type': 'refrigerantType',
      '冷媒型號': 'refrigerantType',
      
      // 充填量相關
      '充填量': 'fillAmount',
      'fill amount': 'fillAmount',
      'fill_amount': 'fillAmount',
      'amount': 'fillAmount',
      '容量': 'fillAmount',
      '冷媒量': 'fillAmount',
      '充注量': 'fillAmount',
      '冷媒容量': 'fillAmount',
      'refrigerant amount': 'fillAmount',
      'capacity': 'fillAmount',
      
      // 冷凍油相關
      '油類型': 'oilType',
      'oil type': 'oilType',
      'oil_type': 'oilType',
      'oil': 'oilType',
      '冷凍油': 'oilType',
      '潤滑油': 'oilType',
      'lubricant': 'oilType',
      '潤滑劑': 'oilType',
      
      // 油量相關
      '油量': 'oilAmount',
      'oil amount': 'oilAmount',
      'oil_amount': 'oilAmount',
      'lubricant amount': 'oilAmount',
      '潤滑油量': 'oilAmount',
      '冷凍油量': 'oilAmount',
      
      // 備註相關
      '備註': 'notes',
      'notes': 'notes',
      'note': 'notes',
      '說明': 'notes',
      '註記': 'notes',
      'remarks': 'notes',
      'comment': 'notes',
      'description': 'notes'
    }
    
    return headerMap[normalized] || ''
  }
  
  // 📅 提取年份
  private static extractYear(value: string): string | undefined {
    const yearMatch = value.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? yearMatch[0] : undefined
  }
  
  // ❄️ 正規化冷媒類型
  private static normalizeRefrigerant(value: string): string | undefined {
    const cleaned = value.toUpperCase().replace(/[^\w]/g, '')
    const patterns = [
      /R\d+[A-Z]*/,
      /HFC\d+/,
      /HFO\d+/
    ]
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (match) return match[0]
    }
    
    return cleaned || undefined
  }
  
  // 🛢️ 正規化冷凍油類型
  private static normalizeOilType(value: string): string | undefined {
    const cleaned = value.toUpperCase().replace(/[^\w]/g, '')
    const commonTypes = ['PAG46', 'PAG100', 'PAG150', 'POE', 'POE68', 'PAO']
    
    for (const type of commonTypes) {
      if (cleaned.includes(type)) return type
    }
    
    return cleaned || undefined
  }
  
  // 📏 正規化數量
  private static normalizeAmount(value: string): string | undefined {
    if (!value) return undefined
    
    // 移除多餘空格，保留數字、小數點和單位
    const cleaned = value.replace(/\s+/g, '').toLowerCase()
    
    // 常見單位模式
    const patterns = [
      /\d+\.?\d*\s*g/,
      /\d+\.?\d*\s*kg/,
      /\d+\.?\d*\s*ml/,
      /\d+\.?\d*\s*l/,
      /\d+\.?\d*\s*oz/,
      /\d+\.?\d*\s*lb/
    ]
    
    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (match) return match[0]
    }
    
    return cleaned || undefined
  }
  
  // 🏢 從工作表名稱推斷品牌
  private static inferBrandFromSheetName(sheetName: string): string | undefined {
    const commonBrands = [
      'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi',
      'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Porsche',
      'Ford', 'Chevrolet', 'Chrysler', 'Jeep',
      'Hyundai', 'Kia', 'Genesis',
      'Lexus', 'Infiniti', 'Acura'
    ]
    
    const normalized = sheetName.toLowerCase()
    for (const brand of commonBrands) {
      if (normalized.includes(brand.toLowerCase())) {
        return brand
      }
    }
    
    return undefined
  }
  
  // ✅ 數據驗證
  private static validateVehicleData(vehicle: VehicleData): boolean {
    return !!(
      vehicle.brand && 
      vehicle.model && 
      vehicle.brand.length > 1 && 
      vehicle.model.length > 1
    )
  }
  
  // 📊 構建結果
  private static buildResult(vehicles: VehicleData[], errors: string[]): ParseResult {
    const brands = [...new Set(vehicles.map(v => v.brand))]
    const years = [...new Set(vehicles.map(v => v.year).filter(Boolean))] as string[]
    
    return {
      success: vehicles.length > 0,
      data: vehicles,
      errors,
      summary: {
        totalRecords: vehicles.length + errors.length,
        validRecords: vehicles.length,
        brands: brands.sort(),
        years: years.sort()
      }
    }
  }
}

// 🎯 PDF文件解析
export class PDFParser {
  static async parseVehicleData(buffer: Buffer): Promise<ParseResult> {
    try {
      // 動態導入 pdf-parse 以避免建構時錯誤
      const pdf = (await import('pdf-parse')).default
      const pdfData = await pdf(buffer)
      const text = pdfData.text
      
      const vehicles: VehicleData[] = []
      const errors: string[] = []
      
      // 🔍 智能解析PDF文本
      const lines = text.split('\n').filter(line => line.trim())
      
      // 常見的車輛數據模式
      const patterns = {
        // Toyota Camry 2020 R1234yf 650g PAG46 120ml
        fullPattern: /(\w+)\s+(\w+[\w\s]*?)\s+(\d{4})\s+(R\d+[a-z]*)\s+(\d+[.,]?\d*g)\s*(?:(PAG\d+|POE)\s+(\d+[.,]?\d*ml)?)?/gi,
        
        // 簡化模式：品牌 型號 年份 冷媒
        simplePattern: /(\w+)\s+([A-Za-z0-9\s]+)\s+(\d{4})\s+(R\d+[a-z]*)/gi,
        
        // 表格式：| Toyota | Camry | 2020 | R1234yf | 650g |
        tablePattern: /\|\s*(\w+)\s*\|\s*([^|]+)\s*\|\s*(\d{4})\s*\|\s*(R\d+[a-z]*)\s*\|\s*([^|]*)\s*\|/gi
      }
      
      // 嘗試不同的解析模式
      let matches: RegExpMatchArray[] = []
      
      // 全模式匹配
      matches = [...text.matchAll(patterns.fullPattern)]
      
      if (matches.length === 0) {
        // 簡化模式
        matches = [...text.matchAll(patterns.simplePattern)]
      }
      
      if (matches.length === 0) {
        // 表格模式
        matches = [...text.matchAll(patterns.tablePattern)]
      }
      
      // 處理匹配結果
      matches.forEach((match, index) => {
        try {
          const vehicle: VehicleData = {
            brand: this.cleanText(match[1]),
            model: this.cleanText(match[2]),
            year: match[3],
            refrigerantType: match[4]?.toUpperCase(),
            fillAmount: match[5] ? this.cleanText(match[5]) : undefined,
            oilType: match[6] ? this.cleanText(match[6]) : undefined,
            oilAmount: match[7] ? this.cleanText(match[7]) : undefined
          }
          
          // 數據驗證
          if (this.validateVehicleData(vehicle)) {
            vehicles.push(vehicle)
          } else {
            errors.push(`第 ${index + 1} 筆數據格式錯誤: ${match[0]}`)
          }
        } catch (error) {
          errors.push(`解析第 ${index + 1} 筆數據時發生錯誤: ${error}`)
        }
      })
      
      // 如果沒有找到結構化數據，嘗試行解析
      if (vehicles.length === 0) {
        const lineResults = this.parseLines(lines)
        vehicles.push(...lineResults.vehicles)
        errors.push(...lineResults.errors)
      }
      
      return this.buildResult(vehicles, errors)
      
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`PDF解析失敗: ${error}`],
        summary: { totalRecords: 0, validRecords: 0, brands: [], years: [] }
      }
    }
  }
  
  // 🔧 行解析（適用於簡單列表格式）
  private static parseLines(lines: string[]): { vehicles: VehicleData[], errors: string[] } {
    const vehicles: VehicleData[] = []
    const errors: string[] = []
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed.length < 5) return // 跳過太短的行
      
      // 嘗試不同的分隔符
      const separators = ['\t', '|', ',', ';', '  '] // 製表符、管線、逗號、分號、雙空格
      
      for (const sep of separators) {
        const parts = trimmed.split(sep).map(p => p.trim()).filter(p => p)
        
        if (parts.length >= 3) {
          try {
            const vehicle: VehicleData = {
              brand: this.cleanText(parts[0]),
              model: this.cleanText(parts[1]),
              year: parts[2].match(/\d{4}/)?.[0],
              refrigerantType: parts[3]?.match(/R\d+[a-z]*/i)?.[0]?.toUpperCase(),
              fillAmount: parts[4] ? this.cleanText(parts[4]) : undefined
            }
            
            if (this.validateVehicleData(vehicle)) {
              vehicles.push(vehicle)
              break // 成功解析，跳出分隔符嘗試循環
            }
          } catch (error) {
            // 繼續嘗試下一個分隔符
          }
        }
      }
    })
    
    return { vehicles, errors }
  }
  
  // 🧹 文本清理
  private static cleanText(text: string): string {
    return text.replace(/[^\w\s\-\.]/g, '').trim()
  }
  
  // ✅ 數據驗證
  private static validateVehicleData(vehicle: VehicleData): boolean {
    return !!(
      vehicle.brand && 
      vehicle.model && 
      vehicle.brand.length > 1 && 
      vehicle.model.length > 1
    )
  }
  
  // 📊 構建結果
  private static buildResult(vehicles: VehicleData[], errors: string[]): ParseResult {
    const brands = [...new Set(vehicles.map(v => v.brand))]
    const years = [...new Set(vehicles.map(v => v.year).filter(Boolean))] as string[]
    
    return {
      success: vehicles.length > 0,
      data: vehicles,
      errors,
      summary: {
        totalRecords: vehicles.length + errors.length,
        validRecords: vehicles.length,
        brands: brands.sort(),
        years: years.sort()
      }
    }
  }
}

// 🎯 CSV文件解析
export class CSVParser {
  static async parseVehicleData(buffer: Buffer): Promise<ParseResult> {
    try {
      const csvText = buffer.toString('utf-8')
      
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => this.normalizeHeader(header),
          complete: (results) => {
            const vehicles: VehicleData[] = []
            const errors: string[] = []
            
            results.data.forEach((row: any, index) => {
              try {
                const vehicle = this.mapRowToVehicle(row)
                
                if (this.validateVehicleData(vehicle)) {
                  vehicles.push(vehicle)
                } else {
                  errors.push(`第 ${index + 2} 行數據不完整或格式錯誤`)
                }
              } catch (error) {
                errors.push(`第 ${index + 2} 行解析錯誤: ${error}`)
              }
            })
            
            // 添加CSV解析錯誤
            if (results.errors.length > 0) {
              errors.push(...results.errors.map(e => `CSV格式錯誤: ${e.message}`))
            }
            
            resolve(this.buildResult(vehicles, errors))
          },
          error: (error: any) => {
            resolve({
              success: false,
              data: [],
              errors: [`CSV解析失敗: ${error.message}`],
              summary: { totalRecords: 0, validRecords: 0, brands: [], years: [] }
            })
          }
        })
      })
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`文件處理失敗: ${error}`],
        summary: { totalRecords: 0, validRecords: 0, brands: [], years: [] }
      }
    }
  }
  
  // 🔧 標題正規化
  private static normalizeHeader(header: string): string {
    const normalized = header.toLowerCase().trim()
    
    // 標題映射
    const headerMap: { [key: string]: string } = {
      '品牌': 'brand',
      'brand': 'brand',
      'make': 'brand',
      '廠牌': 'brand',
      '車款': 'model',
      'model': 'model',
      '型號': 'model',
      '年份': 'year',
      'year': 'year',
      '年度': 'year',
      '冷媒': 'refrigerantType',
      'refrigerant': 'refrigerantType',
      '冷媒類型': 'refrigerantType',
      'refrigerant_type': 'refrigerantType',
      '充填量': 'fillAmount',
      'fill_amount': 'fillAmount',
      'amount': 'fillAmount',
      '油類型': 'oilType',
      'oil_type': 'oilType',
      'oil': 'oilType',
      '油量': 'oilAmount',
      'oil_amount': 'oilAmount',
      '備註': 'notes',
      'notes': 'notes',
      'note': 'notes',
      '說明': 'notes'
    }
    
    return headerMap[normalized] || normalized
  }
  
  // 🗺️ 行數據映射
  private static mapRowToVehicle(row: any): VehicleData {
    return {
      brand: this.cleanValue(row.brand) || '',
      brandEn: this.cleanValue(row.brandEn || row.brand_en),
      model: this.cleanValue(row.model) || '',
      modelEn: this.cleanValue(row.modelEn || row.model_en),
      year: this.cleanValue(row.year),
      engineSize: this.cleanValue(row.engineSize || row.engine_size),
      refrigerantType: this.cleanValue(row.refrigerantType || row.refrigerant_type || row.refrigerant),
      fillAmount: this.cleanValue(row.fillAmount || row.fill_amount || row.amount),
      oilType: this.cleanValue(row.oilType || row.oil_type || row.oil),
      oilAmount: this.cleanValue(row.oilAmount || row.oil_amount),
      notes: this.cleanValue(row.notes || row.note)
    }
  }
  
  // 🧹 值清理
  private static cleanValue(value: any): string | undefined {
    if (!value) return undefined
    return String(value).trim() || undefined
  }
  
  // ✅ 數據驗證
  private static validateVehicleData(vehicle: VehicleData): boolean {
    return !!(
      vehicle.brand && 
      vehicle.model && 
      vehicle.brand.length > 1 && 
      vehicle.model.length > 1
    )
  }
  
  // 📊 構建結果
  private static buildResult(vehicles: VehicleData[], errors: string[]): ParseResult {
    const brands = [...new Set(vehicles.map(v => v.brand))]
    const years = [...new Set(vehicles.map(v => v.year).filter(Boolean))] as string[]
    
    return {
      success: vehicles.length > 0,
      data: vehicles,
      errors,
      summary: {
        totalRecords: vehicles.length + errors.length,
        validRecords: vehicles.length,
        brands: brands.sort(),
        years: years.sort()
      }
    }
  }
}

// 🎯 通用文件解析器
export class FileParser {
  static async parseVehicleFile(file: File | Buffer, filename: string): Promise<ParseResult> {
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
    const extension = filename.toLowerCase().split('.').pop()
    
    switch (extension) {
      case 'pdf':
        return PDFParser.parseVehicleData(buffer)
      
      case 'csv':
        return CSVParser.parseVehicleData(buffer)
      
      case 'xlsx':
      case 'xls':
        return ExcelParser.parseVehicleData(buffer)
      
      default:
        return {
          success: false,
          data: [],
          errors: [`不支援的檔案格式: ${extension}`],
          summary: { totalRecords: 0, validRecords: 0, brands: [], years: [] }
        }
    }
  }
  
  // 📋 生成CSV範本
  static generateCSVTemplate(): string {
    const headers = [
      'brand', 'model', 'year', 'refrigerantType', 'fillAmount', 'oilType', 'oilAmount', 'notes'
    ]
    
    const sampleData = [
      ['Toyota', 'Camry', '2020', 'R1234yf', '650g', 'PAG46', '120ml', ''],
      ['Honda', 'Civic', '2019', 'R134a', '475g', 'PAG46', '100ml', ''],
      ['BMW', '320i', '2021', 'R1234yf', '750g', 'PAG100', '180ml', '渦輪增壓'],
    ]
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    return csvContent
  }
} 