import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAIProvider } from '@/lib/ai-service'

// POST /api/seo-generator/test - 測試 Cohere API 響應時間
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // 獲取 Cohere API Key
    const apiKeySetting = await prisma.setting.findUnique({
      where: { key: 'cohere_api_key' }
    })

    if (!apiKeySetting?.value) {
      return NextResponse.json(
        { error: '未設定 Cohere API Key' },
        { status: 400 }
      )
    }

    console.log('開始測試 Cohere API 響應時間...')
    
    const provider = getAIProvider('cohere')
    const testContent = '這是一個測試文章，用來檢測 API 響應速度。汽車冷氣系統是車輛的重要組成部分。'
    const testKeywords = '汽車冷氣,測試'

    const contentStartTime = Date.now()
    
    try {
      const result = await provider.rewriteTitle(testContent, testKeywords, apiKeySetting.value)
      const contentEndTime = Date.now()
      
      const totalTime = Date.now() - startTime
      const apiTime = contentEndTime - contentStartTime
      
      console.log(`API 測試完成 - 總時間: ${totalTime}ms, API 時間: ${apiTime}ms`)
      
      return NextResponse.json({
        success: true,
        result: result.substring(0, 100) + '...',
        performance: {
          totalTime: totalTime,
          apiResponseTime: apiTime,
          status: apiTime < 10000 ? 'good' : apiTime < 20000 ? 'slow' : 'very_slow'
        },
        message: `API 測試成功，響應時間: ${apiTime}ms`
      })
      
    } catch (apiError) {
      const errorTime = Date.now() - contentStartTime
      console.error('API 測試失敗:', apiError)
      
      return NextResponse.json({
        success: false,
        error: 'API 調用失敗',
        details: apiError instanceof Error ? apiError.message : '未知錯誤',
        performance: {
          totalTime: Date.now() - startTime,
          apiResponseTime: errorTime,
          status: 'error'
        }
      })
    }

  } catch (error) {
    console.error('SEO 生成器測試失敗:', error)
    return NextResponse.json(
      { 
        error: '測試失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}