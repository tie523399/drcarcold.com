import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '系統設定 - 車冷博士',
  description: '管理 API Keys 和自動化功能設定',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 