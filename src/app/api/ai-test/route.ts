import { NextRequest, NextResponse } from 'next/server'
import { aiProviderManager } from '@/lib/ai-provider-manager'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'test-all':
        // 測試所有AI提供商連接
        const testContent = '這是一個測試文章，用來檢驗AI服務是否正常運作。'
        const testKeywords = '測試,AI,服務'
        
        console.log('🧪 開始測試所有AI提供商...')
        
        const result = await aiProviderManager.rewriteArticleWithFallback(
          testContent,
          testKeywords
        )
        
        const status = aiProviderManager.getProviderStatus()
        const availableProviders = status.filter(p => p.available).map(p => p.name)
        const failedProviders = status.filter(p => !p.available).map(p => p.name)
        
        let message = `測試完成!\n\n`
        message += `✅ 可用提供商 (${availableProviders.length}): ${availableProviders.join(', ')}\n`
        
        if (failedProviders.length > 0) {
          message += `❌ 失敗提供商 (${failedProviders.length}): ${failedProviders.join(', ')}\n`
        }
        
        if (result.success) {
          message += `\n🎉 智能切換測試成功！使用了: ${result.provider}`
        } else {
          message += `\n⚠️ 智能切換測試失敗: ${result.error}`
        }

        return NextResponse.json({
          success: true,
          message,
          data: {
            testResult: result,
            providerStatus: status
          }
        })

      case 'reset-failures':
        // 重置所有提供商的失敗計數
        aiProviderManager.resetFailureCount()
        
        return NextResponse.json({
          success: true,
          message: '所有AI提供商失敗計數已重置'
        })

      case 'get-status':
        // 獲取提供商狀態
        const providerStatus = aiProviderManager.getProviderStatus()
        
        return NextResponse.json({
          success: true,
          data: providerStatus
        })

      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('AI測試API錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '測試失敗'
    }, { status: 500 })
  }
}
