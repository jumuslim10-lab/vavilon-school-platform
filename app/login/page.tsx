'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Неверный email или пароль')
        setLoading(false)
        return
      }

      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Произошла ошибка при входе')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-hover))] p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-[var(--shadow-xl)]">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-[rgb(var(--color-accent))] flex items-center justify-center shadow-[var(--shadow-md)]">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h1 className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))] tracking-[var(--letter-spacing-tight)]">
              VAVILON
            </h1>
            <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">
              Образование в единой цифровой среде
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-[var(--font-size-sm)] font-medium text-[rgb(var(--color-text-primary))]">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vavilon.kg"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-[var(--font-size-sm)] font-medium text-[rgb(var(--color-text-primary))]">
                  Пароль
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-[var(--font-size-sm)] text-[rgb(var(--color-error))] bg-[rgb(var(--color-error-light))] border border-[rgb(var(--color-error))]/20 p-3 rounded-[var(--radius-md)]">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-[var(--font-size-base)]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Вход...
                  </div>
                ) : (
                  'Войти'
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-[rgb(var(--color-surface-hover))] rounded-[var(--radius-md)] border border-[rgb(var(--color-border-subtle))]">
              <p className="text-[var(--font-size-xs)] font-semibold text-[rgb(var(--color-text-primary))] mb-3">
                Демо-аккаунты:
              </p>
              <div className="space-y-2 text-[var(--font-size-xs)] text-[rgb(var(--color-text-secondary))]">
                <p>📧 admin@vavilon.kg</p>
                <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mt-2 pt-2 border-t border-[rgb(var(--color-border-subtle))]">
                  Пароль для всех: Demo123!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[var(--font-size-sm)] text-white/90 mt-6">
          © 2026 VAVILON. Все права защищены.
        </p>
      </div>
    </div>
  )
}
