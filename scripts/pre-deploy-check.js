#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 DrCarCold 部署前檢查腳本')
console.log('================================')

let checksPassed = 0
let checksTotal = 0
const issues = []

function runCheck(name, checkFn) {
  checksTotal++
  console.log(`\n📋 檢查 ${checksTotal}: ${name}`)
  
  try {
    const result = checkFn()
    if (result === true || result === undefined) {
      console.log(`   ✅ 通過`)
      checksPassed++
    } else {
      console.log(`   ❌ 失敗: ${result}`)
      issues.push(`${name}: ${result}`)
    }
  } catch (error) {
    console.log(`   ❌ 錯誤: ${error.message}`)
    issues.push(`${name}: ${error.message}`)
  }
}

// 1. 檢查 Node.js 版本
runCheck('Node.js 版本', () => {
  const version = process.version
  const major = parseInt(version.split('.')[0].substring(1))
  if (major < 18) {
    return `需要 Node.js 18+，當前版本: ${version}`
  }
})

// 2. 檢查必要文件
runCheck('必要文件存在', () => {
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'prisma/schema.prisma',
    '.env.local',
    'src/app/layout.tsx'
  ]
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      return `缺少文件: ${file}`
    }
  }
})

// 3. 檢查環境變數
runCheck('環境變數配置', () => {
  const envFile = '.env.local'
  if (!fs.existsSync(envFile)) {
    return '缺少 .env.local 文件'
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8')
  const requiredEnvs = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]
  
  for (const env of requiredEnvs) {
    if (!envContent.includes(env)) {
      return `缺少環境變數: ${env}`
    }
  }
})

// 4. 檢查AI配置
runCheck('AI服務配置', () => {
  const envFile = '.env.local'
  const envContent = fs.readFileSync(envFile, 'utf8')
  
  const aiServices = [
    'OPENAI_API_KEY',
    'GROQ_API_KEY', 
    'GOOGLE_AI_API_KEY',
    'COHERE_API_KEY',
    'DEEPSEEK_API_KEY'
  ]
  
  const configuredServices = aiServices.filter(service => 
    envContent.includes(service) && 
    !envContent.includes(`${service}=""`) &&
    !envContent.includes(`${service}="your-`)
  )
  
  if (configuredServices.length < 2) {
    return `建議配置至少2個AI服務，當前配置: ${configuredServices.length}`
  }
})

// 5. 檢查依賴安裝
runCheck('依賴完整性', () => {
  if (!fs.existsSync('node_modules')) {
    return 'node_modules 不存在，請運行 npm install'
  }
  
  try {
    execSync('npm ls --prod --depth=0', { stdio: 'pipe' })
  } catch (error) {
    return '依賴安裝不完整'
  }
})

// 6. 檢查構建
runCheck('構建測試', () => {
  try {
    console.log('     正在執行構建...')
    execSync('npm run build', { stdio: 'pipe' })
  } catch (error) {
    return '構建失敗'
  }
})

// 7. 檢查數據庫
runCheck('Prisma 配置', () => {
  try {
    execSync('npx prisma generate', { stdio: 'pipe' })
  } catch (error) {
    return 'Prisma 生成失敗'
  }
})

// 8. 檢查圖片目錄
runCheck('圖片資源', () => {
  const imageDir = 'public/images'
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true })
    return '已創建圖片目錄'
  }
  
  const images = fs.readdirSync(imageDir).filter(file => 
    file.toLowerCase().match(/\.(jpg|jpeg|png|gif|svg)$/)
  )
  
  if (images.length === 0) {
    return '建議在 public/images 目錄添加一些圖片'
  }
})

// 9. 檢查.gitignore
runCheck('.gitignore 配置', () => {
  if (!fs.existsSync('.gitignore')) {
    return '缺少 .gitignore 文件'
  }
  
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8')
  const requiredIgnores = ['.env.local', 'node_modules', '.next']
  
  for (const ignore of requiredIgnores) {
    if (!gitignoreContent.includes(ignore)) {
      return `建議在 .gitignore 添加: ${ignore}`
    }
  }
})

// 10. 檢查安全設置
runCheck('安全配置', () => {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  
  if (envContent.includes('NEXTAUTH_SECRET="your-secret"') || 
      envContent.includes('NEXTAUTH_SECRET=""')) {
    return 'NEXTAUTH_SECRET 使用默認值，請設置強密碼'
  }
  
  if (envContent.includes('ADMIN_PASSWORD="admin"') ||
      envContent.includes('ADMIN_PASSWORD="123456"')) {
    return '管理員密碼過於簡單'
  }
})

// 結果摘要
console.log('\n' + '='.repeat(50))
console.log('📊 檢查結果摘要')
console.log('='.repeat(50))

console.log(`\n總檢查項目: ${checksTotal}`)
console.log(`✅ 通過: ${checksPassed}`)
console.log(`❌ 問題: ${checksTotal - checksPassed}`)

if (issues.length > 0) {
  console.log('\n🔴 需要處理的問題:')
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`)
  })
}

const successRate = (checksPassed / checksTotal * 100).toFixed(1)
console.log(`\n成功率: ${successRate}%`)

if (successRate >= 80) {
  console.log('\n🎉 系統準備就緒，可以部署！')
  if (successRate < 100) {
    console.log('💡 建議修復上述問題以獲得最佳性能')
  }
  process.exit(0)
} else {
  console.log('\n⚠️ 系統尚未準備好部署，請修復問題後重新檢查')
  process.exit(1)
}
