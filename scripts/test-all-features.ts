// 測試所有功能的腳本
import { prisma } from '../src/lib/prisma'

// 顏色輸出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testDatabaseConnection() {
  log('\n📊 測試資料庫連接...', 'blue')
  try {
    await prisma.$connect()
    log('✓ 資料庫連接成功', 'green')
    
    const counts = {
      products: await prisma.product.count(),
      categories: await prisma.category.count(),
      news: await prisma.news.count(),
      banners: await prisma.banner.count(),
      brands: await prisma.vehicleBrand.count(),
      models: await prisma.vehicleModel.count(),
    }
    
    log(`  - 產品數量: ${counts.products}`)
    log(`  - 分類數量: ${counts.categories}`)
    log(`  - 新聞數量: ${counts.news}`)
    log(`  - 橫幅數量: ${counts.banners}`)
    log(`  - 車輛品牌: ${counts.brands}`)
    log(`  - 車型數量: ${counts.models}`)
    
    return true
  } catch (error) {
    log('✗ 資料庫連接失敗', 'red')
    console.error(error)
    return false
  }
}

async function testAPIRoutes() {
  log('\n🔌 測試 API 路由...', 'blue')
  
  const baseUrl = 'http://localhost:3000'
  const routes = [
    { path: '/api/products', method: 'GET', name: '產品 API' },
    { path: '/api/categories', method: 'GET', name: '分類 API' },
    { path: '/api/news', method: 'GET', name: '新聞 API' },
    { path: '/api/banners', method: 'GET', name: '橫幅 API' },
    { path: '/api/vehicle-brands', method: 'GET', name: '車輛品牌 API' },
    { path: '/api/news-sources', method: 'GET', name: '新聞來源 API' },
    { path: '/api/settings', method: 'GET', name: '設定 API' },
    { path: '/api/company-info', method: 'GET', name: '公司資訊 API' },
    { path: '/api/features', method: 'GET', name: '特色 API' },
    { path: '/api/milestones', method: 'GET', name: '里程碑 API' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route.path}`, {
        method: route.method,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        log(`  ✓ ${route.name} (${route.path})`, 'green')
        passed++
      } else {
        log(`  ✗ ${route.name} (${route.path}) - 狀態碼: ${response.status}`, 'red')
        failed++
      }
    } catch (error) {
      log(`  ✗ ${route.name} (${route.path}) - 錯誤: ${error}`, 'red')
      failed++
    }
  }
  
  log(`\n  總計: ${passed} 成功, ${failed} 失敗`)
  return failed === 0
}

async function testPublicPages() {
  log('\n🌐 測試前台頁面...', 'blue')
  
  const baseUrl = 'http://localhost:3000'
  const pages = [
    { path: '/zh', name: '首頁 (中文)' },
    { path: '/en', name: '首頁 (英文)' },
    { path: '/zh/products', name: '產品頁面' },
    { path: '/zh/news', name: '新聞頁面' },
    { path: '/zh/refrigerant-lookup', name: '冷媒查詢' },
    { path: '/zh/about', name: '關於我們' },
    { path: '/zh/contact', name: '聯絡我們' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const page of pages) {
    try {
      const response = await fetch(`${baseUrl}${page.path}`)
      
      if (response.ok) {
        log(`  ✓ ${page.name} (${page.path})`, 'green')
        passed++
      } else {
        log(`  ✗ ${page.name} (${page.path}) - 狀態碼: ${response.status}`, 'red')
        failed++
      }
    } catch (error) {
      log(`  ✗ ${page.name} (${page.path}) - 錯誤: ${error}`, 'red')
      failed++
    }
  }
  
  log(`\n  總計: ${passed} 成功, ${failed} 失敗`)
  return failed === 0
}

async function testAdminPages() {
  log('\n🔧 測試後台頁面...', 'blue')
  
  const baseUrl = 'http://localhost:3000'
  const pages = [
    { path: '/admin/login', name: '登入頁面' },
    { path: '/admin/dashboard', name: '儀表板' },
    { path: '/admin/products', name: '產品管理' },
    { path: '/admin/categories', name: '分類管理' },
    { path: '/admin/news', name: '新聞管理' },
    { path: '/admin/banners', name: '橫幅管理' },
    { path: '/admin/vehicles', name: '車輛管理' },
    { path: '/admin/crawler', name: '爬蟲管理中心' },
    { path: '/admin/news-sources', name: '新聞來源管理' },
    { path: '/admin/seo-analysis', name: 'SEO 分析' },
    { path: '/admin/settings', name: '系統設定' },
  ]
  
  let passed = 0
  let failed = 0
  
  for (const page of pages) {
    try {
      const response = await fetch(`${baseUrl}${page.path}`)
      
      // 後台頁面可能會重定向到登入頁
      if (response.ok || response.status === 307) {
        log(`  ✓ ${page.name} (${page.path})`, 'green')
        passed++
      } else {
        log(`  ✗ ${page.name} (${page.path}) - 狀態碼: ${response.status}`, 'red')
        failed++
      }
    } catch (error) {
      log(`  ✗ ${page.name} (${page.path}) - 錯誤: ${error}`, 'red')
      failed++
    }
  }
  
  log(`\n  總計: ${passed} 成功, ${failed} 失敗`)
  return failed === 0
}

async function testFeatures() {
  log('\n✨ 測試特色功能...', 'blue')
  
  const features = []
  
  // 測試圖片上傳 (需要實際檔案)
  features.push({
    name: '媒體上傳 (圖片/GIF/影片)',
    test: async () => {
      // 這需要實際的檔案上傳測試
      log('  ℹ 媒體上傳需要手動測試', 'yellow')
      return true
    }
  })
  
  // 測試中文轉換
  features.push({
    name: '簡繁體轉換',
    test: async () => {
      const { ensureTraditionalChinese } = await import('../src/lib/chinese-converter')
      const result = ensureTraditionalChinese('这是简体中文')
      return result.text === '這是簡體中文'
    }
  })
  
  // 測試 SEO 生成器狀態
  features.push({
    name: 'SEO 內容生成器',
    test: async () => {
      const response = await fetch('http://localhost:3000/api/seo-generator')
      return response.ok
    }
  })
  
  // 測試爬蟲狀態
  features.push({
    name: '新聞爬蟲',
    test: async () => {
      const response = await fetch('http://localhost:3000/api/auto-crawler')
      return response.ok
    }
  })
  
  for (const feature of features) {
    try {
      const result = await feature.test()
      if (result) {
        log(`  ✓ ${feature.name}`, 'green')
      } else {
        log(`  ✗ ${feature.name}`, 'red')
      }
    } catch (error) {
      log(`  ✗ ${feature.name} - 錯誤: ${error}`, 'red')
    }
  }
}

async function main() {
  log('====== 開始測試所有功能 ======\n', 'blue')
  
  // 確保開發伺服器正在運行
  log('請確保開發伺服器正在運行 (npm run dev)', 'yellow')
  log('等待 3 秒後開始測試...\n', 'yellow')
  
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // 執行測試
  const results = {
    database: await testDatabaseConnection(),
    api: await testAPIRoutes(),
    publicPages: await testPublicPages(),
    adminPages: await testAdminPages(),
  }
  
  await testFeatures()
  
  // 總結
  log('\n====== 測試總結 ======', 'blue')
  log(`資料庫連接: ${results.database ? '✓ 成功' : '✗ 失敗'}`, results.database ? 'green' : 'red')
  log(`API 路由: ${results.api ? '✓ 通過' : '✗ 有錯誤'}`, results.api ? 'green' : 'red')
  log(`前台頁面: ${results.publicPages ? '✓ 通過' : '✗ 有錯誤'}`, results.publicPages ? 'green' : 'red')
  log(`後台頁面: ${results.adminPages ? '✓ 通過' : '✗ 有錯誤'}`, results.adminPages ? 'green' : 'red')
  
  const allPassed = Object.values(results).every(r => r)
  log(`\n整體測試結果: ${allPassed ? '✓ 全部通過！' : '✗ 有測試失敗'}`, allPassed ? 'green' : 'red')
  
  // 提醒手動測試項目
  log('\n📝 需要手動測試的項目:', 'yellow')
  log('  1. 登入功能 (使用正確的帳號密碼)')
  log('  2. 檔案上傳 (圖片/GIF/影片)')
  log('  3. 橫幅刪除功能')
  log('  4. Excel 匯入功能')
  log('  5. Email 發送功能')
  log('  6. Telegram 機器人')
  log('  7. AI 內容生成 (需要 API Key)')
  log('  8. 爬蟲功能 (需要正確的新聞來源)')
  
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
}) 