'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Globe, Sparkles, Eye, EyeOff, Plus } from 'lucide-react'

interface Settings {
  crawlUrls?: string
  openaiApiKey?: string
  autoNewsEnabled?: boolean
  aiRewriteEnabled?: boolean
  seoKeywords?: string
  autoCrawlEnabled?: boolean
  autoPublishEnabled?: boolean
  crawlInterval?: number
  publishSchedule?: string
  aiProvider?: string
  groqApiKey?: string
  geminiApiKey?: string
  cohereApiKey?: string
  deepseekApiKey?: string
  zhipuApiKey?: string
  moonshotApiKey?: string
  huggingfaceApiKey?: string
  togetherApiKey?: string
  parallelCrawling?: boolean
  concurrentLimit?: number
  autoSeoEnabled?: boolean
  seoGenerationSchedule?: string
  seoDailyCount?: number
  // 新增自動故障切換功能
  aiAutoFallback?: boolean
  aiProviderPriority?: string[]
  aiFailoverRetries?: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    crawlUrls: '',
    openaiApiKey: '',
    autoNewsEnabled: false,
    aiRewriteEnabled: false,
    seoKeywords: '',
    autoCrawlEnabled: false,
    autoPublishEnabled: false,
    crawlInterval: 60,
    publishSchedule: '09:00,15:00,21:00',
    aiProvider: 'deepseek',
    groqApiKey: '',
    geminiApiKey: '',
    cohereApiKey: '',
    deepseekApiKey: '',
    zhipuApiKey: '',
    moonshotApiKey: '',
    huggingfaceApiKey: '',
    togetherApiKey: '',
    autoSeoEnabled: false,
    seoGenerationSchedule: '10:00',
    seoDailyCount: 1,
    // 新增自動故障切換設定
    aiAutoFallback: true,
    aiProviderPriority: ['deepseek', 'groq', 'gemini', 'cohere'],
    aiFailoverRetries: 3,
  })

  // 載入設定
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('設定已儲存')
      } else {
        throw new Error('儲存失敗')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('儲存設定時發生錯誤')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (key: keyof Settings, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const testAIConnections = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-all' }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`AI連接測試完成!\n\n${data.message}`)
      } else {
        alert(`測試失敗: ${data.error}`)
      }
    } catch (error) {
      console.error('AI測試失敗:', error)
      alert('AI連接測試失敗')
    } finally {
      setIsSaving(false)
    }
  }

  const resetAIFailures = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-failures' }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert('AI失敗計數已重置')
      } else {
        alert(`重置失敗: ${data.error}`)
      }
    } catch (error) {
      console.error('重置失敗:', error)
      alert('重置失敗計數失敗')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">載入中...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">系統設定</h1>
        <p className="text-gray-600 mt-2">管理 API Keys 和自動化功能設定</p>
      </div>

      <div className="space-y-6">
        {/* 新聞網站設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              新聞網站設定
            </CardTitle>
            <CardDescription>
              設定要爬取的新聞網站網址，系統將自動從這些網站獲取最新文章
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                新聞網站網址
              </label>
              <textarea
                value={settings.crawlUrls || ''}
                onChange={(e) => handleChange('crawlUrls', e.target.value)}
                rows={6}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="請輸入新聞網站網址，每行一個網址，例如：&#10;https://example.com/news&#10;https://another-news.com/articles&#10;https://tech-news.com/latest"
              />
              <p className="mt-1 text-sm text-gray-500">
                每行輸入一個新聞網站網址，系統將定期檢查這些網站的新文章
              </p>
              <div className="mt-2 p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>使用說明：</strong><br />
                  1. 每行輸入一個完整的網址<br />
                  2. 建議使用新聞網站的 RSS 或文章列表頁面<br />
                  3. 系統會自動偵測頁面結構並提取文章<br />
                  4. 支援大多數新聞網站和部落格平台
                </p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoNewsEnabled || false}
                  onChange={(e) => handleChange('autoNewsEnabled', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">啟用自動新聞更新</span>
              </label>
              <p className="ml-6 text-sm text-gray-500">
                啟用後，系統將定期自動爬取上方設定的新聞網站
              </p>
            </div>
          </CardContent>
        </Card>

        {/* AI 自動故障切換設定 */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              🤖 智能AI自動切換系統
            </CardTitle>
            <CardDescription className="text-blue-700">
              配置多個AI提供商，系統將自動嘗試不同的AI服務，確保100%可用性且完全免費！
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 自動故障切換開關 */}
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.aiAutoFallback || false}
                    onChange={(e) => handleChange('aiAutoFallback', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-blue-900">🚀 啟用智能自動切換</span>
                </label>
              </div>
              <p className="text-sm text-blue-700 ml-6">
                啟用後，當一個AI服務失敗時，系統會自動嘗試下一個可用的AI服務，確保服務不中斷
              </p>
              
              {settings.aiAutoFallback && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">💡 智能切換優勢：</h4>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>充分利用各平台免費額度，節省成本</li>
                    <li>一個API失敗自動切換到下一個，保證服務可用性</li>
                    <li>智能重試機制，減少因網路問題導致的失敗</li>
                    <li>支援自定義優先順序，優先使用您偏好的AI服務</li>
                  </ul>
                </div>
              )}
            </div>

            {/* 故障切換設定 */}
            {settings.aiAutoFallback && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">⚙️ 切換參數設定</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      重試次數
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={settings.aiFailoverRetries || 3}
                      onChange={(e) => handleChange('aiFailoverRetries', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      每個AI服務失敗時的重試次數（建議2-3次）
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 多AI提供商API Key設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              🔑 多AI提供商API Key設定
            </CardTitle>
            <CardDescription>
              {settings.aiAutoFallback 
                ? "設定多個AI服務的API Key，系統將按優先順序自動使用" 
                : "選擇並設定您要使用的AI服務提供商API Key"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {!settings.aiAutoFallback && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  主要AI服務提供商
                </label>
                <select
                  value={settings.aiProvider || 'deepseek'}
                  onChange={(e) => handleChange('aiProvider', e.target.value)}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="deepseek">DeepSeek (完全免費 - 強烈推薦 🇨🇳)</option>
                  <option value="groq">Groq (免費 - 速度快 ⚡)</option>
                  <option value="zhipu">智譜AI GLM (免費 - 中文原生 📝)</option>
                  <option value="moonshot">Moonshot (免費額度 🌙)</option>
                  <option value="huggingface">Hugging Face (免費 🤗)</option>
                  <option value="together">Together AI (免費額度 🤝)</option>
                  <option value="gemini">Google Gemini (免費 🔍)</option>
                  <option value="cohere">Cohere (免費 💼)</option>
                  <option value="openai">OpenAI (付費 💰)</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  選擇您要使用的主要AI服務提供商
                </p>
              </div>
            )}

            {/* 智能切換說明 */}
            {settings.aiAutoFallback ? (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">🤖 智能切換模式已啟用</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p><strong>系統將按以下順序自動嘗試：</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>🇨🇳 <strong>DeepSeek</strong> - 完全免費，中文支援最佳</li>
                    <li>⚡ <strong>Groq</strong> - 每天14,400次免費，速度最快</li>
                    <li>🔍 <strong>Gemini</strong> - Google技術，每分鐘15次免費</li>
                    <li>💼 <strong>Cohere</strong> - 每月1000次免費</li>
                    <li>💰 <strong>OpenAI</strong> - 付費備用（如有設定）</li>
                  </ol>
                  <div className="mt-3 p-2 bg-green-100 rounded">
                    <p className="text-green-800 text-xs">
                      💡 <strong>完全免費策略：</strong>只設定前4個免費服務即可實現無限制使用！
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ 單一提供商模式</h4>
                <p className="text-sm text-yellow-700">
                  目前只使用選定的AI服務。建議啟用「智能自動切換」以獲得更好的可用性和免費額度利用。
                </p>
              </div>
            )}

            {/* 免費AI服務API Key設定 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">🎉 免費AI服務 (推薦)</h4>
              
              {/* DeepSeek API Key */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🇨🇳</span>
                  <label className="block text-sm font-medium">
                    DeepSeek API Key (完全免費 - 首選)
                  </label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.deepseekApiKey || ''}
                    onChange={(e) => handleChange('deepseekApiKey', e.target.value)}
                    placeholder="請輸入 DeepSeek API Key"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  >
                    {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-green-700">
                  註冊：<a href="https://platform.deepseek.com" target="_blank" className="underline">platform.deepseek.com</a> 
                  · 完全免費，中文支援極佳
                </p>
              </div>

              {/* Groq API Key */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <label className="block text-sm font-medium">
                    Groq API Key (速度最快)
                  </label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.groqApiKey || ''}
                    onChange={(e) => handleChange('groqApiKey', e.target.value)}
                    placeholder="請輸入 Groq API Key"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  >
                    {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-blue-700">
                  註冊：<a href="https://console.groq.com" target="_blank" className="underline">console.groq.com</a> 
                  · 每天14,400次免費請求
                </p>
              </div>

              {/* Gemini API Key */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔍</span>
                  <label className="block text-sm font-medium">
                    Google Gemini API Key
                  </label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.geminiApiKey || ''}
                    onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                    placeholder="請輸入 Gemini API Key"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  >
                    {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-purple-700">
                  註冊：<a href="https://ai.google.dev" target="_blank" className="underline">ai.google.dev</a> 
                  · 每分鐘15次免費請求
                </p>
              </div>

              {/* Cohere API Key */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💼</span>
                  <label className="block text-sm font-medium">
                    Cohere API Key
                  </label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.cohereApiKey || ''}
                    onChange={(e) => handleChange('cohereApiKey', e.target.value)}
                    placeholder="請輸入 Cohere API Key"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  >
                    {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-orange-700">
                  註冊：<a href="https://dashboard.cohere.ai" target="_blank" className="underline">dashboard.cohere.ai</a> 
                  · 每月1000次免費請求
                </p>
              </div>
            </div>

            {/* 其他AI服務 */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">🔧 其他AI服務</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 智譜AI */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium mb-2">
                    📝 智譜AI GLM API Key
                  </label>
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.zhipuApiKey || ''}
                    onChange={(e) => handleChange('zhipuApiKey', e.target.value)}
                    placeholder="智譜AI API Key"
                    className="text-sm"
                  />
                </div>

                {/* Moonshot */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium mb-2">
                    🌙 Moonshot API Key
                  </label>
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.moonshotApiKey || ''}
                    onChange={(e) => handleChange('moonshotApiKey', e.target.value)}
                    placeholder="Moonshot API Key"
                    className="text-sm"
                  />
                </div>

                {/* Hugging Face */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium mb-2">
                    🤗 Hugging Face Token
                  </label>
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.huggingfaceApiKey || ''}
                    onChange={(e) => handleChange('huggingfaceApiKey', e.target.value)}
                    placeholder="Hugging Face Token"
                    className="text-sm"
                  />
                </div>

                {/* Together AI */}
                <div className="p-3 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium mb-2">
                    🤝 Together AI API Key
                  </label>
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.togetherApiKey || ''}
                    onChange={(e) => handleChange('togetherApiKey', e.target.value)}
                    placeholder="Together AI API Key"
                    className="text-sm"
                  />
                </div>

                {/* OpenAI (付費) */}
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <label className="block text-sm font-medium mb-2">
                    💰 OpenAI API Key (付費)
                  </label>
                  <Input
                    type={showOpenAIKey ? 'text' : 'password'}
                    value={settings.openaiApiKey || ''}
                    onChange={(e) => handleChange('openaiApiKey', e.target.value)}
                    placeholder="OpenAI API Key"
                    className="text-sm"
                  />
                  <p className="text-xs text-red-600 mt-1">需要付費，建議優先使用免費服務</p>
                </div>
              </div>
            </div>

            {/* 測試AI連接功能 */}
            {settings.aiAutoFallback && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">🧪 測試AI連接</h4>
                <div className="flex gap-3">
                  <Button
                    onClick={testAIConnections}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                  >
                    {isSaving ? '測試中...' : '測試所有AI服務'}
                  </Button>
                  <Button
                    onClick={resetAIFailures}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                  >
                    重置失敗計數
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  測試所有已配置的AI服務是否可正常使用，並重置失敗計數
                </p>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.aiRewriteEnabled || false}
                  onChange={(e) => handleChange('aiRewriteEnabled', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">啟用 AI 文章改寫</span>
              </label>
              <p className="ml-6 text-sm text-gray-500">
                啟用後，抓取的文章將自動使用 AI 根據 SEO 關鍵字進行改寫
              </p>
            </div>

            {/* 繁體中文設定說明 */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">🌟 繁體中文優化設定</h4>
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>AI 改寫已優化為繁體中文輸出：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>系統會強制要求 AI 使用繁體中文</li>
                  <li>禁止使用簡體中文字符</li>
                  <li>確保內容流暢自然且專業</li>
                  <li>適當融入您設定的 SEO 關鍵字</li>
                </ul>
                <p className="mt-2 text-xs text-green-600">
                  💡 建議：在下方的 SEO 關鍵字中也使用繁體中文，效果會更好
                </p>
              </div>
            </div>

            {/* API 使用說明 */}
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>免費 API 推薦使用順序：</strong><br />
                1. <strong>Groq</strong> - 速度最快，額度最多（每天 14,400 次）<br />
                2. <strong>Gemini</strong> - Google 技術，品質優秀（每分鐘 15 次）<br />
                3. <strong>Cohere</strong> - 專業文本生成（每月 1000 次）<br />
                4. <strong>OpenAI</strong> - 付費但品質最穩定
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO 關鍵字設定 */}
        <Card>
          <CardHeader>
            <CardTitle>SEO 關鍵字設定</CardTitle>
            <CardDescription>
              設定 AI 改寫文章時要包含的關鍵字（建議使用繁體中文）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">
                SEO 關鍵字
              </label>
              <textarea
                value={settings.seoKeywords || ''}
                onChange={(e) => handleChange('seoKeywords', e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="請輸入關鍵字，用逗號分隔（例如：車用冷氣,冷媒,R134a,環保冷媒,汽車維修,冷氣保養）"
              />
              <p className="mt-1 text-sm text-gray-500">
                AI 改寫文章時會盡可能包含這些關鍵字，建議使用繁體中文
              </p>
            </div>

            {/* 繁體中文關鍵字建議 */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-md">
              <p className="text-xs text-yellow-800">
                <strong>繁體中文關鍵字建議：</strong><br />
                車用冷氣、汽車冷媒、R134a冷媒、環保冷媒、冷氣維修、汽車保養、<br />
                冷氣系統、冷媒更換、汽車空調、冷氣檢修、冷媒回收、車輛維護<br />
                <br />
                <strong>注意：</strong>使用繁體中文關鍵字可以確保 AI 改寫的內容更符合台灣用戶的搜尋習慣
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 自動爬取設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              自動新聞爬取設定
            </CardTitle>
            <CardDescription>
              設定自動爬取新聞網站並發布文章的功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoCrawlEnabled || false}
                  onChange={(e) => handleChange('autoCrawlEnabled', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">啟用自動新聞爬取</span>
              </label>
              <p className="ml-6 text-sm text-gray-500">
                啟用後，系統將定時自動爬取指定新聞網站
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                爬取間隔（分鐘）
              </label>
              <Input
                type="number"
                value={settings.crawlInterval || 60}
                onChange={(e) => handleChange('crawlInterval', parseInt(e.target.value))}
                min="15"
                max="1440"
                placeholder="60"
              />
              <p className="mt-1 text-sm text-gray-500">
                設定多久檢查一次新文章（建議15-120分鐘）
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.parallelCrawling === true}
                  onChange={(e) => handleChange('parallelCrawling', e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium">啟用並行爬取</span>
              </label>
              <p className="ml-6 text-sm text-gray-500">
                同時爬取多個新聞來源，提升爬取效率
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                並行爬取數量限制
              </label>
              <Input
                type="number"
                value={settings.concurrentLimit || 3}
                onChange={(e) => handleChange('concurrentLimit', parseInt(e.target.value))}
                min="1"
                max="10"
                placeholder="3"
                disabled={!settings.parallelCrawling}
              />
              <p className="mt-1 text-sm text-gray-500">
                同時最多處理幾個新聞來源（建議 3-5 個）
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoPublishEnabled || false}
                  onChange={(e) => handleChange('autoPublishEnabled', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">啟用自動發布</span>
              </label>
              <p className="ml-6 text-sm text-gray-500">
                啟用後，AI改寫完成的文章將自動發布，否則儲存為草稿
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                發布時間設定
              </label>
              <Input
                value={settings.publishSchedule || ''}
                onChange={(e) => handleChange('publishSchedule', e.target.value)}
                placeholder="09:00,15:00,21:00"
              />
              <p className="mt-1 text-sm text-gray-500">
                設定每日自動發布的時間點，用逗號分隔（例如：09:00,15:00,21:00）
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-md">
              <p className="text-xs text-amber-800">
                <strong>注意事項：</strong><br />
                1. 自動爬取功能需要配合 AI 改寫使用<br />
                2. 建議先測試爬蟲功能確保正常運作<br />
                3. 自動發布前請確認 SEO 關鍵字設定正確<br />
                4. 系統會自動檢測重複文章並跳過
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO 文章自動生成設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              SEO 文章自動生成
            </CardTitle>
            <CardDescription>
              設定每日自動生成 SEO 文章的時間和數量
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoSeoEnabled || false}
                  onChange={(e) => handleChange('autoSeoEnabled', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">啟用 SEO 文章自動生成</span>
              </label>
              <p className="ml-6 text-sm text-gray-500">
                啟用後，系統將每日自動生成指定數量的 SEO 文章
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                生成時間
              </label>
              <Input
                type="time"
                value={settings.seoGenerationSchedule || '10:00'}
                onChange={(e) => handleChange('seoGenerationSchedule', e.target.value)}
                className="w-48"
              />
              <p className="mt-1 text-sm text-gray-500">
                設定每日自動生成 SEO 文章的時間（24小時制）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                每日生成數量
              </label>
              <Input
                type="number"
                min="1"
                max="5"
                value={settings.seoDailyCount || 1}
                onChange={(e) => handleChange('seoDailyCount', parseInt(e.target.value))}
                className="w-24"
              />
              <p className="mt-1 text-sm text-gray-500">
                每日自動生成的 SEO 文章數量（建議 1-3 篇）
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                <strong>SEO 文章生成說明：</strong><br />
                • 系統會從 8 個預定義主題中自動選擇<br />
                • 使用 Cohere AI 生成 1000-1500 字專業文章<br />
                • 自動優化 SEO 標題、描述和關鍵字<br />
                • 生成後直接發布到網站新聞區塊<br />
                • 需要先設定 Cohere API Key 並啟用 AI 改寫功能
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            variant="premium"
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                儲存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                儲存設定
              </>
            )}
          </Button>

          {/* 功能連結 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('/admin/news', '_blank')}
            >
              新聞管理
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/admin/dashboard', '_blank')}
            >
              系統監控
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 