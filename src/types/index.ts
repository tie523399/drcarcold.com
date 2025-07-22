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

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
} 