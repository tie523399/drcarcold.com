'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 可選：將錯誤記錄到錯誤報告服務
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold">發生錯誤</h2>
      <p className="text-gray-600">抱歉，處理您的請求時發生錯誤。</p>
      <Button
        onClick={() => reset()}
        variant="default"
      >
        重試
      </Button>
    </div>
  )
}
