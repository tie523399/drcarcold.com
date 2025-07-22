// 初始化爬蟲系統設定
import { prisma } from '../src/lib/prisma'

async function initSettings() {
  console.log('初始化爬蟲系統設定...\n')

  const defaultSettings = [
    { key: 'auto_publish_enabled', value: 'false' }, // 預設不自動發布
    { key: 'ai_rewrite_enabled', value: 'false' },   // 預設不使用 AI 改寫
    { key: 'openai_api_key', value: '' },            // 需要用戶自行設定
    { key: 'seo_keywords', value: '汽車冷氣,冷媒,R134a,R1234yf,冷氣維修,冷氣保養' },
    { key: 'auto_crawl_interval', value: '60' },     // 預設 60 分鐘
    { key: 'parallel_crawling', value: 'true' },     // 預設啟用並行爬取
    { key: 'concurrent_limit', value: '3' },         // 並發限制 3 個
  ]

  try {
    for (const setting of defaultSettings) {
      const existing = await prisma.setting.findUnique({
        where: { key: setting.key }
      })

      if (!existing) {
        await prisma.setting.create({
          data: setting
        })
        console.log(`✓ 創建設定: ${setting.key} = ${setting.value}`)
      } else {
        console.log(`- 設定已存在: ${setting.key} = ${existing.value}`)
      }
    }

    console.log('\n設定初始化完成！')
  } catch (error) {
    console.error('初始化設定失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 執行初始化
initSettings().catch(console.error) 