'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-red-600">Критическая ошибка</h2>
              <p className="text-gray-600">
                Приложение столкнулось с критической ошибкой. Попробуйте перезагрузить страницу.
              </p>
            </div>
            <Button
              onClick={reset}
              className="w-full"
            >
              Перезагрузить приложение
            </Button>
          </Card>
        </div>
      </body>
    </html>
  )
}
