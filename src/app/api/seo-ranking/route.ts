import { NextRequest, NextResponse } from 'next/server'
import { createSEORankingDetector } from '@/lib/seo-ranking-detector'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const keyword = searchParams.get('keyword')
    
    const detector = createSEORankingDetector()

    switch (action) {
      case 'stats':
        // 獲取排名統計
        const stats = await detector.getRankingStats()
        return NextResponse.json({
          success: true,
          data: stats
        })

      case 'history':
        // 獲取關鍵字排名歷史
        if (!keyword) {
          return NextResponse.json({
            success: false,
            error: '需要提供關鍵字參數'
          }, { status: 400 })
        }
        
        const days = parseInt(searchParams.get('days') || '30')
        const history = await detector.getRankingHistory(keyword, days)
        
        return NextResponse.json({
          success: true,
          data: history
        })

      case 'latest':
        // 獲取最新排名數據
        const latestRankings = await (prisma as any).seoRanking.findMany({
          where: {
            domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'drcarcold.com'
          },
          orderBy: {
            checkedAt: 'desc'
          },
          take: 50,
          distinct: ['keyword']
        })
        
        return NextResponse.json({
          success: true,
          data: latestRankings
        })

      case 'keywords':
        // 獲取所有已追蹤的關鍵字
        const keywords = await (prisma as any).seoRanking.groupBy({
          by: ['keyword'],
          where: {
            domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'drcarcold.com'
          },
          _count: {
            keyword: true
          },
          _max: {
            checkedAt: true
          }
        })
        
        return NextResponse.json({
          success: true,
          data: keywords
        })

      case 'suggestions':
        // 獲取關鍵字建議
        const suggestions = await detector.getSuggestedKeywords()
        
        return NextResponse.json({
          success: true,
          data: suggestions
        })

      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('SEO排名API錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '獲取排名數據失敗'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, keywords, keyword } = body
    
    const detector = createSEORankingDetector()

    switch (action) {
      case 'check-single':
        // 檢測單一關鍵字排名
        if (!keyword) {
          return NextResponse.json({
            success: false,
            error: '需要提供關鍵字'
          }, { status: 400 })
        }
        
        console.log(`開始檢測關鍵字: ${keyword}`)
        const result = await detector.checkKeywordRanking(keyword)
        
        return NextResponse.json({
          success: true,
          message: `關鍵字 "${keyword}" 檢測完成`,
          data: result
        })

      case 'check-multiple':
        // 批量檢測關鍵字排名
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          return NextResponse.json({
            success: false,
            error: '需要提供關鍵字陣列'
          }, { status: 400 })
        }
        
        if (keywords.length > 20) {
          return NextResponse.json({
            success: false,
            error: '單次最多檢測20個關鍵字'
          }, { status: 400 })
        }
        
        console.log(`開始批量檢測 ${keywords.length} 個關鍵字`)
        const results = await detector.checkMultipleKeywords(keywords)
        
        const successCount = results.filter(r => r.found).length
        
        return NextResponse.json({
          success: true,
          message: `批量檢測完成，成功檢測 ${successCount}/${results.length} 個關鍵字`,
          data: {
            results,
            summary: {
              total: results.length,
              found: successCount,
              notFound: results.length - successCount
            }
          }
        })

      case 'check-seo-keywords':
        // 檢測設定中的SEO關鍵字
        const seoKeywordsSetting = await prisma.setting.findUnique({
          where: { key: 'seoKeywords' }
        })
        
        if (!seoKeywordsSetting?.value) {
          return NextResponse.json({
            success: false,
            error: '未設定SEO關鍵字，請先到設定頁面配置'
          }, { status: 400 })
        }
        
        const seoKeywords = seoKeywordsSetting.value
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0)
        
        if (seoKeywords.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'SEO關鍵字列表為空'
          }, { status: 400 })
        }
        
        console.log(`開始檢測SEO關鍵字: ${seoKeywords.join(', ')}`)
        const seoResults = await detector.checkMultipleKeywords(seoKeywords)
        
        const seoSuccessCount = seoResults.filter(r => r.found).length
        
        return NextResponse.json({
          success: true,
          message: `SEO關鍵字檢測完成，成功檢測 ${seoSuccessCount}/${seoResults.length} 個關鍵字`,
          data: {
            results: seoResults,
            summary: {
              total: seoResults.length,
              found: seoSuccessCount,
              notFound: seoResults.length - seoSuccessCount,
              averagePosition: seoResults
                .filter(r => r.position)
                .reduce((sum, r) => sum + r.position!, 0) / seoSuccessCount || 0
            }
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('SEO排名檢測失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '排名檢測失敗'
    }, { status: 500 })
  }
}
