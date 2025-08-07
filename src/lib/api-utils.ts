/**
 * 🔧 API 工具類
 * 
 * 統一API響應格式和錯誤處理
 */

import { NextResponse } from 'next/server'
import { ApiResponse, ErrorResponse, SuccessResponse, PaginatedResponse } from '@/types'

/**
 * 創建成功響應
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  status: number = 200
): NextResponse {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }
  
  return NextResponse.json(response, { status })
}

/**
 * 創建錯誤響應
 */
export function createErrorResponse(
  error: string,
  message: string = error,
  status: number = 500,
  path?: string
): NextResponse {
  const response: ErrorResponse = {
    success: false,
    error,
    message,
    statusCode: status,
    timestamp: new Date().toISOString(),
    path
  }
  
  return NextResponse.json(response, { status })
}

/**
 * 創建分頁響應
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): NextResponse {
  const totalPages = Math.ceil(total / limit)
  const hasNext = page < totalPages
  const hasPrev = page > 1
  
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev
    }
  }
  
  return NextResponse.json(response)
}

/**
 * 處理API錯誤
 */
export function handleApiError(error: unknown, context: string = 'API'): NextResponse {
  console.error(`❌ [${context}] API錯誤:`, error)
  
  if (error instanceof Error) {
    // 根據錯誤類型返回不同的狀態碼
    if (error.message.includes('not found') || error.message.includes('找不到')) {
      return createErrorResponse(error.message, '資源不存在', 404)
    }
    
    if (error.message.includes('validation') || error.message.includes('驗證')) {
      return createErrorResponse(error.message, '資料驗證失敗', 400)
    }
    
    if (error.message.includes('unauthorized') || error.message.includes('未授權')) {
      return createErrorResponse(error.message, '未授權操作', 401)
    }
    
    if (error.message.includes('forbidden') || error.message.includes('禁止')) {
      return createErrorResponse(error.message, '禁止訪問', 403)
    }
    
    return createErrorResponse(error.message, '服務器內部錯誤', 500)
  }
  
  return createErrorResponse('未知錯誤', '服務器內部錯誤', 500)
}

/**
 * 驗證分頁參數
 */
export function validatePaginationParams(
  page?: string | null,
  limit?: string | null
): { page: number; limit: number; valid: boolean; error?: string } {
  const parsedPage = parseInt(page || '1')
  const parsedLimit = parseInt(limit || '20')
  
  if (isNaN(parsedPage) || parsedPage < 1) {
    return { page: 1, limit: 20, valid: false, error: '頁碼必須是大於0的數字' }
  }
  
  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return { page: parsedPage, limit: 20, valid: false, error: '每頁數量必須在1-100之間' }
  }
  
  return { page: parsedPage, limit: parsedLimit, valid: true }
}

/**
 * 安全的JSON解析
 */
export async function safeJsonParse<T>(request: Request): Promise<{ data?: T; error?: string }> {
  try {
    const text = await request.text()
    if (!text.trim()) {
      return { error: '請求體不能為空' }
    }
    
    const data = JSON.parse(text) as T
    return { data }
  } catch (error) {
    return { error: '無效的JSON格式' }
  }
}

/**
 * 驗證必要欄位
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })
  
  return {
    valid: missingFields.length === 0,
    missingFields
  }
}

/**
 * 格式化數據庫錯誤
 */
export function formatDatabaseError(error: any): string {
  if (error.code === 'P2002') {
    return '資料重複，該記錄已存在'
  }
  
  if (error.code === 'P2025') {
    return '找不到要操作的記錄'
  }
  
  if (error.code === 'P2003') {
    return '外鍵約束錯誤，請檢查關聯資料'
  }
  
  if (error.code === 'P2014') {
    return '資料關聯錯誤，無法刪除正在使用的記錄'
  }
  
  return error.message || '資料庫操作失敗'
}

/**
 * 記錄API請求
 */
export function logApiRequest(
  method: string,
  path: string,
  params?: Record<string, any>,
  duration?: number
): void {
  const timestamp = new Date().toISOString()
  const info = {
    timestamp,
    method,
    path,
    params,
    duration: duration ? `${duration}ms` : undefined
  }
  
  console.log(`📡 [API] ${method} ${path}`, info)
}