'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* VAVILON Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">VAVILON</h1>
            <p className="text-sm text-gray-500">
              образование в единой цифровой среде
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Пароль
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          {/* Demo Accounts Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Демо-аккаунты:
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>📧 admin@vavilon.kg (Администратор)</p>
              <p>📧 teacher1@demo.kg (Учитель)</p>
              <p>📧 student1@demo.kg (Ученик)</p>
              <p>📧 parent1@demo.kg (Родитель)</p>
              <p className="mt-2 text-xs opacity-75">Пароль для всех: Demo123!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/80 mt-6">
          © 2026 VAVILON. Все права защищены.
        </p>
      </div>
    </div>
  )
}
