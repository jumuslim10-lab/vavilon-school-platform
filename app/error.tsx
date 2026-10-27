'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full p-6 space-y-4">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold text-red-600">Произошла ошибка</h2>
          <p className="text-gray-600">
            Что-то пошло не так. Попробуйте обновить страницу.
          </p>
          {error.message && (
            <p className="text-sm text-gray-500 mt-2">
              Детали: {error.message}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={reset}
            className="flex-1"
          >
            Попробовать снова
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1"
          >
            На главную
          </Button>
        </div>
      </Card>
    </div>
  )
}
