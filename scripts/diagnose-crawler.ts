// 爬蟲系統診斷腳本
import { prisma } from '../src/lib/prisma'
import { autoNewsCrawler } from '../src/lib/auto-news-crawler'

async function diagnoseCrawler() {
  console.log('====== 爬蟲系統診斷 ======\n')

  try {
    // 1. 檢查資料庫連接
    console.log('1. 檢查資料庫連接...')
    try {
      await prisma.$connect()
      console.log('✓ 資料庫連接成功')
    } catch (error) {
      console.error('✗ 資料庫連接失敗:', error)
      return
    }

    // 2. 檢查系統設定
    console.log('\n2. 檢查系統設定...')
    const settings = await prisma.setting.findMany()
    const settingsMap = new Map(settings.map(s => [s.key, s.value]))
    
    const requiredSettings = [
      'auto_publish_enabled',
      'ai_rewrite_enabled',
      'openai_api_key',
      'seo_keywords',
      'auto_crawl_interval'
    ]
    
    for (const key of requiredSettings) {
      const value = settingsMap.get(key)
      if (value) {
        console.log(`✓ ${key}: ${key.includes('key') ? '***' : value}`)
      } else {
        console.log(`✗ ${key}: 未設定`)
      }
    }

    // 3. 檢查新聞來源
    console.log('\n3. 檢查新聞來源...')
    const sources = await prisma.newsSource.findMany({
      where: { enabled: true }
    })
    
    console.log(`找到 ${sources.length} 個啟用的新聞來源:`)
    sources.forEach((source, index) => {
      console.log(`  ${index + 1}. ${source.name} - ${source.url}`)
    })
    
    if (sources.length === 0) {
      console.log('✗ 沒有啟用的新聞來源！')
      console.log('  建議：在管理介面中添加或啟用新聞來源')
    }

    // 4. 檢查爬蟲狀態
    console.log('\n4. 檢查爬蟲狀態...')
    const isRunning = autoNewsCrawler['isRunning']
    console.log(`爬蟲運行狀態: ${isRunning ? '運行中' : '已停止'}`)

    // 5. 檢查最近的爬取記錄
    console.log('\n5. 檢查最近的爬取記錄...')
    const recentLogs = await prisma.crawlLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    if (recentLogs.length > 0) {
      console.log(`最近 ${recentLogs.length} 筆爬取記錄:`)
      recentLogs.forEach((log, index) => {
        const time = new Date(log.createdAt).toLocaleString()
        const status = log.success ? '成功' : '失敗'
        console.log(`  ${index + 1}. ${time} - ${log.sourceName} - ${status}`)
        console.log(`     找到: ${log.articlesFound}, 處理: ${log.articlesProcessed}, 發布: ${log.articlesPublished}`)
        if (log.errors) {
          const errors = JSON.parse(log.errors)
          if (errors.length > 0) {
            console.log(`     錯誤: ${errors.join('; ')}`)
          }
        }
      })
    } else {
      console.log('✗ 沒有找到爬取記錄')
    }

    // 6. 測試單一爬取
    console.log('\n6. 測試爬取功能...')
    if (sources.length > 0) {
      console.log('正在測試爬取第一個新聞來源...')
      try {
        const results = await autoNewsCrawler.performCrawl({ parallel: false })
        const firstResult = results[0]
        if (firstResult) {
          console.log(`✓ 爬取測試完成`)
          console.log(`  成功: ${firstResult.success}`)
          console.log(`  找到文章: ${firstResult.articlesFound}`)
          console.log(`  處理文章: ${firstResult.articlesProcessed}`)
          if (firstResult.errors.length > 0) {
            console.log(`  錯誤: ${firstResult.errors.join('; ')}`)
          }
        }
      } catch (error) {
        console.error('✗ 爬取測試失敗:', error)
      }
    }

    console.log('\n====== 診斷完成 ======')
    
  } catch (error) {
    console.error('診斷過程中發生錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 執行診斷
diagnoseCrawler().catch(console.error) 