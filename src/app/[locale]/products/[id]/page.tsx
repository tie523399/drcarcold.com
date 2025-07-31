'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SmartContactButton } from '@/components/ui/smart-contact-button'
import { ArrowLeft, Package, ShoppingCart, Phone } from 'lucide-react'

interface Product {
  id: string
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  details?: string
  price: number
  stock: number
  categoryId: string
  category?: {
    name: string
    nameEn?: string
  }
  images: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale() as 'zh' | 'en'
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (!response.ok) {
        throw new Error('Product not found')
      }
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push(`/${locale}/products`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const productName = locale === 'zh' ? product.name : (product.nameEn || product.name)
  const productDescription = locale === 'zh' ? product.description : (product.descriptionEn || product.description)
  const categoryName = product.category ? 
    (locale === 'zh' ? product.category.name : (product.category.nameEn || product.category.name)) : ''

  const images = product.images && product.images.length > 0 ? product.images : ['/images/product-placeholder.svg']

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 返回按鈕 */}
      <Link href={`/${locale}/products`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 圖片區域 */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={images[selectedImage]}
              alt={productName}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/images/product-placeholder.svg'
              }}
            />
          </div>
          
          {/* 圖片縮圖 */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/images/product-placeholder.svg'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 產品資訊 */}
        <div className="space-y-6">
          <div>
            {categoryName && (
              <Badge variant="secondary" className="mb-2">
                {categoryName}
              </Badge>
            )}
            <h1 className="text-3xl font-bold mb-4">{productName}</h1>
            
            {/* 價格和庫存 */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold text-primary">
                NT$ {product.price.toLocaleString()}
              </div>
              <Badge variant={product.stock > 0 ? 'default' : 'secondary'}>
                {product.stock > 0 ? t('products.inStock') : t('products.outOfStock')}
              </Badge>
            </div>

            {/* 描述 */}
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap">{productDescription}</p>
            </div>

            {/* 產品詳情 */}
            {product.details && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">{locale === 'zh' ? '產品詳情' : 'Product Details'}</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-wrap">{product.details}</p>
                </div>
              </div>
            )}
          </div>

          {/* 行動按鈕 */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">{t('products.orderInfo')}</h3>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="h-5 w-5" />
                  <span>{t('products.wholesale')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-5 w-5" />
                  <span>{t('products.contactForOrder')}</span>
                </div>

                <SmartContactButton 
                  productName={productName}
                  className="w-full" 
                  size="lg"
                  variant="premium"
                >
                  {locale === 'zh' ? '聯絡我們' : t('products.contactUs')}
                </SmartContactButton>
              </div>
            </CardContent>
          </Card>

          {/* 產品編號 */}
          <div className="text-sm text-gray-500">
            {t('products.productId')}: {product.id}
          </div>
        </div>
      </div>
    </div>
  )
} 