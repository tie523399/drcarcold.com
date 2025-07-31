import { z } from 'zod'

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件'),
  password: z.string().min(6, '密碼至少需要6個字符'),
})

// Product validations
export const productSchema = z.object({
  name: z.string().min(1, '產品名稱為必填'),
  description: z.string().min(1, '產品描述為必填'),
  details: z.string().optional(),
  categoryId: z.string().min(1, '請選擇產品類別'),
  price: z.number().min(0, '價格不能為負數').optional(),
  images: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string()).default({}),
  stock: z.number().int().min(0, '庫存不能為負數').default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, '類別名稱為必填'),
  slug: z.string().min(1, 'Slug 為必填'),
  description: z.string().optional(),
  image: z.string().optional(),
})

// Refrigerant validations
export const refrigerantSchema = z.object({
  name: z.string().min(1, '冷媒名稱為必填'),
  code: z.string().min(1, '冷媒代碼為必填'),
  type: z.string().min(1, '冷媒類型為必填'),
  gwp: z.number().min(0, 'GWP 值不能為負數'),
  odp: z.number().min(0, 'ODP 值不能為負數'),
  boilingPoint: z.number(),
  criticalTemp: z.number(),
  properties: z.object({
    chemicalFormula: z.string().optional(),
    molecularWeight: z.number().optional(),
    density: z.number().optional(),
    flammability: z.string().optional(),
    toxicity: z.string().optional(),
  }).default({}),
  applications: z.array(z.string()).default([]),
  safety: z.object({
    classification: z.string().optional(),
    precautions: z.array(z.string()).optional(),
    firstAid: z.string().optional(),
    storage: z.string().optional(),
  }).default({}),
  isActive: z.boolean().default(true),
})

// News validations
export const newsSchema = z.object({
  title: z.string().min(1, '標題為必填'),
  content: z.string().min(1, '內容為必填'),
  excerpt: z.string().min(1, '摘要為必填').max(200, '摘要不能超過200字'),
  coverImage: z.string().optional(),
  author: z.string().min(1, '作者為必填'),
  tags: z.array(z.string()).default([]),
  publishedAt: z.date().optional(),
  scheduledAt: z.date().optional(),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

// Settings validations
export const settingSchema = z.object({
  key: z.string().min(1, 'Key 為必填'),
  value: z.any(),
}) 