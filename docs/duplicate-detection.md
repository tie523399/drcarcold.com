# 內容去重機制文檔

## 概述

系統實現了多層次的內容去重檢查機制，可以有效避免重複爬取和發布相同的文章。

## 去重策略

### 1. URL 檢查（最快）
- **完全匹配**：檢查 URL 是否已存在
- **規範化匹配**：移除查詢參數和錨點後再比對
- **置信度**：100%

### 2. 標題相似度檢查
- **相似度閾值**：85%
- **檢查範圍**：最近 7 天的文章
- **特殊處理**：同一來源的文章降低閾值至 75%
- **算法**：Jaccard 相似度

### 3. 內容哈希檢查
- **算法**：MD5
- **預處理**：清理文本（只保留中文、英文、數字）
- **置信度**：100%（完全匹配）

### 4. 內容相似度檢查（最耗時）
- **相似度閾值**：80%
- **檢查範圍**：最近 3 天的文章（最多 100 篇）
- **特徵提取**：高頻詞（前 20 個）
- **算法**：基於關鍵詞的 Jaccard 相似度

## 使用方式

### 在爬蟲中自動檢查

爬蟲系統會在處理每篇文章前自動進行去重檢查：

```typescript
// 在 processArticle 方法中
const duplicateCheck = await this.duplicateChecker.checkDuplicate(
  articleData.url,
  articleData.title,
  articleData.content,
  source.id
)

if (duplicateCheck.isDuplicate) {
  // 跳過重複文章
  return null
}
```

### 手動檢查

```typescript
import { DuplicateChecker } from '@/lib/duplicate-checker'

const checker = new DuplicateChecker()
const result = await checker.checkDuplicate(
  'https://example.com/article',
  '文章標題',
  '文章內容',
  'source-id' // 可選
)

if (result.isDuplicate) {
  console.log(`重複類型: ${result.duplicateType}`)
  console.log(`置信度: ${result.confidence}`)
  console.log(`原因: ${result.reason}`)
}
```

### 批量檢查

```typescript
const articles = [
  { url: '...', title: '...', content: '...', sourceId: '...' },
  // ...
]

const results = await checker.batchCheckDuplicates(articles)

results.forEach((result, index) => {
  if (result.isDuplicate) {
    console.log(`文章 ${index} 是重複的`)
  }
})
```

## 資料庫設定

### 1. 更新 Schema

在 `prisma/schema.prisma` 中添加欄位：

```prisma
model News {
  // ... 其他欄位
  sourceId      String?   // 新聞來源 ID
  contentHash   String?   // 內容哈希值
  
  @@index([sourceId])
  @@index([contentHash])
}
```

### 2. 執行遷移

```bash
# 生成遷移檔案
npx prisma migrate dev --name add_duplicate_fields

# 生成 Prisma Client
npx prisma generate
```

### 3. 為現有文章生成哈希

```bash
# 執行遷移腳本
npx ts-node scripts/generate-content-hashes.ts
```

## 性能優化

### 1. 索引優化
- `sourceId` 和 `contentHash` 都建立了索引
- URL 查詢使用現有的 `sourceUrl` 欄位

### 2. 查詢優化
- 限制查詢時間範圍（3-7 天）
- 限制查詢數量（最多 100 篇）
- 使用 `select` 只查詢必要欄位

### 3. 批次處理
- 支援批量檢查，減少資料庫查詢次數
- 並行處理但限制並發數（5 個）

## 監控和日誌

系統會記錄以下資訊：
- 跳過的重複文章數量
- 重複類型分布
- 各種去重策略的命中率

在監控服務中可以看到：
```
[INFO] 跳過重複文章: xxx
- 重複類型: title
- 置信度: 0.87
- 原因: 標題相似度過高 (87%)
```

## 配置選項

可以在系統設定中調整：
- 相似度閾值
- 檢查時間範圍
- 是否啟用某種檢查策略

## 注意事項

1. **首次使用**：需要為現有文章生成內容哈希
2. **性能影響**：內容相似度檢查較耗時，建議在離峰時段執行
3. **準確性**：可能會將更新的文章誤判為重複，需要人工審核
4. **維護**：定期清理舊的內容哈希，避免資料庫過大 