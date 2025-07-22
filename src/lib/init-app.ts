// 在服務器端自動初始化應用
let isInitializing = false
let isInitialized = false

export async function initializeApp() {
  // 避免重複初始化
  if (isInitialized || isInitializing) {
    return
  }

  isInitializing = true
  
  try {
    console.log('🌟 Next.js 應用啟動，開始自動初始化...')
    
    // 動態導入避免在客戶端執行
    if (typeof window === 'undefined') {
      const { startupService } = await import('./startup-service')
      await startupService.initialize()
      isInitialized = true
      console.log('🎉 自動化服務已在應用啟動時成功初始化！')
    }
  } catch (error) {
    console.error('❌ 應用自動初始化失敗:', error)
  } finally {
    isInitializing = false
  }
}

// 立即執行初始化（僅在服務器端）
if (typeof window === 'undefined') {
  // 使用 setImmediate 確保在下一個事件循環中執行
  setImmediate(() => {
    initializeApp()
  })
}

export { isInitialized, isInitializing } 