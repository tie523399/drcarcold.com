# 系統架構保護文檔

## ⚠️ 重要：核心架構設計原則

### 🛡️ 不可修改的核心結構

以下組件和設計是系統的核心架構，**禁止隨意修改**：

#### 1. 自動化服務管理 (`src/lib/auto-service-manager.ts`)
```typescript
// 🔒 核心架構 - 請勿修改
export class AutoServiceManager {
  // 單例模式 - 確保全系統只有一個實例
  private constructor() {
    // SEOContentGenerator 必須動態初始化（需要 API key）
    this.seoGenerator = null as any
  }
  
  // 動態初始化模式 - 避免構造函數錯誤
  private async getSetting(key: string): Promise<string | null>
  private async executeSEOGenerator(): Promise<void>
}
```

**修改原則：**
- ✅ 可以調整配置值和時間間隔
- ✅ 可以添加新的執行邏輯
- ❌ 不可修改構造函數模式
- ❌ 不可移除動態初始化邏輯

#### 2. 統一控制架構
```
/admin/auto-service     ← 唯一的控制中心
/admin/crawler          ← 監控和測試功能
/admin/news-sources     ← 來源管理功能
/admin/dashboard        ← 狀態概覽
```

**設計原則：**
- ✅ 所有自動化控制統一到 `auto-service`
- ✅ 其他頁面只提供查看和配置功能
- ❌ 不可在多個頁面添加控制按鈕
- ❌ 不可破壞統一控制架構

#### 3. API 路由結構
```
/api/auto-startup      ← 舊版本（保留相容性）
/api/auto-service      ← 新版本統一管理
/api/auto-crawler      ← 爬蟲專用API
/api/seo-generator     ← SEO生成專用API
```

### 🏗️ 核心設計模式

#### 1. 單例模式 (Singleton Pattern)
```typescript
// 確保全系統只有一個自動化服務實例
let autoServiceManager: AutoServiceManager | null = null

export function getAutoServiceManager(): AutoServiceManager {
  if (!autoServiceManager) {
    autoServiceManager = new AutoServiceManager()
  }
  return autoServiceManager
}
```

#### 2. 動態導入模式 (Dynamic Import Pattern)
```typescript
// 避免構造函數依賴問題
if (!this.seoGenerator) {
  const { SEOContentGenerator } = await import('./seo-content-generator')
  this.seoGenerator = new SEOContentGenerator(cohereApiKey)
}
```

#### 3. 配置驅動模式 (Configuration-Driven Pattern)
```typescript
// 所有時間間隔和參數都從數據庫讀取
await this.loadConfig()
const intervalMinutes = this.config.crawlerInterval
```

### 🔄 標準流程

#### 1. 服務啟動流程
```
應用啟動 → 初始化數據庫 → 載入配置 → 啟動自動化服務 → 設定定時任務
```

#### 2. 配置更新流程
```
前端更新 → 保存到數據庫 → 重新載入配置 → 重啟相關服務
```

#### 3. 服務執行流程
```
定時觸發 → 檢查配置 → 執行任務 → 記錄日誌 → 清理檢查
```

### 🚨 常見錯誤和避免方法

#### 1. 構造函數依賴錯誤
```typescript
// ❌ 錯誤：直接在構造函數中初始化需要參數的類
constructor() {
  this.seoGenerator = new SEOContentGenerator() // 缺少參數
}

// ✅ 正確：動態初始化
constructor() {
  this.seoGenerator = null as any
}
```

#### 2. 多重控制錯誤
```typescript
// ❌ 錯誤：在多個頁面添加啟動按鈕
<Button onClick={() => startCrawler()}>啟動爬蟲</Button>

// ✅ 正確：引導到統一控制頁面
<Link href="/admin/auto-service">
  <Button>前往自動化服務</Button>
</Link>
```

#### 3. 配置硬編碼錯誤
```typescript
// ❌ 錯誤：硬編碼時間間隔
setInterval(() => crawl(), 30 * 60 * 1000) // 固定30分鐘

// ✅ 正確：配置驅動
const interval = await this.getSetting('crawlerInterval')
setInterval(() => crawl(), interval * 60 * 1000)
```

### 📝 修改指南

#### 安全修改區域
- ✅ UI 組件樣式和佈局
- ✅ 配置項數值和選項
- ✅ 日誌內容和格式
- ✅ 錯誤處理邏輯

#### 謹慎修改區域
- ⚠️ API 路由參數和返回格式
- ⚠️ 數據庫查詢邏輯
- ⚠️ 文件上傳和處理邏輯

#### 禁止修改區域
- ❌ 核心類的構造函數
- ❌ 單例模式實現
- ❌ 動態初始化邏輯
- ❌ 統一控制架構

### 🧪 測試檢查清單

在進行任何修改後，請確保：

1. **構建檢查**
   ```bash
   npm run build
   ```
   ✅ 無 TypeScript 錯誤
   ✅ 無構造函數依賴錯誤

2. **功能檢查**
   - ✅ 自動化服務可以正常啟動/停止
   - ✅ 配置更新可以即時生效
   - ✅ 所有頁面都能正常加載

3. **架構檢查**
   - ✅ 控制功能只在 `/admin/auto-service` 存在
   - ✅ 其他頁面只有查看和引導功能
   - ✅ 沒有重複的控制按鈕

### 🔧 故障排除

#### 如果遇到構造函數錯誤：
1. 檢查是否在構造函數中直接初始化需要參數的類
2. 改用動態初始化模式
3. 添加必要的空值檢查

#### 如果遇到控制衝突：
1. 確認只有一個控制中心
2. 移除其他頁面的控制按鈕
3. 添加引導連結到統一控制頁面

#### 如果遇到配置不生效：
1. 檢查是否正確保存到數據庫
2. 確認服務重新載入配置
3. 驗證定時任務是否重新設定

---

**⚡ 記住：保持架構的一致性比添加新功能更重要！** 