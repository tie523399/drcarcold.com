import { getAutoStartupService, AutoStartupService } from './auto-startup-service'
import { 
  ServiceConfig, 
  DEFAULT_SERVICE_CONFIG, 
  IServiceManager, 
  ServiceStatus,
  ConfigManager,
  validateServiceConfig,
  mergeServiceConfig
} from './service-config'

/**
 * 自動化服務管理器 - 單例模式
 * 統一管理所有自動化服務，包括爬蟲、SEO內容生成和文章清理
 * 
 * 🔄 統一服務管理 - 使用 AutoStartupService 作為底層實現
 */
export class AutoServiceManager implements IServiceManager {
  private static instance: AutoServiceManager | null = null
  private autoStartupService: AutoStartupService
  private isInitialized = false
  private currentConfig: ServiceConfig = DEFAULT_SERVICE_CONFIG

  constructor() {
    if (AutoServiceManager.instance) {
      return AutoServiceManager.instance
    }
    
    // 🔄 使用單例的 AutoStartupService
    this.autoStartupService = getAutoStartupService()
    AutoServiceManager.instance = this
  }

  /**
   * 獲取服務狀態
   */
  public getStatus(): ServiceStatus[] {
    const baseStatus = this.autoStartupService.getStatus()
    
    return [{
      name: 'AutoStartupService',
      running: baseStatus.isRunning,
      lastRun: new Date(),
      errorCount: 0,
      lastError: undefined
    }]
  }

  /**
   * 獲取當前配置
   */
  public getConfig(): ServiceConfig {
    return this.currentConfig
  }

  /**
   * 更新配置
   */
  public async updateConfig(updates: Partial<ServiceConfig>): Promise<void> {
    // 驗證配置
    const validation = validateServiceConfig(updates)
    if (!validation.valid) {
      throw new Error(`配置驗證失敗: ${validation.errors.join(', ')}`)
    }

    // 合併配置
    this.currentConfig = mergeServiceConfig(this.currentConfig, updates)
    
    // 保存配置
    await ConfigManager.saveConfig(this.currentConfig)
    
    // 重新載入服務配置
    await this.autoStartupService.reloadSettings()
    
    console.log('✅ 服務配置已更新')
  }

  /**
   * 啟動所有自動服務
   */
  public async start(): Promise<void> {
    try {
      console.log('🚀 AutoServiceManager 正在啟動...')
      
      // 載入配置
      this.currentConfig = await ConfigManager.loadConfig()
      
      await this.autoStartupService.start()
      this.isInitialized = true
      console.log('✅ AutoServiceManager 啟動成功')
    } catch (error) {
      console.error('❌ AutoServiceManager 啟動失敗:', error)
      throw error
    }
  }

  /**
   * 停止所有自動服務
   */
  public async stop(): Promise<void> {
    try {
      console.log('⏹️ AutoServiceManager 正在停止...')
      await this.autoStartupService.stop()
      this.isInitialized = false
      console.log('✅ AutoServiceManager 已停止')
    } catch (error) {
      console.error('❌ AutoServiceManager 停止失敗:', error)
      throw error
    }
  }

  /**
   * 重新啟動所有服務
   */
  public async restart(): Promise<void> {
    console.log('🔄 AutoServiceManager 正在重新啟動...')
    await this.stop()
    await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
    await this.start()
    console.log('✅ AutoServiceManager 重新啟動完成')
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const status = this.autoStartupService.getStatus()
      return status.isRunning && this.isInitialized
    } catch (error) {
      console.error('❌ 健康檢查失敗:', error)
      return false
    }
  }

  /**
   * 錯誤處理
   */
  public async handleError(error: Error, context: string): Promise<void> {
    console.error(`❌ [${context}] 服務錯誤:`, error)
    
    // 根據配置決定是否自動重啟
    if (this.currentConfig.errorHandling.enableAutoRestart) {
      try {
        console.log('🔄 嘗試自動重啟服務...')
        await this.restart()
        console.log('✅ 自動重啟成功')
      } catch (restartError) {
        console.error('❌ 自動重啟失敗:', restartError)
      }
    }
  }

  /**
   * 更新服務配置
   */
  public async updateConfig(config: any): Promise<void> {
    try {
      // 重新載入設定
      await this.autoStartupService.reloadSettings()
    } catch (error) {
      console.error('更新配置失敗:', error)
      throw error
    }
  }

  /**
   * 檢查服務是否已初始化
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized
  }

  /**
   * 獲取詳細狀態信息
   */
  public getDetailedStatus() {
    const status = this.getStatus()
    return {
      ...status,
      isInitialized: this.isInitialized,
      config: status.settings
    }
  }
}

/**
 * 單例實例 - 確保全應用只有一個服務管理器
 */
let autoServiceManagerInstance: AutoServiceManager | null = null

export function getAutoServiceManager(): AutoServiceManager {
  if (!autoServiceManagerInstance) {
    autoServiceManagerInstance = new AutoServiceManager()
  }
  return autoServiceManagerInstance
}

// 導出單例實例供直接使用
export const autoServiceManager = getAutoServiceManager()