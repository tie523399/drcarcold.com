// 修復新聞來源設定
import { prisma } from '../src/lib/prisma'

async function fixNewsSources() {
  console.log('修復新聞來源設定...\n')

  try {
    // 更新有問題的新聞來源
    const updates = [
      {
        name: 'U-CAR 汽車新聞',
        url: 'https://news.u-car.com.tw/news/headline',
        selectors: JSON.stringify({
          articleLinks: '.o-fNcardTitle__link',
          title: 'h1.o-fArticle__header__title',
          content: '.o-fArticle__body',
          author: '.o-fArticle__header__author',
          date: '.o-fArticle__header__date'
        })
      },
      {
        name: 'CarStuff 人車事',
        url: 'https://www.carstuff.com.tw/car-news.html',
        selectors: JSON.stringify({
          articleLinks: '.item-title a',
          title: 'h1.item-title',
          content: '.item-content',
          author: '.item-author',
          date: '.item-date'
        })
      },
      {
        name: '癮車報',
        url: 'https://www.cool3c.com/category/car',
        enabled: false, // 暫時停用，因為網站結構改變
        selectors: JSON.stringify({
          articleLinks: '.article-item a',
          title: 'h1.article-title',
          content: '.article-body',
          author: '.article-author',
          date: '.article-date'
        })
      }
    ]

    for (const update of updates) {
      const source = await prisma.newsSource.findFirst({
        where: { name: update.name }
      })

      if (source) {
        await prisma.newsSource.update({
          where: { id: source.id },
          data: {
            url: update.url,
            selectors: update.selectors,
            enabled: update.enabled !== undefined ? update.enabled : source.enabled
          }
        })
        console.log(`✓ 更新: ${update.name}`)
      } else {
        console.log(`✗ 找不到: ${update.name}`)
      }
    }

    // 新增更可靠的新聞來源
    const newSources = [
      {
        name: '車勢網',
        url: 'https://www.carnews.com/category/news',
        enabled: true,
        maxArticlesPerCrawl: 3,
        crawlInterval: 120,
        selectors: JSON.stringify({
          articleLinks: '.post-title a, .entry-title a',
          title: 'h1.entry-title, h1.post-title',
          content: '.entry-content, .post-content',
          author: '.author-name, .post-author',
          date: '.entry-date, .post-date'
        })
      },
      {
        name: '發燒車訊',
        url: 'https://autos.udn.com/autos/channel/breakingnews',
        enabled: true,
        maxArticlesPerCrawl: 3,
        crawlInterval: 120,
        selectors: JSON.stringify({
          articleLinks: '.story-list__image a',
          title: 'h1.article-content__title',
          content: '.article-content__editor',
          author: '.article-content__author',
          date: '.article-content__time'
        })
      }
    ]

    for (const newSource of newSources) {
      const existing = await prisma.newsSource.findFirst({
        where: { name: newSource.name }
      })

      if (!existing) {
        await prisma.newsSource.create({
          data: newSource
        })
        console.log(`✓ 新增: ${newSource.name}`)
      } else {
        console.log(`- 已存在: ${newSource.name}`)
      }
    }

    console.log('\n新聞來源修復完成！')

    // 顯示當前啟用的來源
    const enabledSources = await prisma.newsSource.findMany({
      where: { enabled: true }
    })

    console.log(`\n當前啟用的新聞來源 (${enabledSources.length} 個):`)
    enabledSources.forEach((source, index) => {
      console.log(`  ${index + 1}. ${source.name} - ${source.url}`)
    })

  } catch (error) {
    console.error('修復新聞來源失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 執行修復
fixNewsSources().catch(console.error) 