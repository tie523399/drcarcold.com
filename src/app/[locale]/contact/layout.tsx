import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '聯絡我們 | 車冷博士汽車冷媒',
  description: '聯絡車冷博士獲取汽車冷媒報價。電話：04-26301915，地址：台中市龍井區臨港東路二段100號。提供R134a、R1234yf冷媒及各式汽車冷媒設備批發服務。',
  keywords: [
    '汽車冷媒聯絡',
    '車冷博士電話',
    '汽車冷媒報價',
    '台中汽車冷媒',
    '龍井汽車冷媒',
    '冷媒批發電話',
    '汽車冷媒地址',
    '冷媒供應商聯絡'
  ],
  openGraph: {
    title: '聯絡車冷博士 | 汽車冷媒供應商',
    description: '立即聯絡我們獲取汽車冷媒及設備報價',
    images: ['/contact-og.jpg'],
  },
  alternates: {
    canonical: 'https://drcarcold.com/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 