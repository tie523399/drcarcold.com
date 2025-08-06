/**
 * 🔒 統一錯誤處理和防護機制
 * 
 * 確保系統穩定運行，防止單點故障導致系統崩潰
 */

import { SystemError, SystemErrorType, SystemEvent, SystemEventType } from '@/types/system'
import { prisma } from './prisma'

export class ErrorHandler {
  private static readonly MAX_RETRY_ATTEMPTS = 3
  private static readonly RETRY_DELAY_MS = 5000
  private static errorQueue: SystemError[] = []
  private static eventQueue: SystemEvent[] = []

  /**
   * 處理系統錯誤
   */
  static async handleError(error: SystemError): Promise<void> {
    try {
      // 記錄錯誤到控制台
      console.error(`[${error.type}] ${error.component}: ${error.message}`, error.details)

      // 添加到錯誤隊列
      this.errorQueue.push(error)

      // 發送系統事件
      await this.emitSystemEvent({
        type: SystemEventType.ERROR_OCCURRED,
        payload: error,
        timestamp: new Date(),
        source: error.component
      })

      // 根據錯誤類型執行特定處理
      await this.handleSpecificError(error)

    } catch (handleError) {
      console.error('錯誤處理器本身發生錯誤:', handleError)
    }
  }

  /**
   * 處理特定類型的錯誤
   */
  private static async handleSpecificError(error: SystemError): Promise<void> {
    switch (error.type) {
      case SystemErrorType.CONFIG_ERROR:
        await this.handleConfigError(error)
        break
      
      case SystemErrorType.DATABASE_ERROR:
        await this.handleDatabaseError(error)
        break
      
      case SystemErrorType.API_ERROR:
        await this.handleApiError(error)
        break
      
      case SystemErrorType.SERVICE_ERROR:
        await this.handleServiceError(error)
        break
      
      default:
        console.log('未知錯誤類型，執行通用處理')
    }
  }

  /**
   * 處理配置錯誤
   */
  private static async handleConfigError(error: SystemError): Promise<void> {
    console.log('🔧 嘗試自動修復配置錯誤...')
    
    try {
      // 嘗試重新載入配置
      const { autoRepairConfig } = await import('./config-validator')
      await autoRepairConfig()
      
      console.log('✅ 配置錯誤自動修復成功')
    } catch (repairError) {
      console.error('❌ 配置自動修復失敗:', repairError)
    }
  }

  /**
   * 處理數據庫錯誤
   */
  private static async handleDatabaseError(error: SystemError): Promise<void> {
    console.log('💾 數據庫錯誤，嘗試重新連接...')
    
    // 實施數據庫重連邏輯
    for (let i = 0; i < this.MAX_RETRY_ATTEMPTS; i++) {
      try {
        await prisma.$connect()
        console.log('✅ 數據庫重新連接成功')
        return
      } catch (retryError) {
        console.log(`❌ 數據庫重連嘗試 ${i + 1}/${this.MAX_RETRY_ATTEMPTS} 失敗`)
        if (i < this.MAX_RETRY_ATTEMPTS - 1) {
          await this.delay(this.RETRY_DELAY_MS)
        }
      }
    }
    
    console.error('💥 數據庫重連完全失敗，需要人工介入')
  }

  /**
   * 處理API錯誤
   */
  private static async handleApiError(error: SystemError): Promise<void> {
    console.log('🌐 API錯誤，檢查網絡連接和API配置...')
    
    // 記錄API錯誤統計
    const apiErrorCount = this.errorQueue.filter(
      e => e.type === SystemErrorType.API_ERROR && 
      Date.now() - e.timestamp.getTime() < 3600000 // 1小時內
    ).length

    if (apiErrorCount > 10) {
      console.warn('⚠️ 1小時內API錯誤過多，建議檢查網絡和API配置')
    }
  }

  /**
   * 處理服務錯誤
   */
  private static async handleServiceError(error: SystemError): Promise<void> {
    console.log('⚙️ 服務錯誤，嘗試重啟相關服務...')
    
    try {
      // 根據錯誤來源重啟相應服務
      if (error.component.includes('AutoServiceManager')) {
        const { getAutoServiceManager } = await import('./auto-service-manager')
        const manager = getAutoServiceManager()
        
        console.log('🔄 重啟自動化服務管理器...')
        await manager.stop()
        await this.delay(2000)
        await manager.start()
        
        console.log('✅ 自動化服務管理器重啟成功')
      }
    } catch (restartError) {
      console.error('❌ 服務重啟失敗:', restartError)
    }
  }

  /**
   * 安全執行函數（帶重試機制）
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    operationName: string,
    component: string,
    maxRetries: number = this.MAX_RETRY_ATTEMPTS
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        const systemError: SystemError = {
          type: SystemErrorType.SERVICE_ERROR,
          message: `${operationName} 執行失敗 (嘗試 ${attempt}/${maxRetries})`,
          details: error,
          timestamp: new Date(),
          component
        }

        await this.handleError(systemError)

        if (attempt === maxRetries) {
          console.error(`💥 ${operationName} 在 ${maxRetries} 次嘗試後完全失敗`)
          return null
        }

        await this.delay(this.RETRY_DELAY_MS * attempt) // 遞增延遲
      }
    }

    return null
  }

  /**
   * 創建安全的包裝函數
   */
  static createSafeWrapper<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    functionName: string,
    component: string
  ): (...args: T) => Promise<R | null> {
    return async (...args: T): Promise<R | null> => {
      return this.safeExecute(
        () => fn(...args),
        functionName,
        component
      )
    }
  }

  /**
   * 監控和清理錯誤隊列
   */
  static startErrorMonitoring(): void {
    setInterval(() => {
      // 清理1小時前的錯誤
      const oneHourAgo = Date.now() - 3600000
      this.errorQueue = this.errorQueue.filter(
        error => error.timestamp.getTime() > oneHourAgo
      )

      // 清理1天前的事件
      const oneDayAgo = Date.now() - 86400000
      this.eventQueue = this.eventQueue.filter(
        event => event.timestamp.getTime() > oneDayAgo
      )

      // 報告錯誤統計
      if (this.errorQueue.length > 0) {
        const errorByType = this.errorQueue.reduce((acc, error) => {
          acc[error.type] = (acc[error.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        console.log('📊 1小時內錯誤統計:', errorByType)
      }
    }, 300000) // 每5分鐘檢查一次
  }

  /**
   * 發送系統事件
   */
  private static async emitSystemEvent(event: SystemEvent): Promise<void> {
    try {
      this.eventQueue.push(event)
      
      // 可以在這裡添加事件處理邏輯
      // 例如：發送通知、記錄到外部系統等
      
    } catch (error) {
      console.error('發送系統事件失敗:', error)
    }
  }

  /**
   * 獲取錯誤統計
   */
  static getErrorStats() {
    const now = Date.now()
    const oneHour = 3600000
    const oneDay = 86400000

    const hourlyErrors = this.errorQueue.filter(
      error => now - error.timestamp.getTime() < oneHour
    )

    const dailyErrors = this.errorQueue.filter(
      error => now - error.timestamp.getTime() < oneDay
    )

    return {
      hourly: {
        total: hourlyErrors.length,
        byType: this.groupErrorsByType(hourlyErrors),
        byComponent: this.groupErrorsByComponent(hourlyErrors)
      },
      daily: {
        total: dailyErrors.length,
        byType: this.groupErrorsByType(dailyErrors),
        byComponent: this.groupErrorsByComponent(dailyErrors)
      }
    }
  }

  /**
   * 按類型分組錯誤
   */
  private static groupErrorsByType(errors: SystemError[]) {
    return errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * 按組件分組錯誤
   */
  private static groupErrorsByComponent(errors: SystemError[]) {
    return errors.reduce((acc, error) => {
      acc[error.component] = (acc[error.component] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  /**
   * 檢查系統健康狀態
   */
  static checkSystemHealth(): {
    healthy: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []
    
    const stats = this.getErrorStats()
    
    // 檢查錯誤率
    if (stats.hourly.total > 10) {
      issues.push('1小時內錯誤數量過多')
      recommendations.push('檢查系統配置和網絡連接')
    }
    
    if (stats.daily.total > 100) {
      issues.push('1天內錯誤數量異常高')
      recommendations.push('進行全面的系統檢查')
    }
    
    // 檢查特定錯誤類型
    if (stats.hourly.byType[SystemErrorType.DATABASE_ERROR] > 3) {
      issues.push('數據庫連接不穩定')
      recommendations.push('檢查數據庫配置和網絡')
    }
    
    if (stats.hourly.byType[SystemErrorType.CONFIG_ERROR] > 2) {
      issues.push('配置錯誤頻繁')
      recommendations.push('檢查系統配置的完整性')
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations
    }
  }

  /**
   * 延遲函數
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 創建防護裝飾器
   */
  static guardedMethod(component: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        return ErrorHandler.safeExecute(
          () => method.apply(this, args),
          propertyName,
          component
        )
      }
    }
  }

  /**
   * 緊急停止所有服務
   */
  static async emergencyShutdown(): Promise<void> {
    console.log('🚨 執行緊急停止程序...')
    
    try {
                          // 停止自動化服務
      const { getAutoServiceManager } = await import('./auto-service-manager')
      const manager = getAutoServiceManager()
      await manager.stop()
      
      // 關閉數據庫連接
      await prisma.$disconnect()
      
      console.log('✅ 緊急停止完成')
    } catch (error) {
      console.error('❌ 緊急停止失敗:', error)
    }
  }
}

/**
 * 全局錯誤處理器初始化
 */
export function initializeErrorHandling(): void {
  // 啟動錯誤監控
  ErrorHandler.startErrorMonitoring()

  // 處理未捕獲的 Promise 拒絕
  process.on('unhandledRejection', (reason, promise) => {
    ErrorHandler.handleError({
      type: SystemErrorType.SERVICE_ERROR,
      message: '未處理的 Promise 拒絕',
      details: { reason, promise },
      timestamp: new Date(),
      component: 'Global'
    })
  })

  // 處理未捕獲的異常
  process.on('uncaughtException', (error) => {
    ErrorHandler.handleError({
      type: SystemErrorType.SERVICE_ERROR,
      message: '未捕獲的異常',
      details: error,
      timestamp: new Date(),
      component: 'Global'
    })

    // 緊急停止
    ErrorHandler.emergencyShutdown().then(() => {
      process.exit(1)
    })
  })

  console.log('🛡️ 全局錯誤處理已初始化')
}

/**
 * 快速創建系統錯誤
 */
export function createError(
  type: SystemErrorType,
  message: string,
  component: string,
  details?: any
): SystemError {
  return {
    type,
    message,
    details,
    timestamp: new Date(),
    component
  }
}

/**
 * 安全執行的快捷函數
 */
export async function safeRun<T>(
  operation: () => Promise<T>,
  operationName: string,
  component: string = 'Unknown'
): Promise<T | null> {
  return ErrorHandler.safeExecute(operation, operationName, component)
} 