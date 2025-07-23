#!/bin/bash

# 🚀 AWS CloudShell 自動部署腳本
# CloudShell 已經預配置了 AWS CLI 和憑證

echo "🚀 開始 CloudShell 自動部署..."

# 檢查 AWS CLI
echo "✅ 檢查 AWS CLI..."
aws --version

# 檢查身份
echo "✅ 檢查 AWS 身份..."
aws sts get-caller-identity

# 刪除現有的失敗應用（如果存在）
echo "🗑️ 清理現有應用..."
EXISTING_APP=$(aws amplify list-apps --query 'apps[?name==`drcarcold`].appId' --output text)
if [ ! -z "$EXISTING_APP" ] && [ "$EXISTING_APP" != "None" ]; then
    echo "發現現有應用 ID: $EXISTING_APP，正在刪除..."
    aws amplify delete-app --app-id $EXISTING_APP
    echo "✅ 舊應用已刪除"
fi

# 創建新的 Amplify 應用
echo "📱 創建新的 Amplify 應用..."
APP_RESULT=$(aws amplify create-app \
    --name "drcarcold" \
    --description "DR CarCold - 汽車冷媒專業系統" \
    --repository "https://github.com/tie523399/drcarcold" \
    --platform "WEB" \
    --environment-variables \
        NODE_ENV=production \
        DATABASE_URL="file:./dev.db" \
        JWT_SECRET="drcarcold-super-secret-jwt-key-2024-aws" \
        ADMIN_EMAIL="admin@drcarcold.com" \
        ADMIN_PASSWORD="DrCarCold2024!" \
        NEXTAUTH_SECRET="drcarcold-nextauth-secret-2024" \
    --custom-rules '[{"source":"/*","target":"/index.html","status":"200"}]' \
    --output json)

if [ $? -eq 0 ]; then
    echo "✅ Amplify 應用創建成功！"
    
    # 解析應用 ID
    APP_ID=$(echo $APP_RESULT | jq -r '.app.appId')
    echo "📱 應用 ID: $APP_ID"
    echo "🌐 默認域名: https://$APP_ID.amplifyapp.com"
    
    # 創建分支
    echo "🌿 創建 main 分支..."
    aws amplify create-branch \
        --app-id $APP_ID \
        --branch-name "main" \
        --description "Production branch" \
        --enable-auto-build \
        --output json
    
    if [ $? -eq 0 ]; then
        echo "✅ 分支創建成功！"
        
        # 開始部署
        echo "🚀 開始部署..."
        JOB_RESULT=$(aws amplify start-job \
            --app-id $APP_ID \
            --branch-name "main" \
            --job-type "RELEASE" \
            --output json)
        
        if [ $? -eq 0 ]; then
            JOB_ID=$(echo $JOB_RESULT | jq -r '.jobSummary.jobId')
            echo "✅ 部署任務已啟動！"
            echo "📋 任務 ID: $JOB_ID"
            echo "⏳ 部署通常需要 5-10 分鐘..."
            
            # 監控部署狀態
            echo "📊 監控部署狀態..."
            while true; do
                sleep 30
                STATUS_RESULT=$(aws amplify get-job --app-id $APP_ID --branch-name "main" --job-id $JOB_ID --output json)
                CURRENT_STATUS=$(echo $STATUS_RESULT | jq -r '.job.summary.status')
                echo "⏳ 當前狀態: $CURRENT_STATUS"
                
                if [ "$CURRENT_STATUS" = "SUCCEED" ]; then
                    echo "🎉 部署成功！"
                    echo "🌐 您的網站地址: https://$APP_ID.amplifyapp.com"
                    echo "🔧 AWS Console: https://console.aws.amazon.com/amplify/apps/$APP_ID"
                    break
                elif [ "$CURRENT_STATUS" = "FAILED" ] || [ "$CURRENT_STATUS" = "CANCELLED" ]; then
                    echo "❌ 部署失敗，狀態: $CURRENT_STATUS"
                    echo "📋 請檢查 AWS Console 查看詳細日誌"
                    break
                fi
            done
        else
            echo "❌ 啟動部署失敗"
        fi
    else
        echo "❌ 分支創建失敗"
    fi
else
    echo "❌ Amplify 應用創建失敗"
fi

echo "📝 部署腳本完成" 