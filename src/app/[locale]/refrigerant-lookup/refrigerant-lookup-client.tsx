'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Thermometer, Droplets, Settings, Car, Calendar, Database } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface VehicleModel {
  id: string
  // 品牌資訊
  brand: string
  brandEn: string
  brandCategory: string
  
  // 車輛基本資訊
  model: string
  year?: string
  engine?: string
  category?: string
  
  // 冷媒資訊
  refrigerantType: string
  refrigerantAmount: string
  
  // 冷凍油資訊
  oilType?: string
  oilAmount?: string
  
  // 額外資訊
  notes?: string
  
  // 向後兼容字段
  modelName?: string
  engineType?: string
  fillAmount?: string
}

interface Brand {
  id: string
  name: string
  nameEn: string
  category: string
  modelCount: number
}

interface RefrigerantData {
  data: VehicleModel[]
  brands: Brand[]
  total: number
}

interface RefrigerantLookupClientProps {
  locale: string
}

export default function RefrigerantLookupClient({ locale }: RefrigerantLookupClientProps) {
  const isZh = locale === 'zh'
  const t = useTranslations('lookup')
  
  // 狀態管理
  const [data, setData] = useState<RefrigerantData>({ data: [], brands: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [currentLanguage, setCurrentLanguage] = useState<'zh' | 'en'>(isZh ? 'zh' : 'en')
  
  // 搜尋條件
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [searchModel, setSearchModel] = useState<string>('')
  const [searchYear, setSearchYear] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedRefrigerant, setSelectedRefrigerant] = useState<string>('')

  // 載入數據
  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedBrand) params.append('brandName', selectedBrand)
      if (searchModel) params.append('modelName', searchModel)
      if (searchYear) params.append('year', searchYear)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedRefrigerant) params.append('refrigerant', selectedRefrigerant)
      
      // 添加語言參數
      params.append('language', currentLanguage)
      
      const response = await fetch(`/api/refrigerant-lookup?${params.toString()}`)
      if (!response.ok) throw new Error('載入數據失敗')
      
      const result = await response.json()
      setData(result)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  // 初始載入 (加入語言切換觸發)
  useEffect(() => {
    fetchData()
  }, [selectedBrand, searchModel, searchYear, selectedCategory, selectedRefrigerant, currentLanguage])
  
  // 語言切換函數
  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'zh' ? 'en' : 'zh')
  }

  // 過濾品牌選項（基於類別）
  const filteredBrands = useMemo(() => {
    if (!selectedCategory) return data.brands
    return data.brands.filter(brand => brand.category === selectedCategory)
  }, [data.brands, selectedCategory])

  // 重置搜尋
  const resetSearch = () => {
    setSelectedBrand('')
    setSearchModel('')
    setSearchYear('')
    setSelectedCategory('')
    setSelectedRefrigerant('')
  }

  // 獲取唯一的冷媒類型
  const refrigerantTypes = useMemo(() => {
    const types = new Set<string>()
    data.data.forEach(vehicle => {
      if (vehicle.refrigerantType) {
        types.add(vehicle.refrigerantType)
      }
    })
    return Array.from(types).sort()
  }, [data.data])

  // 品牌類別選項
  const categoryOptions = [
    { value: 'REGULAR', label: t('category.regular') },
    { value: 'LUXURY', label: t('category.luxury') },
    { value: 'JAPANESE', label: t('category.japanese') },
    { value: 'KOREAN', label: t('category.korean') },
    { value: 'AMERICAN', label: t('category.american') },
    { value: 'EUROPEAN', label: t('category.european') }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 標題 */}
      <div className="text-center mb-8 relative">
        {/* 語言切換按鈕 */}
        <div className="absolute top-0 right-0">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <span className="text-sm font-medium">
              {currentLanguage === 'zh' ? t('language.chinese') : t('language.english')}
            </span>
            <span className="text-xs">
              {t('language.switchTo')} {currentLanguage === 'zh' ? t('language.english') : t('language.chinese')}
            </span>
          </button>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Thermometer className="h-10 w-10 text-blue-600" />
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {t('description')}
        </p>
      </div>

      {/* 搜尋界面 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Search className="h-6 w-6 text-blue-600" />
          {t('search.smartSearch')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* 品牌類別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('search.brandCategory')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedBrand('') // 重置品牌選擇
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('search.allCategories')}</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 品牌選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('search.selectBrand')}
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('search.allBrands')}</option>
              {filteredBrands.map(brand => (
                <option key={brand.id} value={brand.name}>
                  {brand.name} ({brand.modelCount} {t('results.model')})
                </option>
              ))}
            </select>
          </div>

          {/* 車型搜尋 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isZh ? '車型名稱' : 'Model Name'}
            </label>
            <input
              type="text"
              value={searchModel}
              onChange={(e) => setSearchModel(e.target.value)}
              placeholder={isZh ? '輸入車型名稱...' : 'Enter model name...'}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 年份搜尋 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isZh ? '年份' : 'Year'}
            </label>
            <input
              type="text"
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              placeholder={isZh ? '例如: 2020 或 2015-2020' : 'e.g: 2020 or 2015-2020'}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 冷媒類型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isZh ? '冷媒類型' : 'Refrigerant Type'}
            </label>
            <select
              value={selectedRefrigerant}
              onChange={(e) => setSelectedRefrigerant(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{isZh ? '全部類型' : 'All Types'}</option>
              {refrigerantTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* 重置按鈕 */}
          <div className="flex items-end">
            <button
              onClick={resetSearch}
              className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {isZh ? '重置搜尋' : 'Reset'}
            </button>
          </div>
        </div>

        {/* 搜尋結果統計 */}
        <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              {isZh ? `總計 ${data.total} 條記錄` : `Total ${data.total} records`}
            </span>
            <span className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              {isZh ? `${data.brands.length} 個品牌` : `${data.brands.length} brands`}
            </span>
          </div>
          {(selectedBrand || searchModel || searchYear || selectedCategory || selectedRefrigerant) && (
            <span className="text-blue-600 font-medium">
              {isZh ? '已套用篩選條件' : 'Filters applied'}
            </span>
          )}
        </div>
      </div>

      {/* 載入狀態 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-blue-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg">{isZh ? '載入中...' : 'Loading...'}</span>
          </div>
        </div>
      )}

      {/* 錯誤狀態 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          ❌ {error}
        </div>
      )}

      {/* 結果列表 */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              {isZh ? '冷媒充填資訊' : 'Refrigerant Fill Information'}
            </h3>
          </div>

          {data.data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{isZh ? '未找到符合條件的車型' : 'No vehicles found matching your criteria'}</p>
              <p className="text-sm mt-2">{isZh ? '請調整搜尋條件或' : 'Please adjust your search criteria or'} 
                <button onClick={resetSearch} className="text-blue-600 hover:underline ml-1">
                  {isZh ? '重置搜尋' : 'reset search'}
                </button>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.brand')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.model')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.year')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.engine')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.refrigerantType')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.refrigerantAmount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.oilType')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.oilAmount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('results.notes')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((vehicle, index) => (
                    <tr key={vehicle.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {isZh ? vehicle.brand : vehicle.brandEn}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {vehicle.model}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {vehicle.year || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {vehicle.engine || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vehicle.refrigerantType.includes('R-1234yf') || vehicle.refrigerantType.includes('R1234yf')
                            ? 'bg-green-100 text-green-800'
                            : vehicle.refrigerantType.includes('R134a')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vehicle.refrigerantType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vehicle.refrigerantAmount || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.oilType || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.oilAmount || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 max-w-xs">
                          {vehicle.notes || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 免責聲明 */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ {isZh ? 
            '此充填冷媒量僅供參考，正確請以原廠標示為準。實際充填前請確認車輛規格，並由專業技師進行操作。' :
            'This refrigerant fill amount is for reference only. Please refer to manufacturer specifications for accuracy. Always confirm vehicle specifications and have qualified technicians perform the work.'
          }
        </p>
      </div>
    </div>
  )
}