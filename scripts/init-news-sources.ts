import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultNewsSources = [
  {
    name: '聯合新聞網 - 汽車',
    url: 'https://autos.udn.com/autos/index',
    rssUrl: 'https://udn.com/rssfeed/news/2/7/1010',
    enabled: true,
    maxArticlesPerCrawl: 5,
    crawlInterval: 120,
    selectors: JSON.stringify({
      listSelector: '.story-list__item',
      linkSelector: 'a',
      titleSelector: 'h3',
      contentSelector: '.article-content__paragraph',
      dateSelector: '.story-list__time',
      imageSelector: 'img'
    })
  },
  {
    name: '中時新聞網 - 汽車',
    url: 'https://www.chinatimes.com/auto',
    enabled: true,
    maxArticlesPerCrawl: 5,
    crawlInterval: 120,
    selectors: JSON.stringify({
      listSelector: '.col',
      linkSelector: 'a',
      titleSelector: 'h3, h4',
      contentSelector: '.article-body',
      dateSelector: '.meta-info-wrapper time',
      imageSelector: 'img'
    })
  },
  {
    name: '自由時報 - 汽車',
    url: 'https://auto.ltn.com.tw/',
    enabled: true,
    maxArticlesPerCrawl: 5,
    crawlInterval: 120,
    selectors: JSON.stringify({
      listSelector: '.whitecon',
      linkSelector: 'a',
      titleSelector: 'h3',
      contentSelector: '.text',
      dateSelector: '.time',
      imageSelector: 'img'
    })
  },
  {
    name: 'CarStuff 人車事',
    url: 'https://www.carstuff.com.tw/',
    enabled: true,
    maxArticlesPerCrawl: 8,
    crawlInterval: 90,
    selectors: JSON.stringify({
      listSelector: '.post',
      linkSelector: '.post-title a',
      titleSelector: 'h1, .post-title',
      contentSelector: '.post-content',
      dateSelector: '.post-date',
      imageSelector: '.featured-image img'
    })
  },
  {
    name: 'AutoNet 汽車日報',
    url: 'https://www.autonet.com.tw/',
    enabled: true,
    maxArticlesPerCrawl: 6,
    crawlInterval: 100,
    selectors: JSON.stringify({
      listSelector: '.news-item',
      linkSelector: 'a',
      titleSelector: '.news-title',
      contentSelector: '.news-content',
      dateSelector: '.news-date',
      imageSelector: '.news-image img'
    })
  }
]

async function initNewsSources() {
  console.log('🚀 開始初始化新聞來源...')

  try {
    // 檢查是否已有新聞來源
    const existingCount = await prisma.newsSource.count()
    
    if (existingCount > 0) {
      console.log(`✓ 已存在 ${existingCount} 個新聞來源，跳過初始化`)
      return
    }

    // 創建預設新聞來源
    for (const source of defaultNewsSources) {
      try {
        await prisma.newsSource.create({
          data: source
        })
        console.log(`✓ 創建新聞來源: ${source.name}`)
      } catch (error) {
        console.error(`✗ 創建新聞來源失敗: ${source.name}`, error)
      }
    }

    console.log('🎉 新聞來源初始化完成！')

    // 顯示統計
    const totalSources = await prisma.newsSource.count()
    const enabledSources = await prisma.newsSource.count({
      where: { enabled: true }
    })

    console.log(`📊 統計資訊:`)
    console.log(`   總計: ${totalSources} 個新聞來源`)
    console.log(`   啟用: ${enabledSources} 個`)
    console.log(`   停用: ${totalSources - enabledSources} 個`)

  } catch (error) {
    console.error('❌ 初始化新聞來源時發生錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  initNewsSources()
    .then(() => {
      console.log('✅ 腳本執行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 腳本執行失敗:', error)
      process.exit(1)
    })
}

export { initNewsSources } 