#!/bin/bash

echo "🚀 Starting DrCarCold on Render.com..."

# 设置数据库
echo "🗄️ Setting up database..."
npx prisma db push

# 运行种子数据（如果存在）
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Running seed data..."
    npm run seed || npx tsx prisma/seed.ts || echo "⚠️ Seed failed, continuing..."
fi

# 启动应用
echo "🌐 Starting application..."
npm start