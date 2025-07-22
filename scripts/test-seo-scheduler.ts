// 測試 SEO 自動生成排程功能
import { prisma } from '../src/lib/prisma'
import { getScheduledPublisher } from '../src/lib/scheduled-publisher'

async function testSEOScheduler() {
  console.log('🧪 測試 SEO 自動生成排程功能...\n')

  try {
    // 1. 檢查必要設定
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'auto_seo_enabled',
            'seo_generation_schedule', 
            'seo_daily_count',
            'ai_rewrite_enabled',
            'cohere_api_key'
          ]
        }
      }
    })

    const settingsMap = new Map(settings.map(s => [s.key, s.value]))

    console.log('📋 當前設定：')
    console.log(`  ✓ SEO 自動生成：${settingsMap.get('auto_seo_enabled') || 'false'}`)
    console.log(`  ✓ 生成時間：${settingsMap.get('seo_generation_schedule') || '10:00'}`)
    console.log(`  ✓ 每日數量：${settingsMap.get('seo_daily_count') || '1'} 篇`)
    console.log(`  ✓ AI 改寫：${settingsMap.get('ai_rewrite_enabled') || 'false'}`)
    console.log(`  ✓ Cohere API：${settingsMap.get('cohere_api_key') ? '已設定' : '未設定'}`)

    // 2. 啟用 SEO 自動生成進行測試
    console.log('\n🔧 啟用 SEO 自動生成功能...')
    await prisma.setting.upsert({
      where: { key: 'auto_seo_enabled' },
      update: { value: 'true' },
      create: { key: 'auto_seo_enabled', value: 'true' }
    })

    // 設定為未來1分鐘後執行（用於測試）
    const testTime = new Date()
    testTime.setMinutes(testTime.getMinutes() + 1)
    const timeString = `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`
    
    await prisma.setting.upsert({
      where: { key: 'seo_generation_schedule' },
      update: { value: timeString },
      create: { key: 'seo_generation_schedule', value: timeString }
    })

    console.log(`   設定測試時間為：${timeString}`)

    // 3. 啟動定時發布器
    console.log('\n🚀 啟動定時發布器...')
    const publisher = getScheduledPublisher()
    await publisher.startScheduledPublishing()
    
    console.log('   定時發布器已啟動，包含 SEO 生成排程')

    // 4. 等待並觀察
    console.log(`\n⏰ 等待 SEO 文章在 ${timeString} 自動生成...`)
    console.log('   （按 Ctrl+C 停止測試）')
    
    // 保持腳本運行
    let count = 0
    const checkInterval = setInterval(async () => {
      count++
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      console.log(`   [${count}] 當前時間：${currentTime}，等待中...`)
      
      // 檢查是否有新的 SEO 文章生成
      const todayStats = await prisma.setting.findUnique({
        where: { key: `seo_generation_stats_${new Date().toISOString().split('T')[0]}` }
      })
      
      if (todayStats && parseInt(todayStats.value) > 0) {
        console.log(`\n🎉 成功！今日已生成 ${todayStats.value} 篇 SEO 文章`)
        clearInterval(checkInterval)
        
        // 恢復原設定
        await prisma.setting.upsert({
          where: { key: 'auto_seo_enabled' },
          update: { value: 'false' },
          create: { key: 'auto_seo_enabled', value: 'false' }
        })
        
        await prisma.setting.upsert({
          where: { key: 'seo_generation_schedule' },
          update: { value: '10:00' },
          create: { key: 'seo_generation_schedule', value: '10:00' }
        })
        
        console.log('   已恢復原始設定')
        publisher.stopScheduledPublishing()
        process.exit(0)
      }
      
      // 如果等待超過 5 分鐘，停止測試
      if (count > 30) {
        console.log('\n⚠️  測試超時，停止等待')
        clearInterval(checkInterval)
        
        // 恢復原設定
        await prisma.setting.upsert({
          where: { key: 'auto_seo_enabled' },
          update: { value: 'false' },
          create: { key: 'auto_seo_enabled', value: 'false' }
        })
        
        publisher.stopScheduledPublishing()
        process.exit(1)
      }
    }, 10000) // 每10秒檢查一次

  } catch (error) {
    console.error('❌ 測試失敗:', error)
    process.exit(1)
  }
}

// 處理 Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n\n🛑 收到停止信號，清理並退出...')
  
  // 恢復原設定
  await prisma.setting.upsert({
    where: { key: 'auto_seo_enabled' },
    update: { value: 'false' },
    create: { key: 'auto_seo_enabled', value: 'false' }
  })
  
  await prisma.setting.upsert({
    where: { key: 'seo_generation_schedule' },
    update: { value: '10:00' },
    create: { key: 'seo_generation_schedule', value: '10:00' }
  })
  
  console.log('   已恢復原始設定')
  await prisma.$disconnect()
  process.exit(0)
})

// 執行測試
testSEOScheduler()
  .catch((error) => {
    console.error('執行測試失敗:', error)
    process.exit(1)
  }) 