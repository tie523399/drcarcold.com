#!/bin/bash

# 🚂 Railway 自動部署腳本

echo "🚂 開始 Railway 部署流程..."

# 檢查必要文件
echo "📋 檢查項目文件..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json 不存在"
    exit 1
fi

if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Prisma schema 不存在"
    exit 1
fi

if [ ! -f "public/images/hero-video.mp4" ]; then
    echo "⚠️ 警告: 背景視頻不存在"
fi

# 清理構建緩存
echo "🧹 清理構建緩存..."
rm -rf .next
rm -rf node_modules/.cache

# 安裝依賴
echo "📦 安裝依賴..."
npm ci

# 生成 Prisma 客戶端
echo "🗄️ 生成 Prisma 客戶端..."
npx prisma generate

# 構建應用
echo "🔨 構建應用..."
npm run build

# 檢查構建結果
if [ ! -d ".next" ]; then
    echo "❌ 構建失敗"
    exit 1
fi

echo "✅ 項目準備完成，可以部署到 Railway！"
echo ""
echo "📋 部署清單："
echo "  ✅ package.json - 腳本和依賴"
echo "  ✅ nixpacks.toml - 構建配置"
echo "  ✅ railway.json - 部署配置"
echo "  ✅ next.config.js - Next.js 配置"
echo "  ✅ prisma/ - 數據庫配置"
echo "  ✅ public/images/ - 靜態資源"
echo ""
echo "🚀 下一步："
echo "1. 推送代碼到 GitHub"
echo "2. 連接 Railway 到 GitHub 倉庫"
echo "3. 等待自動部署完成" 