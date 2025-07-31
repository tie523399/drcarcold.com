import { SmartContactButton } from '@/components/ui/smart-contact-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContactDemoPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gradient-platinum">
          智能聯絡按鈕演示
        </h1>
        
        <div className="grid gap-6">
          <Card className="card-silver-premium">
            <CardHeader>
              <CardTitle>產品詢價按鈕</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 mb-4">
                這個按鈕會根據設備類型自動調整行為：
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6">
                <li><strong>手機/平板：</strong>點擊後直接撥打電話 04-26301915</li>
                <li><strong>電腦：</strong>點擊後開啟郵件程式發送詢價郵件</li>
              </ul>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">一般詢價按鈕：</p>
                  <SmartContactButton variant="premium">
                    聯絡我們
                  </SmartContactButton>
                </div>
                
                <div>
                  <p className="font-medium mb-2">產品詢價按鈕（帶產品名稱）：</p>
                  <SmartContactButton 
                    productName="R134a 汽車冷媒 500g"
                    variant="default"
                  >
                    詢問此商品
                  </SmartContactButton>
                </div>
                
                <div>
                  <p className="font-medium mb-2">次要聯絡按鈕：</p>
                  <SmartContactButton 
                    productName="冷媒回收機"
                    variant="secondary"
                    size="lg"
                  >
                    了解更多
                  </SmartContactButton>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-silver-premium">
            <CardHeader>
              <CardTitle>技術說明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>設備檢測：</strong>系統會自動檢測設備類型和螢幕寬度
                </p>
                <p>
                  <strong>行動裝置：</strong>寬度 ≤ 768px 或檢測到行動裝置的 User Agent
                </p>
                <p>
                  <strong>電話號碼：</strong>04-26301915（從系統設定中讀取）
                </p>
                <p>
                  <strong>郵件地址：</strong>hongshun.TW@gmail.com（從系統設定中讀取）
                </p>
                <p>
                  <strong>郵件內容：</strong>自動包含產品名稱和標準詢價內容
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 