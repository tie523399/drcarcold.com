import { AutoStartupService } from './auto-startup-service'

/**
 * 自動化服務管理器 - 單例模式
 * 統一管理所有自動化服務，包括爬蟲、SEO內容生成和文章清理
 */
export class AutoServiceManager {
  private static instance: AutoServiceManager | null = null
  private autoStartupService: AutoStartupService
  private isInitialized = false

  constructor() {
    if (AutoServiceManager.instance) {
      return AutoServiceManager.instance
    }
    
    this.autoStartupService = new AutoStartupService()
    AutoServiceManager.instance = this
  }

  /**
   * 獲取服務狀態
   */
  public getStatus() {
    return this.autoStartupService.getStatus()
  }

  /**
   * 啟動所有自動服務
   */
  public async start(): Promise<void> {
    try {
      await this.autoStartupService.start()
      this.isInitialized = true
    } catch (error) {
      console.error('啟動自動服務失敗:', error)
      throw error
    }
  }

  /**
   * 停止所有自動服務
   */
  public async stop(): Promise<void> {
    try {
      await this.autoStartupService.stop()
      this.isInitialized = false
    } catch (error) {
      console.error('停止自動服務失敗:', error)
      throw error
    }
  }

  /**
   * 重新啟動所有服務
   */
  public async restart(): Promise<void> {
    await this.stop()
    await this.start()
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