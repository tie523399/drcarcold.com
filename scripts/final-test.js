#!/usr/bin/env node

const { execSync } = require('child_process')
const fetch = require('node-fetch').default || require('node-fetch')

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

console.log('🧪 DrCarCold 最終測試腳本')
console.log(`測試目標: ${BASE_URL}`)
console.log('============================')

let totalTests = 0
let passedTests = 0
const failedTests = []

async function runTest(testName, testFn) {
  totalTests++
  console.log(`\n📋 測試 ${totalTests}: ${testName}`)
  
  try {
    const result = await testFn()
    if (result === true || result === undefined) {
      console.log(`   ✅ 通過`)
      passedTests++
    } else {
      console.log(`   ❌ 失敗: ${result}`)
      failedTests.push({ name: testName, reason: result })
    }
  } catch (error) {
    console.log(`   ❌ 錯誤: ${error.message}`)
    failedTests.push({ name: testName, reason: error.message })
  }
}

async function testAPI(endpoint, expectedStatus = 200) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`)
    if (response.status === expectedStatus) {
      return true
    } else {
      return `狀態碼錯誤: 期望 ${expectedStatus}, 實際 ${response.status}`
    }
  } catch (error) {
    return `網絡錯誤: ${error.message}`
  }
}

async function main() {
  // 基礎連接測試
  await runTest('首頁載入', () => testAPI('/'))
  await runTest('健康檢查 API', () => testAPI('/api/health'))
  
  // 管理功能測試
  await runTest('管理後台可訪問', () => testAPI('/admin'))
  await runTest('設定 API', () => testAPI('/api/settings'))
  await runTest('新聞 API', () => testAPI('/api/news'))
  
  // 核心功能 API 測試
  await runTest('自動服務 API', () => testAPI('/api/auto-service'))
  await runTest('AI測試 API', () => testAPI('/api/test-ai'))
  await runTest('數據庫健康 API', () => testAPI('/api/database-health'))
  await runTest('隨機圖片 API', () => testAPI('/api/images/random-test'))
  
  // SEO 功能測試
  await runTest('SEO生成器 API', () => testAPI('/api/seo-generator'))
  await runTest('SEO排名 API', () => testAPI('/api/seo-ranking'))
  
  // 智能功能測試
  await runTest('智能調度 API', () => testAPI('/api/smart-schedule'))
  
  // 新功能測試
  await runTest('批量圖片更新頁面', () => testAPI('/admin/bulk-update-images'))
  await runTest('深度測試頁面', () => testAPI('/admin/deep-test'))
  await runTest('除錯中心頁面', () => testAPI('/admin/debug-center'))
  
  // 除錯 API 測試
  await runTest('性能監控 API', () => testAPI('/api/debug/performance'))
  await runTest('系統日誌 API', () => testAPI('/api/debug/logs'))
  
  // 產品功能測試
  await runTest('產品列表', () => testAPI('/api/products'))
  await runTest('車輛品牌', () => testAPI('/api/vehicle-brands'))
  await runTest('冷媒查詢', () => testAPI('/api/refrigerant-lookup'))
  
  // 多語言測試
  await runTest('中文頁面', () => testAPI('/zh'))
  await runTest('英文頁面', () => testAPI('/en'))
  
  // 靜態資源測試
  await runTest('機器人文件', () => testAPI('/robots.txt'))
  await runTest('網站地圖', () => testAPI('/sitemap.xml'))

  // 複雜功能測試
  await runTest('執行簡單AI測試', async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/test-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-simple', text: '測試文字' })
      })
      return response.ok ? true : `AI測試失敗: ${response.status}`
    } catch (error) {
      return `AI測試錯誤: ${error.message}`
    }
  })

  await runTest('檢查數據庫完整性', async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/database-health`)
      const data = await response.json()
      return data.success ? true : `數據庫檢查失敗: ${data.error}`
    } catch (error) {
      return `數據庫檢查錯誤: ${error.message}`
    }
  })

  // 結果摘要
  console.log('\n' + '='.repeat(50))
  console.log('📊 測試結果摘要')
  console.log('='.repeat(50))

  const successRate = (passedTests / totalTests * 100).toFixed(1)
  
  console.log(`\n總測試數: ${totalTests}`)
  console.log(`✅ 通過: ${passedTests}`)
  console.log(`❌ 失敗: ${failedTests.length}`)
  console.log(`成功率: ${successRate}%`)

  if (failedTests.length > 0) {
    console.log('\n🔴 失敗的測試:')
    failedTests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.name}: ${test.reason}`)
    })
  }

  if (successRate >= 90) {
    console.log('\n🎉 系統測試通過！應用準備就緒')
    process.exit(0)
  } else if (successRate >= 75) {
    console.log('\n⚠️ 系統基本正常，但有一些問題需要注意')
    process.exit(0)
  } else {
    console.log('\n❌ 系統測試失敗，需要修復問題')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('測試腳本執行失敗:', error)
  process.exit(1)
})
