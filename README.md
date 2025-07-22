# 車冷博士網站

使用 Next.js 14 + TypeScript + Supabase + Prisma 建立的冷凍空調公司網站。

## 功能特色

### 前台功能
- 🏠 響應式首頁設計
- 📦 產品展示系統
- ❄️ 冷媒資訊查詢
- 📰 新聞文章系統
- 🔍 SEO 最佳化

### 管理後台
- 📊 統計儀表板
- 🛠️ 產品管理 (CRUD)
- 🧊 冷媒管理 (CRUD)
- 📝 新聞管理 (CRUD + 排程發布)
- 🖼️ 圖片上傳 (Supabase Storage)

## 技術架構

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **資料庫**: PostgreSQL + Prisma ORM
- **儲存**: Supabase Storage
- **樣式**: Tailwind CSS
- **部署**: Vercel

## 開始使用

### 環境需求
- Node.js 18+
- PostgreSQL 資料庫
- Supabase 帳號

### 安裝步驟

1. 複製專案
```bash
git clone [repository-url]
cd drcarcold_setup
```

2. 安裝依賴
```bash
pnpm install
```

3. 設定環境變數
複製 `.env.local.example` 為 `.env.local` 並填入相關設定：
```env
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-database-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_KEY="your-supabase-service-key"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

4. 執行資料庫遷移
```bash
pnpm prisma migrate dev
```

5. 填充初始資料
```bash
pnpm prisma db seed
```

6. 啟動開發伺服器
```bash
pnpm dev
```

### 預設管理員帳號
- Email: admin@drcarcold.com
- 密碼: admin123

## 專案結構

```
src/
├── app/                  # Next.js App Router
│   ├── (public)/        # 前台頁面
│   ├── admin/           # 管理後台
│   └── api/             # API 路由
├── components/          # React 元件
├── lib/                 # 工具函式
├── hooks/               # 自定義 Hooks
└── types/               # TypeScript 類型
```

## 部署

### Vercel 部署

1. 推送程式碼到 GitHub
2. 在 Vercel 匯入專案
3. 設定環境變數
4. 部署

### 資料庫設定

確保在生產環境設定以下環境變數：
- `DATABASE_URL`: Prisma 連接字串
- `DIRECT_URL`: 直接連接字串（用於 migrations）

## 開發指令

```bash
# 開發模式
pnpm dev

# 建置專案
pnpm build

# 啟動生產伺服器
pnpm start

# 檢查程式碼
pnpm lint

# Prisma Studio
pnpm prisma studio

# 生成 Prisma Client
pnpm prisma generate
```

## 授權

本專案版權所有 © 2024 車冷博士 