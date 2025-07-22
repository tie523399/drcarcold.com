'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Car, Truck, Globe, Search, Loader2 } from 'lucide-react'

interface VehicleBrand {
  id: string
  name: string
  nameEn: string
  category: string
  logoUrl?: string
}

interface VehicleModel {
  id: string
  brandId: string
  modelName: string
  modelNameEn: string
  year: string
  engineType: string
  refrigerantType: string
  refrigerantAmount: string
  refrigerantOil: string
  notes?: string
  brand: VehicleBrand
}

export default function RefrigerantLookupClient() {
  const t = useTranslations()
  const locale = useLocale()
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<VehicleModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // 載入所有品牌
  useEffect(() => {
    fetch('/api/vehicle-brands')
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(err => console.error('Failed to load brands:', err))
  }, [])

  const handleSearch = async () => {
    if (!selectedBrand && !searchTerm.trim()) {
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      if (selectedBrand) params.append('brandId', selectedBrand)
      if (searchTerm.trim()) params.append('search', searchTerm.trim())

      const response = await fetch(`/api/vehicle-models/search?${params}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    {
      id: 'regular',
      title: t('lookup.category.regular'),
      description: t('lookup.category.regularDesc'),
      icon: Car,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'truck',
      title: t('lookup.category.truck'),
      description: t('lookup.category.truckDesc'),
      icon: Truck,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'malaysia',
      title: t('lookup.category.malaysia'),
      description: t('lookup.category.malaysiaDesc'),
      icon: Globe,
      gradient: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* 分類卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${category.gradient}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.gradient} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  {category.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* 搜尋區域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('lookup.search.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('lookup.search.brand')}</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder={t('lookup.search.brandPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {locale === 'zh' ? brand.name : brand.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('lookup.search.model')}</label>
              <Input
                placeholder={t('lookup.search.modelPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">Search</label>
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('lookup.search.loading')}
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    {t('lookup.search.button')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 搜尋結果 */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>{t('lookup.results.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">{t('lookup.results.model')}</th>
                      <th className="text-left p-3 font-medium">{t('lookup.results.year')}</th>
                      <th className="text-left p-3 font-medium">{t('lookup.results.engine')}</th>
                      <th className="text-left p-3 font-medium">{t('lookup.results.refrigerant')}</th>
                      <th className="text-left p-3 font-medium">{t('lookup.results.amount')}</th>
                      <th className="text-left p-3 font-medium">{t('lookup.results.oil')}</th>
                      <th className="text-left p-3 font-medium">{t('lookup.results.notes')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((model) => (
                      <tr key={model.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">
                              {locale === 'zh' ? model.modelName : model.modelNameEn}
                            </div>
                            <div className="text-sm text-gray-500">
                              {locale === 'zh' ? model.brand.name : model.brand.nameEn}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{model.year}</td>
                        <td className="p-3">{model.engineType}</td>
                        <td className="p-3">
                          <Badge variant="outline">{model.refrigerantType}</Badge>
                        </td>
                        <td className="p-3 font-medium">{model.refrigerantAmount}</td>
                        <td className="p-3">{model.refrigerantOil}</td>
                        <td className="p-3">{model.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t('lookup.noResults')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
