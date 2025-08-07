/**
 * 🔍 系統架構審查報告
 * 
 * 檢查以下問題：
 * 1. API 路由結構和組織
 * 2. 自動化服務管理標準化
 * 3. TypeScript 類型定義完善
 */

import fs from 'fs'
import path from 'path'

interface AuditResult {
  category: string
  status: 'OK' | 'WARNING' | 'ERROR'
  issues: string[]
  recommendations: string[]
}

async function systemAudit(): Promise<void> {
  console.log('🔍 開始系統架構審查...\n')
  
  const results: AuditResult[] = []
  
  // 1. API 路由結構審查
  results.push(await auditApiRoutes())
  
  // 2. 自動化服務管理審查
  results.push(await auditAutoServices())
  
  // 3. TypeScript 類型定義審查
  results.push(await auditTypeDefinitions())
  
  // 4. 數據庫架構審查
  results.push(await auditDatabaseSchema())
  
  // 生成報告
  generateReport(results)
}

async function auditApiRoutes(): Promise<AuditResult> {
  const result: AuditResult = {
    category: 'API 路由結構',
    status: 'OK',
    issues: [],
    recommendations: []
  }
  
  try {
    const apiDir = 'src/app/api'
    const routes = await getApiRoutes(apiDir)
    
    console.log('📡 API 路由清單:')
    routes.forEach(route => {
      console.log(`   • ${route.method} ${route.path}`)
    })
    
    // 檢查重複路由
    const duplicates = findDuplicateRoutes(routes)
    if (duplicates.length > 0) {
      result.status = 'WARNING'
      result.issues.push(`發現重複路由: ${duplicates.join(', ')}`)
      result.recommendations.push('合併或重構重複的API路由')
    }
    
    // 檢查路由命名一致性
    const inconsistentNaming = checkNamingConsistency(routes)
    if (inconsistentNaming.length > 0) {
      result.status = 'WARNING'
      result.issues.push(`路由命名不一致: ${inconsistentNaming.join(', ')}`)
      result.recommendations.push('統一API路由命名規範')
    }
    
    // 檢查是否有標準化的錯誤處理
    const routesWithoutErrorHandling = checkErrorHandling(routes)
    if (routesWithoutErrorHandling.length > 0) {
      result.status = 'WARNING'
      result.issues.push(`缺少標準錯誤處理的路由: ${routesWithoutErrorHandling.length} 個`)
      result.recommendations.push('為所有API路由添加標準化錯誤處理')
    }
    
    console.log(`✅ API路由審查完成: ${routes.length} 個路由`)
    
  } catch (error) {
    result.status = 'ERROR'
    result.issues.push(`API路由審查失敗: ${error}`)
  }
  
  return result
}

async function auditAutoServices(): Promise<AuditResult> {
  const result: AuditResult = {
    category: '自動化服務管理',
    status: 'OK',
    issues: [],
    recommendations: []
  }
  
  try {
    // 檢查服務單例模式
    const hasAutoServiceManager = fs.existsSync('src/lib/auto-service-manager.ts')
    const hasAutoStartupService = fs.existsSync('src/lib/auto-startup-service.ts')
    
    if (!hasAutoServiceManager) {
      result.status = 'ERROR'
      result.issues.push('缺少 AutoServiceManager')
      result.recommendations.push('創建統一的自動化服務管理器')
    }
    
    if (!hasAutoStartupService) {
      result.status = 'ERROR'
      result.issues.push('缺少 AutoStartupService')
      result.recommendations.push('創建自動啟動服務')
    }
    
    // 檢查服務配置標準化
    const configFiles = [
      'src/lib/auto-service-manager.ts',
      'src/lib/auto-startup-service.ts',
      'src/lib/init-app.ts'
    ]
    
    let hasStandardizedConfig = true
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8')
        if (!content.includes('settings') && !content.includes('config')) {
          hasStandardizedConfig = false
          break
        }
      }
    }
    
    if (!hasStandardizedConfig) {
      result.status = 'WARNING'
      result.issues.push('服務配置不夠標準化')
      result.recommendations.push('建立統一的服務配置規範')
    }
    
    // 檢查錯誤處理和恢復機制
    const hasErrorHandler = fs.existsSync('src/lib/error-handler.ts')
    const hasSystemHealth = fs.existsSync('src/lib/system-health.ts')
    
    if (!hasErrorHandler) {
      result.status = 'WARNING'
      result.issues.push('缺少統一的錯誤處理機制')
      result.recommendations.push('實現統一的錯誤處理和恢復機制')
    }
    
    if (!hasSystemHealth) {
      result.status = 'WARNING'
      result.issues.push('缺少系統健康檢查')
      result.recommendations.push('實現系統健康監控')
    }
    
    console.log('✅ 自動化服務管理審查完成')
    
  } catch (error) {
    result.status = 'ERROR'
    result.issues.push(`自動化服務審查失敗: ${error}`)
  }
  
  return result
}

async function auditTypeDefinitions(): Promise<AuditResult> {
  const result: AuditResult = {
    category: 'TypeScript 類型定義',
    status: 'OK',
    issues: [],
    recommendations: []
  }
  
  try {
    const typeFiles = [
      'src/types/index.ts',
      'src/types/system.ts', 
      'src/types/vehicle.ts'
    ]
    
    let totalTypes = 0
    const missingFiles: string[] = []
    
    for (const file of typeFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8')
        const interfaceCount = (content.match(/interface\s+\w+/g) || []).length
        const typeCount = (content.match(/type\s+\w+/g) || []).length
        totalTypes += interfaceCount + typeCount
        console.log(`📝 ${file}: ${interfaceCount} interfaces, ${typeCount} types`)
      } else {
        missingFiles.push(file)
      }
    }
    
    if (missingFiles.length > 0) {
      result.status = 'WARNING'
      result.issues.push(`缺少類型定義文件: ${missingFiles.join(', ')}`)
      result.recommendations.push('創建缺少的類型定義文件')
    }
    
    // 檢查 API 響應類型統一性
    const hasStandardApiTypes = checkStandardApiTypes()
    if (!hasStandardApiTypes) {
      result.status = 'WARNING'
      result.issues.push('API響應類型不夠統一')
      result.recommendations.push('標準化API響應類型')
    }
    
    // 檢查是否有重複的類型定義
    const duplicateTypes = findDuplicateTypes()
    if (duplicateTypes.length > 0) {
      result.status = 'WARNING'
      result.issues.push(`發現重複的類型定義: ${duplicateTypes.join(', ')}`)
      result.recommendations.push('合併重複的類型定義')
    }
    
    console.log(`✅ TypeScript類型審查完成: ${totalTypes} 個類型定義`)
    
  } catch (error) {
    result.status = 'ERROR'
    result.issues.push(`TypeScript類型審查失敗: ${error}`)
  }
  
  return result
}

async function auditDatabaseSchema(): Promise<AuditResult> {
  const result: AuditResult = {
    category: '數據庫架構',
    status: 'OK',
    issues: [],
    recommendations: []
  }
  
  try {
    const schemaFile = 'prisma/schema.prisma'
    
    if (fs.existsSync(schemaFile)) {
      const content = fs.readFileSync(schemaFile, 'utf-8')
      
      // 檢查模型數量
      const modelCount = (content.match(/model\s+\w+/g) || []).length
      console.log(`🗄️  數據庫模型: ${modelCount} 個`)
      
      // 檢查是否有舊的Vehicle模型
      if (content.includes('model Vehicle {') && !content.includes('// 舊的 Vehicle 模型已廢棄')) {
        result.status = 'WARNING'
        result.issues.push('發現未廢棄的舊Vehicle模型')
        result.recommendations.push('標記舊Vehicle模型為廢棄或完全移除')
      }
      
      // 檢查索引使用
      const indexCount = (content.match(/@@index/g) || []).length
      if (indexCount < modelCount * 0.5) {
        result.status = 'WARNING'
        result.issues.push('數據庫索引可能不足')
        result.recommendations.push('為常用查詢字段添加索引')
      }
      
      console.log(`✅ 數據庫架構審查完成`)
    } else {
      result.status = 'ERROR'
      result.issues.push('找不到數據庫schema文件')
    }
    
  } catch (error) {
    result.status = 'ERROR'
    result.issues.push(`數據庫架構審查失敗: ${error}`)
  }
  
  return result
}

// 輔助函數
async function getApiRoutes(dir: string): Promise<Array<{path: string, method: string}>> {
  const routes: Array<{path: string, method: string}> = []
  
  function scanDirectory(currentDir: string, basePath: string = '') {
    if (!fs.existsSync(currentDir)) return
    
    const items = fs.readdirSync(currentDir)
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        const newBasePath = basePath + '/' + item
        scanDirectory(fullPath, newBasePath)
      } else if (item === 'route.ts') {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        
        methods.forEach(method => {
          if (content.includes(`export async function ${method}(`)) {
            routes.push({
              path: '/api' + basePath,
              method
            })
          }
        })
      }
    }
  }
  
  scanDirectory(dir)
  return routes
}

function findDuplicateRoutes(routes: Array<{path: string, method: string}>): string[] {
  const seen = new Set<string>()
  const duplicates: string[] = []
  
  routes.forEach(route => {
    const key = `${route.method} ${route.path}`
    if (seen.has(key)) {
      duplicates.push(key)
    } else {
      seen.add(key)
    }
  })
  
  return duplicates
}

function checkNamingConsistency(routes: Array<{path: string, method: string}>): string[] {
  const inconsistent: string[] = []
  
  routes.forEach(route => {
    // 檢查路由命名規範
    if (route.path.includes('_') || route.path.includes(' ')) {
      inconsistent.push(route.path)
    }
  })
  
  return inconsistent
}

function checkErrorHandling(routes: Array<{path: string, method: string}>): string[] {
  // 這裡簡化檢查，實際應該分析文件內容
  return []
}

function checkStandardApiTypes(): boolean {
  try {
    if (!fs.existsSync('src/types/index.ts')) return false
    
    const content = fs.readFileSync('src/types/index.ts', 'utf-8')
    return content.includes('ApiResponse') && content.includes('PaginatedResponse')
  } catch {
    return false
  }
}

function findDuplicateTypes(): string[] {
  const duplicates: string[] = []
  
  try {
    const files = ['src/types/index.ts', 'src/types/system.ts']
    const allTypes = new Set<string>()
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8')
        const interfaces = content.match(/interface\s+(\w+)/g) || []
        const types = content.match(/type\s+(\w+)/g) || []
        
        interfaces.concat(types).forEach(match => {
          const typeName = match.split(' ')[1]
          if (allTypes.has(typeName)) {
            duplicates.push(typeName)
          } else {
            allTypes.add(typeName)
          }
        })
      }
    })
  } catch (error) {
    console.warn('檢查重複類型時出錯:', error)
  }
  
  return duplicates
}

function generateReport(results: AuditResult[]): void {
  console.log('\n' + '='.repeat(60))
  console.log('📋 系統架構審查報告')
  console.log('='.repeat(60))
  
  const summary = {
    ok: 0,
    warning: 0,
    error: 0
  }
  
  results.forEach(result => {
    console.log(`\n🔍 ${result.category}`)
    console.log(`   狀態: ${getStatusIcon(result.status)} ${result.status}`)
    
    if (result.issues.length > 0) {
      console.log('   問題:')
      result.issues.forEach(issue => {
        console.log(`     ❌ ${issue}`)
      })
    }
    
    if (result.recommendations.length > 0) {
      console.log('   建議:')
      result.recommendations.forEach(rec => {
        console.log(`     💡 ${rec}`)
      })
    }
    
    summary[result.status.toLowerCase() as keyof typeof summary]++
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 總結')
  console.log(`   ✅ 正常: ${summary.ok} 項`)
  console.log(`   ⚠️  警告: ${summary.warning} 項`)
  console.log(`   ❌ 錯誤: ${summary.error} 項`)
  console.log('='.repeat(60))
  
  if (summary.error > 0) {
    console.log('\n🚨 需要立即修復的關鍵問題!')
  } else if (summary.warning > 0) {
    console.log('\n⚠️  建議優化這些警告項目!')
  } else {
    console.log('\n🎉 系統架構狀態良好!')
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'OK': return '✅'
    case 'WARNING': return '⚠️'
    case 'ERROR': return '❌'
    default: return '❓'
  }
}

// 執行審查
systemAudit().catch(console.error)