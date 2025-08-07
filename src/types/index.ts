// User types
export interface User {
  id: string
  email: string
  name?: string | null
  role: 'ADMIN' | 'EDITOR'
  createdAt: Date
  updatedAt: Date
}

// Product types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: Category
  categoryId: string
  price?: number | null
  images: string[]
  features: string[]
  specifications: Record<string, string>
  stock: number
  isActive: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  products?: Product[]
  createdAt: Date
  updatedAt: Date
}

// Vehicle types (統一架構)
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

export interface VehicleModel {
  id: string
  brandId: string
  brand?: VehicleBrand
  modelName: string
  year?: string
  engineType?: string
  engineSize?: string
  refrigerantType: string
  fillAmount: string
  oilType?: string
  oilAmount?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Refrigerant types
export interface Refrigerant {
  id: string
  name: string
  code: string
  type: string
  gwp: number
  odp: number
  boilingPoint: number
  criticalTemp: number
  properties: RefrigerantProperties
  applications: string[]
  safety: SafetyInfo
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RefrigerantProperties {
  chemicalFormula?: string
  molecularWeight?: number
  density?: number
  flammability?: string
  toxicity?: string
}

export interface SafetyInfo {
  classification?: string
  precautions?: string[]
  firstAid?: string
  storage?: string
}

// News types
export interface News {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string | null
  author: string
  tags: string[]
  viewCount: number
  publishedAt?: Date | null
  scheduledAt?: Date | null
  isPublished: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  createdAt: Date
  updatedAt: Date
}

// Settings types
export interface Setting {
  id: string
  key: string
  value: any
  updatedAt: Date
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface ProductFormData {
  name: string
  description: string
  categoryId: string
  price?: number
  images: string[]
  features: string[]
  specifications: Record<string, string>
  stock: number
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
}

export interface VehicleBrandFormData {
  name: string
  nameEn: string
  category: 'regular' | 'truck' | 'malaysia' | 'luxury' | 'commercial'
  logoUrl?: string
  order: number
}

export interface VehicleModelFormData {
  brandId: string
  modelName: string
  year?: string
  engineType?: string
  engineSize?: string
  refrigerantType: string
  fillAmount: string
  oilType?: string
  oilAmount?: string
  notes?: string
}

export interface RefrigerantFormData {
  name: string
  code: string
  type: string
  gwp: number
  odp: number
  boilingPoint: number
  criticalTemp: number
  properties: RefrigerantProperties
  applications: string[]
  safety: SafetyInfo
  isActive: boolean
}

export interface NewsFormData {
  title: string
  content: string
  excerpt: string
  coverImage?: string
  author: string
  tags: string[]
  publishedAt?: Date
  scheduledAt?: Date
  isPublished: boolean
  seoTitle?: string
  seoDescription?: string
}

// API Response types - 統一標準
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  total?: number
}

// 錯誤響應統一格式
export interface ErrorResponse {
  success: false
  error: string
  message: string
  statusCode: number
  timestamp: string
  path?: string
}

// 成功響應統一格式
export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  timestamp: string
}

// 搜尋和篩選參數
export interface SearchParams {
  query?: string
  filters?: Record<string, any>
  sort?: string
  order?: 'asc' | 'desc'
}

// 檔案上傳相關
export interface FileUploadRequest {
  file: File
  category?: string
  metadata?: Record<string, any>
}

export interface FileUploadResponse {
  success: boolean
  url?: string
  filename?: string
  size?: number
  error?: string
}

// 服務狀態相關
export interface ServiceHealthStatus {
  service: string
  status: 'healthy' | 'warning' | 'error'
  uptime: number
  lastCheck: string
  details?: Record<string, any>
}