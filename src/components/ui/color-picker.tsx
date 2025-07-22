'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Palette, Check, Copy, Download } from 'lucide-react'

interface ColorPalette {
  id: string
  name: string
  description: string
  className: string
  category: 'silver' | 'metal' | 'rainbow' | 'cool' | 'warm' | 'dark' | 'special'
  preview: string
}

interface ColorPickerProps {
  onSelect?: (palette: ColorPalette) => void
  selectedPalette?: ColorPalette
  showCategories?: boolean
  showPreview?: boolean
}

const COLOR_PALETTES: ColorPalette[] = [
  // 銀色系列
  {
    id: 'silver-light',
    name: '淺銀色',
    description: '清新淡雅的銀色漸層',
    className: 'bg-gradient-silver-light',
    category: 'silver',
    preview: 'linear-gradient(to right, #f7fafc, #e2e8f0, #cbd5e0)'
  },
  {
    id: 'silver-medium',
    name: '中銀色',
    description: '經典的銀色金屬質感',
    className: 'bg-gradient-silver-medium',
    category: 'silver',
    preview: 'linear-gradient(to right, #cbd5e0, #a0aec0, #718096)'
  },
  {
    id: 'silver-dark',
    name: '深銀色',
    description: '深邃的銀色漸層',
    className: 'bg-gradient-silver-dark',
    category: 'silver',
    preview: 'linear-gradient(to right, #718096, #4a5568, #2d3748)'
  },
  
  // 金屬系列
  {
    id: 'metal-chrome',
    name: '鉻金屬',
    description: '閃亮的鉻金屬效果',
    className: 'bg-gradient-metal-chrome',
    category: 'metal',
    preview: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #d0d0d0, #f0f0f0, #c8c8c8)'
  },
  {
    id: 'metal-steel',
    name: '鋼鐵',
    description: '堅韌的鋼鐵質感',
    className: 'bg-gradient-metal-steel',
    category: 'metal',
    preview: 'linear-gradient(135deg, #4a5568, #718096, #a0aec0, #cbd5e0, #e2e8f0)'
  },
  {
    id: 'metal-titanium',
    name: '鈦金屬',
    description: '現代感的鈦金屬',
    className: 'bg-gradient-metal-titanium',
    category: 'metal',
    preview: 'linear-gradient(135deg, #2d3748, #4a5568, #718096, #a0aec0, #cbd5e0)'
  },
  
  // 彩虹系列
  {
    id: 'rainbow',
    name: '彩虹',
    description: '繽紛的彩虹色彩',
    className: 'bg-gradient-rainbow',
    category: 'rainbow',
    preview: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcf7f, #4d96ff, #9c88ff)'
  },
  {
    id: 'rainbow-subtle',
    name: '淡彩虹',
    description: '柔和的彩虹效果',
    className: 'bg-gradient-rainbow-subtle',
    category: 'rainbow',
    preview: 'linear-gradient(135deg, rgba(255, 107, 107, 0.3), rgba(255, 217, 61, 0.3), rgba(107, 207, 127, 0.3), rgba(77, 150, 255, 0.3), rgba(156, 136, 255, 0.3))'
  },
  
  // 冷色調
  {
    id: 'cool-blue',
    name: '冷藍',
    description: '清涼的藍色漸層',
    className: 'bg-gradient-cool-blue',
    category: 'cool',
    preview: 'linear-gradient(to bottom right, #60a5fa, #3b82f6, #2563eb)'
  },
  {
    id: 'cool-cyan',
    name: '冷青',
    description: '寧靜的青色漸層',
    className: 'bg-gradient-cool-cyan',
    category: 'cool',
    preview: 'linear-gradient(to bottom right, #22d3ee, #06b6d4, #0d9488)'
  },
  {
    id: 'cool-purple',
    name: '冷紫',
    description: '神秘的紫色漸層',
    className: 'bg-gradient-cool-purple',
    category: 'cool',
    preview: 'linear-gradient(to bottom right, #a855f7, #8b5cf6, #4f46e5)'
  },
  
  // 暖色調
  {
    id: 'warm-orange',
    name: '暖橙',
    description: '溫暖的橙色漸層',
    className: 'bg-gradient-warm-orange',
    category: 'warm',
    preview: 'linear-gradient(to bottom right, #fb923c, #f97316, #dc2626)'
  },
  {
    id: 'warm-pink',
    name: '暖粉',
    description: '柔和的粉色漸層',
    className: 'bg-gradient-warm-pink',
    category: 'warm',
    preview: 'linear-gradient(to bottom right, #f472b6, #ec4899, #f43f5e)'
  },
  {
    id: 'warm-yellow',
    name: '暖黃',
    description: '陽光般的黃色漸層',
    className: 'bg-gradient-warm-yellow',
    category: 'warm',
    preview: 'linear-gradient(to bottom right, #fbbf24, #f59e0b, #f97316)'
  },
  
  // 特殊效果
  {
    id: 'holographic',
    name: '全息',
    description: '炫彩的全息效果',
    className: 'bg-gradient-holographic',
    category: 'special',
    preview: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe)'
  },
  {
    id: 'neon',
    name: '霓虹',
    description: '明亮的霓虹效果',
    className: 'bg-gradient-neon',
    category: 'special',
    preview: 'linear-gradient(135deg, #00f5ff, #00d4ff, #0099ff, #0066ff, #0033ff)'
  },
  {
    id: 'sunset',
    name: '日落',
    description: '溫馨的日落色彩',
    className: 'bg-gradient-sunset',
    category: 'special',
    preview: 'linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef, #fad0c4, #fad0c4)'
  },
  {
    id: 'ocean',
    name: '海洋',
    description: '深邃的海洋色彩',
    className: 'bg-gradient-ocean',
    category: 'special',
    preview: 'linear-gradient(135deg, #667db6, #0082c8, #0078cf, #26d0ce, #1a2a6c)'
  }
]

const CATEGORY_LABELS = {
  silver: '銀色系',
  metal: '金屬系',
  rainbow: '彩虹系',
  cool: '冷色調',
  warm: '暖色調',
  dark: '深色系',
  special: '特殊效果'
}

export default function ColorPicker({
  onSelect,
  selectedPalette,
  showCategories = true,
  showPreview = true
}: ColorPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredPalettes = selectedCategory
    ? COLOR_PALETTES.filter(p => p.category === selectedCategory)
    : COLOR_PALETTES

  const handleCopyCSS = async (palette: ColorPalette) => {
    try {
      await navigator.clipboard.writeText(`.${palette.className} { background: ${palette.preview}; }`)
      setCopiedId(palette.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy CSS:', error)
    }
  }

  const handleExportPalette = () => {
    const cssContent = COLOR_PALETTES.map(palette => 
      `.${palette.className} {\n  background: ${palette.preview};\n}`
    ).join('\n\n')
    
    const blob = new Blob([cssContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'color-palettes.css'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              調色盤選擇器
            </CardTitle>
            <CardDescription>
              選擇您喜歡的漸層效果，點擊可預覽和複製 CSS 代碼
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPalette}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            匯出 CSS
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 類別篩選 */}
        {showCategories && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              全部
            </Button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        )}

        {/* 調色盤網格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPalettes.map((palette) => (
            <Card
              key={palette.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPalette?.id === palette.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelect?.(palette)}
            >
              <CardContent className="p-4">
                {/* 漸層預覽 */}
                <div
                  className="w-full h-20 rounded-lg mb-3 shadow-inner"
                  style={{ background: palette.preview }}
                >
                  {selectedPalette?.id === palette.id && (
                    <div className="flex items-center justify-center h-full">
                      <Check className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
                
                {/* 調色盤信息 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{palette.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[palette.category]}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{palette.description}</p>
                  
                  {/* 操作按鈕 */}
                  <div className="flex items-center gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyCSS(palette)
                      }}
                    >
                      {copiedId === palette.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 預覽區域 */}
        {showPreview && selectedPalette && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">預覽效果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="w-full h-32 rounded-lg shadow-lg"
                  style={{ background: selectedPalette.preview }}
                />
                <div className="space-y-2">
                  <h4 className="font-medium">{selectedPalette.name}</h4>
                  <p className="text-sm text-gray-600">{selectedPalette.description}</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {selectedPalette.className}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCSS(selectedPalette)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
} 