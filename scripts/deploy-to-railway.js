#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`)
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    console.log(`✅ ${description} 完成`)
    return output
  } catch (error) {
    console.error(`❌ ${description} 失敗:`, error.message)
    throw error
  }
}

async function main() {
  console.log('🚄 DrCarCold Railway 部署腳本')
  console.log('===============================')

  try {
    // 1. 檢查 Railway CLI
    console.log('\n📋 檢查 Railway CLI...')
    try {
      execSync('railway --version', { stdio: 'pipe' })
      console.log('✅ Railway CLI 已安裝')
    } catch {
      console.log('❌ Railway CLI 未安裝')
      console.log('請運行: npm install -g @railway/cli')
      process.exit(1)
    }

    // 2. 檢查登入狀態
    console.log('\n📋 檢查 Railway 登入狀態...')
    try {
      execSync('railway whoami', { stdio: 'pipe' })
      console.log('✅ 已登入 Railway')
    } catch {
      console.log('❌ 未登入 Railway')
      console.log('請運行: railway login')
      process.exit(1)
    }

    // 3. 執行部署前檢查
    console.log('\n📋 執行部署前檢查...')
    try {
      execSync('node scripts/pre-deploy-check.js', { stdio: 'inherit' })
    } catch {
      const proceed = await askQuestion('\n⚠️ 檢查未完全通過，是否繼續部署？ (y/N): ')
      if (proceed.toLowerCase() !== 'y') {
        console.log('部署已取消')
        process.exit(1)
      }
    }

    // 4. 確認項目設置
    const projectName = await askQuestion('\n📝 輸入項目名稱 (或按 Enter 使用 drcarcold): ')
    const finalProjectName = projectName.trim() || 'drcarcold'

    console.log('\n🔧 配置項目...')
    
    // 檢查是否已有項目
    let isNewProject = false
    try {
      execSync('railway status', { stdio: 'pipe' })
      console.log('✅ 發現現有 Railway 項目')
    } catch {
      console.log('📂 創建新項目...')
      runCommand(`railway init ${finalProjectName}`, '初始化項目')
      isNewProject = true
    }

    // 5. 設置環境變數
    console.log('\n🔐 配置環境變數...')
    
    const envFile = '.env.local'
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8')
      const envLines = envContent.split('\n').filter(line => 
        line.trim() && !line.startsWith('#') && line.includes('=')
      )

      for (const line of envLines) {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=').replace(/"/g, '')
        
        // 跳過本地開發專用的變數
        if (key.includes('DATABASE_URL') && value.includes('file:')) {
          console.log(`⏭️ 跳過本地數據庫配置: ${key}`)
          continue
        }
        
        if (key.includes('NEXTAUTH_URL') && value.includes('localhost')) {
          console.log(`⏭️ 跳過本地URL配置: ${key}`)
          continue
        }

        try {
          runCommand(`railway variables set ${key}="${value}"`, `設置環境變數 ${key}`)
        } catch (error) {
          console.log(`⚠️ 環境變數 ${key} 設置失敗: ${error.message}`)
        }
      }
    }

    // 6. 設置生產環境變數
    console.log('\n🌍 配置生產環境變數...')
    
    const productionVars = [
      { key: 'NODE_ENV', value: 'production' },
      { key: 'NIXPACKS_MEMORY', value: '1024' },
      { key: 'NODE_OPTIONS', value: '--max-old-space-size=1024' }
    ]

    for (const { key, value } of productionVars) {
      try {
        runCommand(`railway variables set ${key}="${value}"`, `設置 ${key}`)
      } catch (error) {
        console.log(`⚠️ ${key} 設置失敗: ${error.message}`)
      }
    }

    // 7. 連接到 Git
    const useGit = await askQuestion('\n📤 是否連接到 GitHub 倉庫？ (y/N): ')
    if (useGit.toLowerCase() === 'y') {
      const gitUrl = await askQuestion('輸入 GitHub 倉庫 URL: ')
      if (gitUrl.trim()) {
        try {
          runCommand(`railway connect ${gitUrl}`, '連接 GitHub 倉庫')
        } catch (error) {
          console.log('⚠️ GitHub 連接失敗，將使用本地部署')
        }
      }
    }

    // 8. 執行部署
    console.log('\n🚀 開始部署...')
    const deployOutput = runCommand('railway deploy', '部署應用')

    // 9. 獲取部署URL
    console.log('\n🔗 獲取部署URL...')
    try {
      const statusOutput = execSync('railway status --json', { encoding: 'utf8' })
      const status = JSON.parse(statusOutput)
      const deploymentUrl = status.deployments?.[0]?.url
      
      if (deploymentUrl) {
        console.log(`\n🎉 部署成功！`)
        console.log(`🌍 應用URL: https://${deploymentUrl}`)
        console.log(`🔧 管理後台: https://${deploymentUrl}/admin`)
        
        // 更新 NEXTAUTH_URL
        try {
          runCommand(`railway variables set NEXTAUTH_URL="https://${deploymentUrl}"`, '更新 NEXTAUTH_URL')
        } catch {}
      }
    } catch (error) {
      console.log('⚠️ 無法獲取部署URL，請檢查 Railway 控制台')
    }

    // 10. 部署後檢查
    console.log('\n🔍 執行部署後檢查...')
    
    const checkUrl = await askQuestion('輸入部署URL以進行健康檢查 (或按 Enter 跳過): ')
    if (checkUrl.trim()) {
      try {
        const healthUrl = checkUrl.includes('/api/health') ? checkUrl : `${checkUrl}/api/health`
        runCommand(`curl -f ${healthUrl}`, '健康檢查')
        console.log('✅ 應用運行正常')
      } catch {
        console.log('⚠️ 健康檢查失敗，請檢查部署狀態')
      }
    }

    // 11. 顯示後續步驟
    console.log('\n📋 部署完成！後續步驟:')
    console.log('1. 訪問應用並檢查基本功能')
    console.log('2. 登入管理後台 /admin')
    console.log('3. 執行系統測試 /admin/deep-test')
    console.log('4. 配置爬蟲和AI服務')
    console.log('5. 監控應用運行狀態')
    
    console.log('\n🔧 有用的 Railway 命令:')
    console.log('  railway logs --follow    # 查看實時日誌')
    console.log('  railway status           # 檢查部署狀態')
    console.log('  railway variables        # 查看環境變數')
    console.log('  railway open             # 打開應用')
    
  } catch (error) {
    console.error('\n💥 部署失敗:', error.message)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
