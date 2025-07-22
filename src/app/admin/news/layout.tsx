import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新聞管理 - 車冷博士',
  description: '管理新聞文章',
}

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 