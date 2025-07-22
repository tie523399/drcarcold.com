/**
 * 🚗 車輛冷媒數據類型定義
 * 支援冷媒充填量表的完整數據結構
 */

// ==================== 車輛品牌和型號 ====================

/**
 * 車輛品牌接口
 */
export interface VehicleBrand {
  id: string
  name: string
  nameEn: string
  category: 'regular' | 'truck' | 'malaysia' | 'luxury' | 'commercial'
  logoUrl?: string
  order: number
  models?: VehicleModel[]
  createdAt: Date
  updatedAt: Date
}

/**
 * 車輛型號接口
 */
export interface VehicleModel {
  id: string
  brandId: string
  brand?: VehicleBrand
  modelName: string
  year?: string
  engineType?: string
  engineSize?: string
  refrigerantType: string // R134a, R1234yf, R410A 等
  fillAmount: string // 充填量，如 "650g", "0.65kg"
  oilType?: string // 冷凍油類型，如 "PAG46", "PAG100", "POE"
  oilAmount?: string // 油量，如 "120ml", "0.12L"
  notes?: string // 備註信息
  createdAt: Date
  updatedAt: Date
}

// ==================== 冷媒充填量表數據 ====================

/**
 * 標準冷媒充填量表數據接口
 * 對應 Excel 表格的欄位結構
 */
export interface RefrigerantFillData {
  // 基本車輛信息
  brand: string // 品牌 (中文)
  brandEn?: string // 品牌 (英文)
  model: string // 型號 (中文)
  modelEn?: string // 型號 (英文)
  year?: string // 年份
  
  // 引擎信息
  engineType?: string // 引擎類型 (汽油/柴油/混合動力)
  engineSize?: string // 排氣量
  
  // 冷媒系統信息
  refrigerantType: string // 冷媒類型 (R134a/R1234yf等)
  fillAmount: string // 充填量
  refrigerantCapacity?: string // 冷媒容量 (替代欄位名)
  
  // 冷凍油信息
  oilType?: string // 冷凍油類型
  oilAmount?: string // 冷凍油量
  lubricantType?: string // 潤滑劑類型 (替代欄位名)
  lubricantAmount?: string // 潤滑劑量 (替代欄位名)
  
  // 系統信息
  systemType?: string // 系統類型 (單迴路/雙迴路等)
  compressorType?: string // 壓縮機類型
  
  // 其他信息
  region?: string // 地區 (台灣/馬來西亞/全球等)
  marketSegment?: string // 市場區隔 (轎車/商用車/卡車等)
  bodyType?: string // 車身類型 (轎車/SUV/掀背車等)
  transmissionType?: string // 變速箱類型
  fuelType?: string // 燃料類型
  
  // 備註和特殊說明
  notes?: string // 備註
  remarks?: string // 說明 (替代欄位名)
  specialRequirements?: string // 特殊要求
  maintenanceNotes?: string // 維護注意事項
  
  // 技術規格
  workingPressure?: string // 工作壓力
  testPressure?: string // 測試壓力
  systemVolume?: string // 系統容積
  
  // 服務信息
  serviceInterval?: string // 保養間隔
  lastUpdated?: string // 最後更新時間
  dataSource?: string // 數據來源
}

// ==================== 文件解析相關 ====================

/**
 * Excel 工作表信息接口
 */
export interface WorksheetInfo {
  name: string
  rowCount: number
  columnCount: number
  headers: string[]
  dataStartRow: number
}

/**
 * Excel 文件解析結果接口
 */
export interface ExcelParseResult {
  success: boolean
  worksheets: WorksheetInfo[]
  data: RefrigerantFillData[]
  errors: string[]
  warnings: string[]
  summary: {
    totalRecords: number
    validRecords: number
    brands: string[]
    models: string[]
    refrigerantTypes: string[]
    years: string[]
    regions: string[]
  }
}

/**
 * 文件上傳結果接口
 */
export interface FileUploadResult {
  success: boolean
  fileType: 'pdf' | 'csv' | 'excel'
  fileName: string
  fileSize: number
  data: RefrigerantFillData[]
  parseResult: ExcelParseResult | any
  errors: string[]
  message: string
}

// ==================== 數據驗證和清理 ====================

/**
 * 數據驗證規則接口
 */
export interface ValidationRule {
  field: keyof RefrigerantFillData
  required: boolean
  pattern?: RegExp
  allowedValues?: string[]
  transform?: (value: string) => string
}

/**
 * 數據清理結果接口
 */
export interface DataCleaningResult {
  original: RefrigerantFillData
  cleaned: RefrigerantFillData
  changes: string[]
  warnings: string[]
}

// ==================== 批量導入相關 ====================

/**
 * 批量導入預覽接口
 */
export interface ImportPreview {
  newBrands: {
    name: string
    nameEn?: string
    category: string
    estimatedModels: number
  }[]
  newModels: {
    brandName: string
    modelName: string
    refrigerantType: string
    fillAmount: string
  }[]
  duplicates: {
    brand: string
    model: string
    action: 'skip' | 'update' | 'merge'
  }[]
  conflicts: {
    brand: string
    model: string
    reason: string
    suggestion: string
  }[]
  statistics: {
    totalRecords: number
    newBrandsCount: number
    newModelsCount: number
    duplicatesCount: number
    conflictsCount: number
  }
}

/**
 * 導入操作配置接口
 */
export interface ImportConfig {
  action: 'preview' | 'import'
  conflictResolution: 'skip' | 'update' | 'merge'
  createMissingBrands: boolean
  validateData: boolean
  cleanData: boolean
}

// ==================== 常量定義 ====================

/**
 * 支援的冷媒類型
 */
export const REFRIGERANT_TYPES = [
  'R134a',
  'R1234yf', 
  'R410A',
  'R32',
  'R404A',
  'R407C',
  'R22', // 舊型冷媒
  'R290', // 丙烷 (天然冷媒)
  'R600a', // 異丁烷
  'R744', // 二氧化碳
] as const

/**
 * 支援的冷凍油類型
 */
export const OIL_TYPES = [
  'PAG46',
  'PAG100',
  'PAG150',
  'POE',
  'POE68',
  'PAO',
  'Mineral', // 礦物油
  'Synthetic', // 合成油
] as const

/**
 * 車輛類別
 */
export const VEHICLE_CATEGORIES = [
  'regular', // 一般轎車
  'truck', // 卡車
  'malaysia', // 馬來西亞車款
  'luxury', // 豪華車
  'commercial', // 商用車
  'motorcycle', // 機車
  'bus', // 巴士
] as const

/**
 * 引擎類型
 */
export const ENGINE_TYPES = [
  'gasoline', // 汽油
  'diesel', // 柴油
  'hybrid', // 混合動力
  'electric', // 純電動
  'plugin-hybrid', // 插電式混合動力
] as const

// ==================== 類型守護函數 ====================

/**
 * 檢查是否為有效的冷媒類型
 */
export function isValidRefrigerantType(type: string): type is typeof REFRIGERANT_TYPES[number] {
  return REFRIGERANT_TYPES.includes(type as any)
}

/**
 * 檢查是否為有效的冷凍油類型
 */
export function isValidOilType(oil: string): oil is typeof OIL_TYPES[number] {
  return OIL_TYPES.includes(oil as any)
}

/**
 * 檢查是否為有效的車輛類別
 */
export function isValidVehicleCategory(category: string): category is typeof VEHICLE_CATEGORIES[number] {
  return VEHICLE_CATEGORIES.includes(category as any)
}

// ==================== 實用函數類型 ====================

/**
 * 冷媒充填量單位轉換接口
 */
export interface RefrigerantAmountConverter {
  fromUnit: 'g' | 'kg' | 'oz' | 'lb'
  toUnit: 'g' | 'kg' | 'oz' | 'lb'
  value: number
}

/**
 * 地區特定配置接口
 */
export interface RegionalConfig {
  region: 'Taiwan' | 'Malaysia' | 'Singapore' | 'Thailand' | 'Global'
  currency: 'TWD' | 'MYR' | 'SGD' | 'THB' | 'USD'
  units: {
    weight: 'g' | 'kg'
    volume: 'ml' | 'L'
    pressure: 'bar' | 'psi'
    temperature: 'C' | 'F'
  }
  regulations: string[]
  standards: string[]
} 