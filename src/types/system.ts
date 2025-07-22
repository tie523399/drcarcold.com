/**
 * 🔒 系統核心類型定義
 * 
 * ⚠️ 重要：這些類型定義是系統架構的基礎，請勿隨意修改
 * 修改前請先閱讀 docs/system-architecture.md
 */

// ==================== 自動化服務類型 ====================

/**
 * 自動化服務配置接口
 * 🔒 核心接口 - 修改需謹慎
 */
export interface AutoServiceConfig {
  // 爬蟲設定
  crawlerEnabled: boolean
  crawlerInterval: number // 分鐘
  
  // SEO 文章生成設定
  seoGeneratorEnabled: boolean
  seoGeneratorInterval: number // 小時
  seoGeneratorCount: number // 每次生成數量
  
  // 文章管理設定
  maxArticleCount: number // 最大文章數量
  cleanupInterval: number // 清理檢查間隔 (小時)
  minViewCountToKeep: number // 保留文章的最低瀏覽量
}

/**
 * 服務狀態接口
 * 🔒 核心接口 - 修改需謹慎
 */
export interface ServiceStatus {
  isRunning: boolean
  config: AutoServiceConfig
  services: {
    crawler: ServiceInfo
    seoGenerator: ServiceInfo
    cleanup: ServiceInfo
  }
}

/**
 * 單個服務信息接口
 */
export interface ServiceInfo {
  enabled: boolean
  running: boolean
  interval: string
}

// ==================== 爬蟲相關類型 ====================

/**
 * 新聞來源配置接口
 * 🔒 核心接口 - 數據庫映射
 */
export interface NewsSource {
  id: string
  name: string
  url: string
  enabled: boolean
  crawlInterval: number
  maxArticlesPerCrawl: number
  selectors?: {
    articleLinks?: string
    title?: string
    content?: string
    author?: string
    publishDate?: string
  }
  lastCrawl?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 爬蟲狀態接口
 */
export interface CrawlerStatus {
  isRunning: boolean
  totalSources: number
  activeSources: number
  lastCrawl: string
  status: string
}

/**
 * 文章內容接口
 */
export interface ArticleContent {
  title: string
  content: string
  excerpt?: string
  author?: string
  publishDate?: Date
  tags?: string[]
  url: string
  imageUrl?: string
}

// ==================== API 響應類型 ====================

/**
 * 標準 API 響應接口
 * 🔒 核心接口 - 確保API一致性
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 分頁響應接口
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ==================== 設定相關類型 ====================

/**
 * 系統設定鍵值常量
 * 🔒 核心常量 - 與數據庫保持同步
 */
export const SETTING_KEYS = {
  // 爬蟲設定
  AUTO_CRAWLER_ENABLED: 'autoCrawlerEnabled',
  AUTO_CRAWLER_INTERVAL: 'autoCrawlerInterval',
  
  // SEO 設定
  AUTO_SEO_ENABLED: 'autoSeoEnabled',
  AUTO_SEO_INTERVAL: 'autoSeoInterval',
  AUTO_SEO_COUNT: 'autoSeoCount',
  
  // 文章管理設定
  MAX_ARTICLE_COUNT: 'maxArticleCount',
  CLEANUP_INTERVAL: 'cleanupInterval',
  MIN_VIEW_COUNT_TO_KEEP: 'minViewCountToKeep',
  
  // API 金鑰設定
  COHERE_API_KEY: 'cohereApiKey',
  OPENAI_API_KEY: 'openaiApiKey',
  GROQ_API_KEY: 'groqApiKey',
  GEMINI_API_KEY: 'geminiApiKey',
} as const

/**
 * 設定值類型
 */
export type SettingKey = typeof SETTING_KEYS[keyof typeof SETTING_KEYS]

/**
 * 設定項接口
 */
export interface Setting {
  id?: string
  key: SettingKey
  value: string
  createdAt?: Date
  updatedAt?: Date
}

// ==================== SEO 相關類型 ====================

/**
 * SEO 文章主題接口
 */
export interface SEOArticleTopic {
  title: string
  keywords: string[]
  outline: string[]
}

/**
 * SEO 內容接口
 */
export interface SEOContent {
  title: string
  content: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  ogTitle: string
  ogDescription: string
  structuredData: Record<string, any>
  readingTime: number
  relatedKeywords: string[]
}

// ==================== 錯誤處理類型 ====================

/**
 * 系統錯誤類型枚舉
 */
export enum SystemErrorType {
  CONFIG_ERROR = 'CONFIG_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  API_ERROR = 'API_ERROR',
  SERVICE_ERROR = 'SERVICE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * 系統錯誤接口
 */
export interface SystemError {
  type: SystemErrorType
  message: string
  details?: any
  timestamp: Date
  component: string
}

// ==================== 驗證類型 ====================

/**
 * 配置驗證結果接口
 */
export interface ConfigValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 服務健康檢查結果接口
 */
export interface HealthCheckResult {
  healthy: boolean
  services: {
    database: boolean
    crawler: boolean
    seoGenerator: boolean
    cleanup: boolean
  }
  errors: string[]
  lastCheck: Date
}

// ==================== 統計類型 ====================

/**
 * 爬蟲統計接口
 */
export interface CrawlerStats {
  todayArticles: number
  successRate: number
  totalSources: number
  activeSources: number
  lastCrawlTime?: Date
}

/**
 * 文章統計接口
 */
export interface ArticleStats {
  total: number
  published: number
  drafts: number
  needsCleanup: number
  maxAllowed: number
}

// ==================== 事件類型 ====================

/**
 * 系統事件類型
 */
export enum SystemEventType {
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_STOPPED = 'SERVICE_STOPPED',
  CONFIG_UPDATED = 'CONFIG_UPDATED',
  CRAWL_COMPLETED = 'CRAWL_COMPLETED',
  SEO_GENERATED = 'SEO_GENERATED',
  CLEANUP_COMPLETED = 'CLEANUP_COMPLETED',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
}

/**
 * 系統事件接口
 */
export interface SystemEvent {
  type: SystemEventType
  payload: any
  timestamp: Date
  source: string
}

// ==================== 類型守護函數 ====================

/**
 * 檢查是否為有效的 AutoServiceConfig
 */
export function isValidAutoServiceConfig(config: any): config is AutoServiceConfig {
  return (
    typeof config === 'object' &&
    typeof config.crawlerEnabled === 'boolean' &&
    typeof config.crawlerInterval === 'number' &&
    typeof config.seoGeneratorEnabled === 'boolean' &&
    typeof config.seoGeneratorInterval === 'number' &&
    typeof config.seoGeneratorCount === 'number' &&
    typeof config.maxArticleCount === 'number' &&
    typeof config.cleanupInterval === 'number' &&
    typeof config.minViewCountToKeep === 'number'
  )
}

/**
 * 檢查是否為有效的 API 響應
 */
export function isValidApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean'
  )
}

// ==================== 默認值常量 ====================

/**
 * 默認自動化服務配置
 * 🔒 核心配置 - 系統啟動的備用值
 */
export const DEFAULT_AUTO_SERVICE_CONFIG: AutoServiceConfig = {
  crawlerEnabled: true,
  crawlerInterval: 60, // 每60分鐘
  seoGeneratorEnabled: true,
  seoGeneratorInterval: 6, // 每6小時
  seoGeneratorCount: 2, // 每次2篇
  maxArticleCount: 20, // 最多20篇
  cleanupInterval: 1, // 每小時檢查
  minViewCountToKeep: 0, // 瀏覽量0以上保留
}

/**
 * 配置限制常量
 */
export const CONFIG_LIMITS = {
  CRAWLER_INTERVAL: { min: 5, max: 1440 }, // 5分鐘到24小時
  SEO_INTERVAL: { min: 1, max: 168 }, // 1小時到7天
  SEO_COUNT: { min: 1, max: 10 }, // 每次1-10篇
  MAX_ARTICLES: { min: 10, max: 100 }, // 10-100篇
  CLEANUP_INTERVAL: { min: 1, max: 24 }, // 1-24小時
} as const 