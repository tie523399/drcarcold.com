'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslations, useLocale } from 'next-intl'
import { Search, Package, ShoppingCart, DollarSign } from 'lucide-react'
import Script from 'next/script'

export default function ProductList() {
  const t = useTranslations()
  const locale = useLocale() as 'zh' | 'en'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 動態獲取的分類資料
  const [categories, setCategories] = useState<any[]>([
    { id: 'all', name: t('products.category.all'), slug: 'all' }
  ])

  // 從API獲取產品和分類數據
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 並行獲取產品和分類
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products?active=true'),
          fetch('/api/categories')
        ])
        
        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()
        
        // 處理從資料庫獲取的數據
        const formattedProducts = productsData.map((product: any) => {
          const images = product.images ? JSON.parse(product.images) : []
          const features = product.features ? JSON.parse(product.features) : []
          const specifications = product.specifications ? JSON.parse(product.specifications) : {}
          
          return {
            id: product.id,
            name: { 
              zh: product.name, 
              en: product.nameEn || product.name 
            },
            category: product.category?.slug || 'other-tools',
            price: product.price || '聯絡報價',
            unit: product.unit || '件',
            description: { 
              zh: product.description || '', 
              en: product.descriptionEn || product.description || ''
            },
            image: images[0] || '/images/product-placeholder.svg',
            inStock: product.stock > 0,
            features: {
              zh: features,
              en: features // 如果沒有英文版本，暫時使用中文
            },
            specifications: specifications
          }
        })
        
        setProducts(formattedProducts)
        
        // 設定分類，保留 "all" 選項
        setCategories([
          { id: 'all', name: t('products.category.all'), slug: 'all' },
          ...categoriesData.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          }))
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [t])

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name[locale].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description[locale].toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // 產品列表結構化數據
  const productListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "車冷博士汽車冷媒產品目錄",
    "description": "專業汽車冷媒、冷凍油、充填設備供應商",
    "numberOfItems": filteredProducts.length,
    "itemListElement": filteredProducts.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name.zh,
        "description": product.description.zh,
        "category": categories.find(c => c.slug === product.category)?.name,
        "offers": {
          "@type": "Offer",
          "price": product.price === '聯絡報價' ? undefined : product.price,
          "priceCurrency": "TWD",
          "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "車冷博士"
          }
        }
      }
    }))
  }

  return (
    <>
      <Script
        id="product-list-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListStructuredData) }}
      />
      <div className="min-h-screen bg-gradient-premium py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gradient-silver animate-fadeInUp">
              {t('products.title')}
              <span className="block text-lg mt-2 text-gray-600 font-normal">
                {locale === 'zh' ? '汽車冷媒 | R134a | R1234yf | 冷凍油 | 充填設備' : 'Automotive Refrigerant | R134a | R1234yf | Refrigerant Oil | Filling Equipment'}
              </span>
            </h1>
            <p className="text-xl text-gray-600 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              {t('products.subtitle')}
            </p>
          </div>

          {/* 搜尋和過濾 */}
          <div className="mb-8 flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder={locale === 'zh' ? '搜尋產品...' : t('products.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug || selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.slug || category.id)}
                  className={selectedCategory === category.slug || selectedCategory === category.id ? 'btn-silver' : 'btn-glass'}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 產品列表 */}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{locale === 'zh' ? '載入產品中...' : 'Loading products...'}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
              <Card key={product.id} className="card-glass overflow-hidden">
                <div className="aspect-square bg-gray-200 relative">
                  <Image
                    src={product.image}
                    alt={product.name[locale]}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/product-placeholder.svg';
                    }}
                  />
                  {product.inStock && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm">
                      {locale === 'zh' ? '現貨' : t('products.inStock')}
                    </span>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name[locale]}</CardTitle>
                  <CardDescription>{product.description[locale]}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{locale === 'zh' ? '價格' : t('products.price')}</span>
                      <span className="text-lg font-bold text-gradient-silver">
                        {product.price === '聯絡報價' 
                          ? (locale === 'zh' ? '聯絡報價' : t('products.contactForPrice'))
                          : `NT$ ${product.price}`
                        }
                        {product.price !== '聯絡報價' && <span className="text-sm font-normal">/{product.unit}</span>}
                      </span>
                    </div>
                    {product.features && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold mb-1">{locale === 'zh' ? '產品特點：' : t('products.features')}</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {product.features[locale].slice(0, 3).map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-primary-500 mr-1">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button className="flex-1 btn-silver">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {locale === 'zh' ? '詢價' : t('products.inquiry')}
                  </Button>
                  <Button variant="outline" className="btn-glass">
                    {locale === 'zh' ? '詳細' : t('products.details')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          )}

          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">
                {locale === 'zh' ? '沒有找到相關產品' : t('products.noProducts')}
              </p>
            </div>
          )}

          {/* SEO 內容區塊 */}
          <div className="mt-16 prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gradient-silver mb-4">
              {locale === 'zh' ? '專業汽車冷媒供應服務' : 'Professional Automotive Refrigerant Supply Service'}
            </h2>
            <p className="text-gray-700 mb-4">
              {locale === 'zh' 
                ? '車冷博士是台中地區最專業的汽車冷媒供應商，我們提供高品質的R134a、R1234yf環保冷媒，以及各式汽車冷凍油、冷媒充填設備。無論您是汽車維修廠、保養廠或個人工作室，我們都能為您提供最優質的產品和服務。'
                : 'Dr. Car Cold is the most professional automotive refrigerant supplier in the Taichung area. We provide high-quality R134a, R1234yf eco-friendly refrigerants, as well as various automotive refrigerant oils and filling equipment. Whether you are an automotive repair shop, maintenance shop or individual workshop, we can provide you with the highest quality products and services.'
              }
            </p>
            <h3 className="text-xl font-semibold mb-2">
              {locale === 'zh' ? '我們的優勢' : 'Our Advantages'}
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              {locale === 'zh' ? (
                <>
                  <li>原廠正品保證：所有汽車冷媒產品均為原廠正品，品質有保障</li>
                  <li>價格優惠：大量採購，提供業界最具競爭力的批發價格</li>
                  <li>庫存充足：常備各式汽車冷媒及相關產品，隨時供應</li>
                  <li>專業諮詢：提供專業的汽車冷媒使用建議和技術支援</li>
                </>
              ) : (
                <>
                  <li>Original Product Guarantee: All automotive refrigerant products are original products with quality assurance</li>
                  <li>Competitive Pricing: Bulk purchasing provides the most competitive wholesale prices in the industry</li>
                  <li>Sufficient Stock: Regular inventory of various automotive refrigerants and related products, available at any time</li>
                  <li>Professional Consultation: Providing professional automotive refrigerant usage advice and technical support</li>
                </>
              )}
            </ul>
            <h3 className="text-xl font-semibold mb-2">
              {locale === 'zh' ? '主要產品類別' : 'Main Product Categories'}
            </h3>
            <p className="text-gray-700">
              {locale === 'zh'
                ? '我們的汽車冷媒產品線涵蓋：環保冷媒（R134a、R1234yf）、冷凍機油（PAG、POE）、冷媒充填設備、快速接頭、冷媒管錶組、以及各式維修工具和耗材。所有產品均經過嚴格品質檢驗，確保符合汽車製造商的規格要求。'
                : 'Our automotive refrigerant product line covers: eco-friendly refrigerants (R134a, R1234yf), refrigerant oils (PAG, POE), refrigerant filling equipment, quick connectors, refrigerant hoses and gauge sets, as well as various maintenance tools and consumables. All products undergo strict quality inspection to ensure compliance with automotive manufacturer specifications.'
              }
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 