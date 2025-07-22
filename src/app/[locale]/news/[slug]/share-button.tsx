'use client'

import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface ShareButtonProps {
  title: string
  excerpt: string
  locale: string
}

export default function ShareButton({ title, excerpt, locale }: ShareButtonProps) {
  const t = useTranslations()

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: excerpt,
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert(t('news.linkCopied'))
      }).catch(() => {
        alert('無法複製連結')
      })
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
    >
      {t('news.copyLink')}
    </Button>
  )
} 