import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '產品管理 - 車冷博士',
  description: '管理車冷博士的產品資訊',
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 