'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Diamond, Star, Sparkles, Crown, Award, Shield, Zap } from 'lucide-react'

export default function SilverDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-silver-elegant">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-metal-chrome relative overflow-hidden">
        <div className="absolute inset-0 bg-silver-pattern opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient-platinum animate-silver-shimmer">
              銀色高質感設計
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              打造極致奢華的視覺體驗
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="premium" className="animate-metal-glow">
                <Diamond className="mr-2 h-5 w-5" />
                頂級體驗
              </Button>
              <Button size="lg" variant="glass">
                <Sparkles className="mr-2 h-5 w-5" />
                奢華質感
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 按鈕展示區 */}
      <section className="py-16 bg-gradient-silver-light relative">
        <div className="absolute inset-0 bg-silver-pattern opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-silver">銀色按鈕系列</h2>
            <p className="text-lg text-gray-700">精緻的漸層設計與金屬質感</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* 預設按鈕 */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">預設樣式</CardTitle>
                <CardDescription>經典銀色漸層</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="default" size="sm">小尺寸</Button>
                <Button variant="default">標準尺寸</Button>
                <Button variant="default" size="lg">大尺寸</Button>
              </CardContent>
            </Card>

            {/* 次要按鈕 */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">次要樣式</CardTitle>
                <CardDescription>輕盈銀色調</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" size="sm">次要小</Button>
                <Button variant="secondary">次要標準</Button>
                <Button variant="secondary" size="lg">次要大</Button>
              </CardContent>
            </Card>

            {/* 頂級按鈕 */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">頂級樣式</CardTitle>
                <CardDescription>鉻金屬質感</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="premium" size="sm">
                  <Crown className="mr-2 h-4 w-4" />
                  頂級小
                </Button>
                <Button variant="premium">
                  <Award className="mr-2 h-4 w-4" />
                  頂級標準
                </Button>
                <Button variant="premium" size="lg">
                  <Shield className="mr-2 h-4 w-4" />
                  頂級大
                </Button>
              </CardContent>
            </Card>

            {/* 玻璃效果 */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">玻璃效果</CardTitle>
                <CardDescription>毛玻璃質感</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="glass" size="sm">透明小</Button>
                <Button variant="glass">透明標準</Button>
                <Button variant="glass" size="lg">透明大</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 卡片展示區 */}
      <section className="py-16 bg-gradient-silver-elegant">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-platinum">銀色卡片系列</h2>
            <p className="text-lg text-gray-700">優雅的容器設計</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 基礎卡片 */}
            <Card className="hover:shadow-silver-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-metal-platinum rounded-lg flex items-center justify-center mb-4 shadow-silver">
                  <Star className="w-6 h-6 text-gray-600" />
                </div>
                <CardTitle>經典設計</CardTitle>
                <CardDescription>銀色漸層背景與精緻陰影</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">採用多層漸層背景，營造深度與質感，配合優雅的銀色調色板。</p>
                <Button variant="default" className="w-full">
                  探索更多
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* 高級卡片 */}
            <Card className="hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-metal-chrome rounded-lg flex items-center justify-center mb-4 shadow-silver animate-metal-glow">
                  <Diamond className="w-6 h-6 text-gray-600" />
                </div>
                <CardTitle>頂級質感</CardTitle>
                <CardDescription>鉻金屬效果與發光動畫</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">結合鉻金屬漸層與動態發光效果，展現最高級的視覺體驗。</p>
                <Button variant="premium" className="w-full">
                  <Crown className="mr-2 h-4 w-4" />
                  頂級體驗
                </Button>
              </CardContent>
            </Card>

            {/* 玻璃卡片 */}
            <Card className="card-glass-silver">
              <CardHeader>
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center mb-4 backdrop-blur-lg border border-white/40">
                  <Sparkles className="w-6 h-6 text-gray-700" />
                </div>
                <CardTitle>玻璃效果</CardTitle>
                <CardDescription>毛玻璃材質與透明感</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">運用毛玻璃效果與半透明設計，創造輕盈優雅的視覺感受。</p>
                <Button variant="glass" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" />
                  透明質感
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 漸層背景展示 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-silver">漸層背景系列</h2>
            <p className="text-lg text-gray-700">多樣化的銀色漸層效果</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 經典銀色 */}
            <div className="h-32 rounded-xl bg-gradient-silver-light flex items-center justify-center shadow-silver">
              <span className="text-gray-800 font-semibold">經典銀色</span>
            </div>

            {/* 鉻金屬 */}
            <div className="h-32 rounded-xl bg-gradient-metal-chrome flex items-center justify-center shadow-silver">
              <span className="text-gray-800 font-semibold">鉻金屬</span>
            </div>

            {/* 鉑金效果 */}
            <div className="h-32 rounded-xl bg-gradient-metal-platinum flex items-center justify-center shadow-silver">
              <span className="text-gray-800 font-semibold">鉑金效果</span>
            </div>

            {/* 水晶質感 */}
            <div className="h-32 rounded-xl bg-gradient-silver-crystal flex items-center justify-center shadow-silver">
              <span className="text-gray-800 font-semibold">水晶質感</span>
            </div>
          </div>
        </div>
      </section>

      {/* 動畫效果展示 */}
      <section className="py-16 bg-gradient-metal-titanium relative overflow-hidden">
        <div className="absolute inset-0 bg-silver-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-platinum">動畫效果</h2>
            <p className="text-lg text-gray-300">互動動畫與特效</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* 閃光效果 */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">閃光動畫</CardTitle>
                <CardDescription>流動的光澤效果</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="premium" className="animate-silver-shimmer">
                  <Zap className="mr-2 h-4 w-4" />
                  閃光效果
                </Button>
              </CardContent>
            </Card>

            {/* 發光效果 */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">發光動畫</CardTitle>
                <CardDescription>柔和的光暈效果</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="premium" className="animate-metal-glow">
                  <Star className="mr-2 h-4 w-4" />
                  發光效果
                </Button>
              </CardContent>
            </Card>

            {/* 縮放效果 */}
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">縮放動畫</CardTitle>
                <CardDescription>平滑的尺寸變化</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="premium" className="hover:scale-110 transition-transform">
                  <Crown className="mr-2 h-4 w-4" />
                  縮放效果
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 設計理念 */}
      <section className="py-16 bg-gradient-silver-luxury relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-gradient-platinum">設計理念</h2>
            <p className="text-lg text-gray-700 mb-8">
              銀色高質感設計融合了現代簡約與奢華質感，通過精緻的漸層效果、金屬質感和動畫互動，
              創造出既優雅又現代的視覺體驗。每個元素都經過精心設計，確保在不同設備上都能呈現
              最佳的視覺效果。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-metal-chrome rounded-full flex items-center justify-center mx-auto mb-4 shadow-silver">
                  <Diamond className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gradient-silver">精緻質感</h3>
                <p className="text-gray-600">運用多層漸層和金屬效果</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-metal-platinum rounded-full flex items-center justify-center mx-auto mb-4 shadow-silver">
                  <Sparkles className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gradient-silver">動態效果</h3>
                <p className="text-gray-600">流暢的動畫與互動回饋</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-silver-crystal rounded-full flex items-center justify-center mx-auto mb-4 shadow-silver">
                  <Crown className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gradient-silver">奢華體驗</h3>
                <p className="text-gray-600">頂級的視覺與使用體驗</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 