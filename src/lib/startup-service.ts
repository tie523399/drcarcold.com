import { autoServiceManager } from './auto-service-manager'
import { prisma } from './prisma'

export class StartupService {
  private static instance: StartupService | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): StartupService {
    if (!StartupService.instance) {
      StartupService.instance = new StartupService()
    }
    return StartupService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 應用已初始化，跳過啟動服務')
      return
    }

    console.log('🚀 開始初始化應用啟動服務...')

    try {
      // 1. 確保數據庫連接
      await this.ensureDatabaseConnection()

      // 2. 初始化預設設定
      await this.initializeDefaultSettings()

      // 3. 啟動自動化服務
      await this.startAutomationServices()

      this.isInitialized = true
      console.log('✅ 應用啟動服務初始化完成！')

    } catch (error) {
      console.error('❌ 應用啟動服務初始化失敗:', error)
      // 不拋出錯誤，確保應用仍能正常啟動
    }
  }

  private async ensureDatabaseConnection(): Promise<void> {
    try {
      console.log('🔗 檢查數據庫連接...')
      await prisma.$connect()
      console.log('✅ 數據庫連接成功')
    } catch (error) {
      console.error('❌ 數據庫連接失敗:', error)
      throw error
    }
  }

  private async initializeDefaultSettings(): Promise<void> {
    console.log('⚙️ 初始化預設設定...')

    const defaultSettings = [
      { key: 'autoCrawlerEnabled', value: 'true' },
      { key: 'autoCrawlerInterval', value: '60' },
      { key: 'autoSeoEnabled', value: 'true' },
      { key: 'autoSeoInterval', value: '6' },
      { key: 'autoSeoCount', value: '2' },
      { key: 'maxArticleCount', value: '20' },
      { key: 'cleanupInterval', value: '1' },
      { key: 'minViewCountToKeep', value: '0' },
      { key: 'cohereApiKey', value: '' }, // 需要用戶設定
      { key: 'groqApiKey', value: '' },
      { key: 'openaiApiKey', value: '' },
      { key: 'geminiApiKey', value: '' }
    ]

    for (const setting of defaultSettings) {
      try {
        await prisma.setting.upsert({
          where: { key: setting.key },
          update: {}, // 不覆蓋現有設定
          create: setting
        })
      } catch (error) {
        console.warn(`設定 ${setting.key} 初始化失敗:`, error)
      }
    }

    console.log('✅ 預設設定初始化完成')
  }

  private async startAutomationServices(): Promise<void> {
    console.log('🤖 啟動自動化服務...')

    try {
      // 延遲5秒啟動，確保應用完全載入
      setTimeout(async () => {
        try {
          await autoServiceManager.start()
          console.log('✅ 自動化服務已在背景啟動')
        } catch (error) {
          console.error('❌ 自動化服務啟動失敗:', error)
        }
      }, 5000)

    } catch (error) {
      console.error('❌ 自動化服務啟動失敗:', error)
      // 不拋出錯誤，讓應用繼續運行
    }
  }

  async shutdown(): Promise<void> {
    console.log('🛑 正在關閉自動化服務...')
    
    try {
      await autoServiceManager.stop()
      await prisma.$disconnect()
      console.log('✅ 應用關閉完成')
    } catch (error) {
      console.error('❌ 應用關閉過程中發生錯誤:', error)
    }
  }

  // 健康檢查
  async healthCheck(): Promise<boolean> {
    try {
      // 檢查數據庫連接
      await prisma.$queryRaw`SELECT 1`
      
      // 檢查自動化服務狀態
      const status = autoServiceManager.getStatus()
      
      return status.isRunning
    } catch (error) {
      console.error('健康檢查失敗:', error)
      return false
    }
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      automation: autoServiceManager.getStatus()
    }
  }
}

// 全域實例
export const startupService = StartupService.getInstance()

// 優雅關閉處理
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('\n🛑 收到中斷信號，正在優雅關閉...')
    await startupService.shutdown()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('\n🛑 收到終止信號，正在優雅關閉...')
    await startupService.shutdown()
    process.exit(0)
  })
} 