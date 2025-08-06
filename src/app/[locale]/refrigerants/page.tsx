import { Metadata } from 'next'
import RefrigerantsClient from './refrigerants-client'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isZh = params.locale === 'zh'
  
  return {
    title: isZh ? 'DrCarCold 汽車冷媒產品 | R134a R1234yf R32 專業供應' : 'DrCarCold Automotive Refrigerants | R134a R1234yf R32 Professional Supply',
    description: isZh ? '【DrCarCold】專業汽車冷媒供應商，提供R134a、R1234yf、R32等各類冷媒產品。原廠品質，全馬配送，技術支援，價格優惠。' : 'DrCarCold professional automotive refrigerant supplier, providing R134a, R1234yf, R32 and other refrigerant products with original quality and technical support.',
    keywords: isZh ? '汽車冷媒,R134a,R1234yf,R32,冷媒供應,汽車空調,冷媒價格,技術支援' : 'automotive refrigerant,R134a,R1234yf,R32,refrigerant supply,car air conditioning,refrigerant price,technical support',
    openGraph: {
      title: isZh ? 'DrCarCold 汽車冷媒產品專業供應' : 'DrCarCold Automotive Refrigerants Professional Supply',
      description: isZh ? '專業汽車冷媒供應商，原廠品質，技術支援' : 'Professional automotive refrigerant supplier with original quality and technical support',
      type: 'website',
      locale: isZh ? 'zh_TW' : 'en_US',
    },
  }
}

export default function RefrigerantsPage({ params }: Props) {
  return <RefrigerantsClient locale={params.locale} />
}