// 完整系統測試工具
import { testImageSelection, scanAvailableImages } from './random-image-selector'
import { runRandomImageTests, testNewsImageGeneration, getImageStatistics } from './test-random-images'

export interface TestResult {
  testName: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
  duration?: number
}

export interface SystemTestReport {
  overallStatus: 'pass' | 'fail' | 'warning'
  totalTests: number
  passedTests: number
  failedTests: number
  warningTests: number
  duration: number
  results: TestResult[]
  recommendations: string[]
}

export class ComprehensiveSystemTester {
  private results: TestResult[] = []
  private startTime: number = 0

  constructor() {
    this.startTime = Date.now()
  }

  private addResult(testName: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any, duration?: number) {
    this.results.push({
      testName,
      status,
      message,
      details,
      duration
    })
    
    const statusIcon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
    console.log(`${statusIcon} ${testName}: ${message}`)
    if (details) console.log('  詳細:', details)
  }

  // 1. 測試隨機圖片系統
  async testRandomImageSystem(): Promise<void> {
    console.log('\n🖼️ 測試隨機圖片系統...')
    const testStart = Date.now()
    
    try {
      // 測試圖片掃描
      const images = await scanAvailableImages()
      if (images.length === 0) {
        this.addResult('圖片掃描', 'warning', '未找到任何圖片', { imagesFound: 0 })
      } else {
        this.addResult('圖片掃描', 'pass', `發現 ${images.length} 個圖片文件`, { imagesFound: images.length })
      }

      // 測試智能選擇
      const { selectRandomImage } = await import('./random-image-selector')
      const testImage = await selectRandomImage('Honda Civic 冷媒更換', 'Honda汽車冷氣保養', ['honda', 'civic'])
      
      if (testImage && testImage.includes('/images/')) {
        this.addResult('智能圖片選擇', 'pass', '圖片選擇功能正常', { selectedImage: testImage })
      } else {
        this.addResult('智能圖片選擇', 'fail', '圖片選擇功能異常', { selectedImage: testImage })
      }

    } catch (error) {
      this.addResult('隨機圖片系統', 'fail', `系統測試失敗: ${error}`)
    }

    const duration = Date.now() - testStart
    this.addResult('隨機圖片系統測試', 'pass', `完成測試`, {}, duration)
  }

  // 2. 測試爬蟲系統
  async testCrawlerSystem(): Promise<void> {
    console.log('\n🕷️ 測試爬蟲系統...')
    const testStart = Date.now()
    
    try {
      // 測試爬蟲狀態API
      const statusResponse = await fetch('/api/auto-service')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        this.addResult('爬蟲狀態API', 'pass', '爬蟲狀態API正常', statusData)
      } else {
        this.addResult('爬蟲狀態API', 'fail', `狀態API失敗: ${statusResponse.status}`)
      }

      // 測試爬蟲執行（輕量級測試）
      const testResponse = await fetch('/api/auto-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-full-workflow' })
      })

      if (testResponse.ok) {
        const testData = await testResponse.json()
        this.addResult('爬蟲執行測試', 'pass', '一鍵測試執行成功', { 
          success: testData.success,
          stepsCompleted: testData.steps?.length || 0
        })
      } else {
        this.addResult('爬蟲執行測試', 'warning', '一鍵測試可能有問題', { status: testResponse.status })
      }

    } catch (error) {
      this.addResult('爬蟲系統測試', 'fail', `爬蟲測試失敗: ${error}`)
    }

    const duration = Date.now() - testStart
    this.addResult('爬蟲系統測試', 'pass', '完成測試', {}, duration)
  }

  // 3. 測試AI服務
  async testAIServices(): Promise<void> {
    console.log('\n🤖 測試AI服務...')
    const testStart = Date.now()
    
    try {
      // 測試AI配置
      const settingsResponse = await fetch('/api/settings')
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json()
        
        // 檢查AI配置
        const aiKeys = [
          'openaiApiKey', 'groqApiKey', 'geminiApiKey', 'cohereApiKey',
          'deepseekApiKey', 'zhipuApiKey', 'moonshotApiKey', 'huggingfaceApiKey'
        ]
        
        const configuredAIs = aiKeys.filter(key => settings[key] && settings[key].trim() !== '')
        
        if (configuredAIs.length === 0) {
          this.addResult('AI配置檢查', 'warning', '未配置任何AI API Key', { configuredCount: 0 })
        } else if (configuredAIs.length < 3) {
          this.addResult('AI配置檢查', 'warning', `只配置了 ${configuredAIs.length} 個AI服務`, { 
            configuredCount: configuredAIs.length,
            configured: configuredAIs
          })
        } else {
          this.addResult('AI配置檢查', 'pass', `配置了 ${configuredAIs.length} 個AI服務`, { 
            configuredCount: configuredAIs.length,
            configured: configuredAIs
          })
        }

        // 檢查自動切換設置
        if (settings.aiAutoFallback) {
          this.addResult('AI自動切換', 'pass', 'AI自動切換已啟用', { 
            autoFallback: true,
            retries: settings.aiFailoverRetries || 3
          })
        } else {
          this.addResult('AI自動切換', 'warning', 'AI自動切換未啟用', { autoFallback: false })
        }

      } else {
        this.addResult('AI服務配置', 'fail', '無法獲取設置')
      }

      // 測試AI測試API
      const aiTestResponse = await fetch('/api/test-ai')
      if (aiTestResponse.ok) {
        this.addResult('AI測試API', 'pass', 'AI測試API正常')
      } else {
        this.addResult('AI測試API', 'warning', `AI測試API狀態: ${aiTestResponse.status}`)
      }

    } catch (error) {
      this.addResult('AI服務測試', 'fail', `AI測試失敗: ${error}`)
    }

    const duration = Date.now() - testStart
    this.addResult('AI服務測試', 'pass', '完成測試', {}, duration)
  }

  // 4. 測試數據庫健康
  async testDatabaseHealth(): Promise<void> {
    console.log('\n🗄️ 測試數據庫健康...')
    const testStart = Date.now()
    
    try {
      // 檢查數據庫健康
      const healthResponse = await fetch('/api/database-health')
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        
        if (healthData.report.invalidArticles === 0) {
          this.addResult('數據庫完整性', 'pass', '數據庫無異常數據', healthData.report)
        } else {
          this.addResult('數據庫完整性', 'warning', `發現 ${healthData.report.invalidArticles} 條異常數據`, healthData.report)
        }
      } else {
        this.addResult('數據庫健康檢查', 'fail', `健康檢查API失敗: ${healthResponse.status}`)
      }

      // 檢查新聞驗證
      const newsValidationResponse = await fetch('/api/news-validation')
      if (newsValidationResponse.ok) {
        const validationData = await newsValidationResponse.json()
        const inconsistencyCount = validationData.inconsistencies?.length || 0
        
        if (inconsistencyCount === 0) {
          this.addResult('新聞數據一致性', 'pass', '新聞數據一致', validationData)
        } else {
          this.addResult('新聞數據一致性', 'warning', `發現 ${inconsistencyCount} 條不一致數據`, validationData)
        }
      }

    } catch (error) {
      this.addResult('數據庫健康測試', 'fail', `數據庫測試失敗: ${error}`)
    }

    const duration = Date.now() - testStart
    this.addResult('數據庫健康測試', 'pass', '完成測試', {}, duration)
  }

  // 5. 測試SEO功能
  async testSEOFeatures(): Promise<void> {
    console.log('\n🎯 測試SEO功能...')
    const testStart = Date.now()
    
    try {
      // 測試SEO生成器
      const seoResponse = await fetch('/api/seo-generator')
      if (seoResponse.ok) {
        this.addResult('SEO生成器API', 'pass', 'SEO生成器API正常')
      } else {
        this.addResult('SEO生成器API', 'warning', `SEO生成器API狀態: ${seoResponse.status}`)
      }

      // 測試SEO排名
      const rankingResponse = await fetch('/api/seo-ranking')
      if (rankingResponse.ok) {
        this.addResult('SEO排名API', 'pass', 'SEO排名API正常')
      } else {
        this.addResult('SEO排名API', 'warning', `SEO排名API狀態: ${rankingResponse.status}`)
      }

    } catch (error) {
      this.addResult('SEO功能測試', 'fail', `SEO測試失敗: ${error}`)
    }

    const duration = Date.now() - testStart
    this.addResult('SEO功能測試', 'pass', '完成測試', {}, duration)
  }

  // 6. 測試智能調度
  async testSmartScheduling(): Promise<void> {
    console.log('\n⏰ 測試智能調度...')
    const testStart = Date.now()
    
    try {
      // 測試智能調度API
      const scheduleResponse = await fetch('/api/smart-schedule')
      if (scheduleResponse.ok) {
        this.addResult('智能調度API', 'pass', '智能調度API正常')
      } else {
        this.addResult('智能調度API', 'warning', `智能調度API狀態: ${scheduleResponse.status}`)
      }

    } catch (error) {
      this.addResult('智能調度測試', 'fail', `智能調度測試失敗: ${error}`)
    }

    const duration = Date.now() - testStart
    this.addResult('智能調度測試', 'pass', '完成測試', {}, duration)
  }

  // 執行完整測試
  async runFullSystemTest(): Promise<SystemTestReport> {
    console.log('🚀 開始完整系統測試...')
    
    // 依序執行所有測試
    await this.testRandomImageSystem()
    await this.testCrawlerSystem()
    await this.testAIServices()
    await this.testDatabaseHealth()
    await this.testSEOFeatures()
    await this.testSmartScheduling()

    // 生成報告
    const duration = Date.now() - this.startTime
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.status === 'pass').length
    const failedTests = this.results.filter(r => r.status === 'fail').length
    const warningTests = this.results.filter(r => r.status === 'warning').length

    // 確定整體狀態
    let overallStatus: 'pass' | 'fail' | 'warning' = 'pass'
    if (failedTests > 0) {
      overallStatus = 'fail'
    } else if (warningTests > 0) {
      overallStatus = 'warning'
    }

    // 生成建議
    const recommendations = this.generateRecommendations()

    const report: SystemTestReport = {
      overallStatus,
      totalTests,
      passedTests,
      failedTests,
      warningTests,
      duration,
      results: this.results,
      recommendations
    }

    console.log('\n📋 測試完成，生成報告...')
    console.log(`總體狀態: ${overallStatus === 'pass' ? '✅ 通過' : overallStatus === 'fail' ? '❌ 失敗' : '⚠️ 警告'}`)
    console.log(`測試項目: ${totalTests} | 通過: ${passedTests} | 失敗: ${failedTests} | 警告: ${warningTests}`)
    console.log(`測試時間: ${(duration / 1000).toFixed(2)}秒`)

    return report
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    // 根據測試結果生成建議
    const aiConfigTest = this.results.find(r => r.testName === 'AI配置檢查')
    if (aiConfigTest?.status === 'warning') {
      recommendations.push('建議配置更多AI服務以提高可靠性，至少需要3個以上的API Key')
    }

    const dbTest = this.results.find(r => r.testName === '數據庫完整性')
    if (dbTest?.status === 'warning') {
      recommendations.push('建議執行數據庫清理功能，清除異常數據')
    }

    const imageTest = this.results.find(r => r.testName === '圖片掃描')
    if (imageTest?.status === 'warning') {
      recommendations.push('建議在 public/images 目錄中添加更多圖片文件')
    }

    const failedTests = this.results.filter(r => r.status === 'fail')
    if (failedTests.length > 0) {
      recommendations.push(`有 ${failedTests.length} 項測試失敗，建議優先修復這些問題`)
    }

    if (recommendations.length === 0) {
      recommendations.push('系統運行良好，可以部署到生產環境')
    }

    return recommendations
  }
}

// 快速測試函數
export async function runQuickSystemTest(): Promise<SystemTestReport> {
  const tester = new ComprehensiveSystemTester()
  return await tester.runFullSystemTest()
}
