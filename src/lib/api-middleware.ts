/**
 * 🔧 API 中間件
 * 
 * 統一的API請求處理和錯誤處理中間件
 */

import { NextRequest } from 'next/server'
import { handleApiError, logApiRequest } from './api-utils'

/**
 * API請求處理器裝飾器
 */
export function withApiHandler<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  options: {
    requireAuth?: boolean
    logRequests?: boolean
    context?: string
  } = {}
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now()
    const request = args[0] as NextRequest
    const method = request.method
    const path = new URL(request.url).pathname
    
    try {
      // 記錄請求
      if (options.logRequests !== false) {
        logApiRequest(method, path)
      }
      
      // 驗證授權（如果需要）
      if (options.requireAuth) {
        const authResult = await validateAuth(request)
        if (!authResult.valid) {
          return handleApiError(new Error('未授權訪問'), options.context || 'Auth')
        }
      }
      
      // 執行處理器
      const response = await handler(...args)
      
      // 記錄完成時間
      const duration = Date.now() - startTime
      if (options.logRequests !== false) {
        console.log(`✅ [API] ${method} ${path} - ${duration}ms`)
      }
      
      return response
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ [API] ${method} ${path} - ${duration}ms`, error)
      return handleApiError(error, options.context || 'API')
    }
  }
}

/**
 * 驗證API授權
 */
async function validateAuth(request: NextRequest): Promise<{ valid: boolean; user?: any }> {
  try {
    // 檢查是否為管理路由
    const pathname = new URL(request.url).pathname
    if (pathname.startsWith('/api/admin/')) {
      // 這裡應該實現實際的授權檢查
      // 暫時返回true，實際應該檢查JWT token或session
      return { valid: true }
    }
    
    // 公開API路由
    return { valid: true }
  } catch (error) {
    console.error('授權驗證失敗:', error)
    return { valid: false }
  }
}

/**
 * CORS中間件
 */
export function withCors<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const response = await handler(...args)
    
    // 設置CORS標頭
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }
}

/**
 * 請求限制中間件
 */
export function withRateLimit<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  options: {
    maxRequests: number
    windowMs: number
  } = { maxRequests: 100, windowMs: 60000 }
) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>()
  
  return async (...args: T): Promise<Response> => {
    const request = args[0] as NextRequest
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    // 清理過期的記錄
    for (const [ip, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(ip)
      }
    }
    
    // 檢查當前IP的請求次數
    const clientData = requestCounts.get(clientIp)
    if (clientData) {
      if (clientData.count >= options.maxRequests) {
        return handleApiError(new Error('請求過於頻繁'), 'RateLimit')
      }
      clientData.count++
    } else {
      requestCounts.set(clientIp, {
        count: 1,
        resetTime: now + options.windowMs
      })
    }
    
    return handler(...args)
  }
}

/**
 * 響應時間監控中間件
 */
export function withResponseTimeMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  slowThreshold: number = 1000
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now()
    const request = args[0] as NextRequest
    const method = request.method
    const path = new URL(request.url).pathname
    
    try {
      const response = await handler(...args)
      const duration = Date.now() - startTime
      
      // 如果響應時間過長，記錄警告
      if (duration > slowThreshold) {
        console.warn(`⚠️ [SLOW API] ${method} ${path} - ${duration}ms (閾值: ${slowThreshold}ms)`)
      }
      
      // 在響應頭中添加響應時間
      response.headers.set('X-Response-Time', `${duration}ms`)
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ [API ERROR] ${method} ${path} - ${duration}ms`, error)
      throw error
    }
  }
}

/**
 * 組合多個中間件
 */
export function composeMiddleware<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  ...middlewares: Array<(handler: (...args: T) => Promise<Response>) => (...args: T) => Promise<Response>>
): (...args: T) => Promise<Response> {
  return middlewares.reduceRight(
    (acc, middleware) => middleware(acc),
    handler
  )
}