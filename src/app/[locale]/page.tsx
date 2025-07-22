'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MediaCarousel } from '@/components/ui/media-carousel'
import { LatestArticles } from '@/components/home/latest-articles'
import { ArrowRight, Package, Wrench, Users } from 'lucide-react'

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const [banners, setBanners] = useState<any[]>([])
  
  // 獲取橫幅數據
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners?position=homepage')
        const data = await response.json()
        setBanners(data.filter((banner: any) => banner.isActive))
      } catch (error) {
        console.error('Error fetching banners:', error)
      }
    }
    
    fetchBanners()
  }, [])

  const [features, setFeatures] = useState<any[]>([])
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true)
  
  // 獲取功能特點
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/api/features?position=homepage')
        const data = await response.json()
        
        // 將圖標名稱對應到實際的圖標組件
        const iconMap: { [key: string]: any } = {
          'Package': Package,
          'Wrench': Wrench,
          'Users': Users,
        }
        
        const formattedFeatures = data.map((feature: any) => ({
          icon: iconMap[feature.icon] || Package,
          title: locale === 'zh' ? feature.title : feature.titleEn,
          description: locale === 'zh' ? feature.description : feature.descriptionEn,
        }))
        
        setFeatures(formattedFeatures)
      } catch (error) {
        console.error('Error fetching features:', error)
        // 使用預設值
        setFeatures([
    {
      icon: Package,
      title: t('home.feature.equipment'),
      description: t('home.feature.equipmentDesc'),
    },
    {
      icon: Wrench,
      title: t('home.feature.support'),
      description: t('home.feature.supportDesc'),
    },
    {
      icon: Users,
      title: t('home.feature.customer'),
      description: t('home.feature.customerDesc'),
    },
        ])
      } finally {
        setIsLoadingFeatures(false)
      }
    }
    
    fetchFeatures()
  }, [locale, t])

  const categories = [
    {
      title: t('home.lookup.regular'),
      description: t('home.lookup.regularDesc'),
      href: `/${locale}/refrigerant-lookup?category=regular`,
    },
    {
      title: t('home.lookup.truck'),
      description: t('home.lookup.truckDesc'),
      href: `/${locale}/refrigerant-lookup?category=truck`,
    },
    {
      title: t('home.lookup.malaysia'),
      description: t('home.lookup.malaysiaDesc'),
      href: `/${locale}/refrigerant-lookup?category=malaysia`,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      {banners.length > 0 && (
        <section className="relative">
          <MediaCarousel
            items={banners.map(banner => ({
              id: banner.id,
              image: banner.image,
              thumbnail: banner.thumbnail,
              title: banner.title,
              description: banner.description,
              link: banner.link,
              mediaType: banner.mediaType || 'image'
            }))}
            autoPlay={true}
            showIndicators={true}
          />
        </section>
      )}
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeInUp">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="w-full sm:w-auto">
                  {t('home.hero.cta.products')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 hover:bg-white/20">
                  {t('home.hero.cta.contact')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <LatestArticles locale={locale} />

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.why.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.why.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Refrigerant Lookup Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.lookup.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.lookup.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.title} href={category.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-primary flex items-center hover:underline">
                      {t('home.lookup.cta')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            {t('home.cta.subtitle')}
          </p>
          <Link href={`/${locale}/contact`}>
            <Button size="lg" variant="secondary">
              {t('home.cta.button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
} 