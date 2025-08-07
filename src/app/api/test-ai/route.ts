import { NextRequest, NextResponse } from 'next/server'
import { rewriteArticleWithAI, rewriteTitleWithSmartAI } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, content, title, keywords } = body

    switch (action) {
      case 'test-article':
        // 測試文章改寫
        if (!content || !keywords) {
          return NextResponse.json({
            success: false,
            error: '需要提供content和keywords參數'
          }, { status: 400 })
        }

        console.log('🧪 開始測試文章改寫...')
        const rewrittenContent = await rewriteArticleWithAI(content, keywords)
        
        return NextResponse.json({
          success: true,
          message: '文章改寫測試完成',
          data: {
            original: content,
            rewritten: rewrittenContent,
            keywords: keywords
          }
        })

      case 'test-title':
        // 測試標題改寫
        if (!title || !keywords) {
          return NextResponse.json({
            success: false,
            error: '需要提供title和keywords參數'
          }, { status: 400 })
        }

        console.log('🧪 開始測試標題改寫...')
        const rewrittenTitle = await rewriteTitleWithSmartAI(title, keywords)
        
        return NextResponse.json({
          success: true,
          message: '標題改寫測試完成',
          data: {
            original: title,
            rewritten: rewrittenTitle,
            keywords: keywords
          }
        })

      case 'test-both':
        // 測試文章和標題改寫
        if (!content || !title || !keywords) {
          return NextResponse.json({
            success: false,
            error: '需要提供content、title和keywords參數'
          }, { status: 400 })
        }

        console.log('🧪 開始測試完整AI改寫...')
        
        const [articleResult, titleResult] = await Promise.all([
          rewriteArticleWithAI(content, keywords),
          rewriteTitleWithSmartAI(title, keywords)
        ])
        
        return NextResponse.json({
          success: true,
          message: '完整改寫測試完成',
          data: {
            original: {
              title: title,
              content: content
            },
            rewritten: {
              title: titleResult,
              content: articleResult
            },
            keywords: keywords
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作。支持的操作：test-article, test-title, test-both'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('AI測試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI測試失敗'
    }, { status: 500 })
  }
}
