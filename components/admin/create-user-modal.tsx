'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
}

export default function CreateUserModal({ isOpen, onClose, schoolId }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name
          }
        }
      })

      if (authError) throw authError

      // Create profile and school membership
      if (authData.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email
        })

        await supabase.from('school_memberships').insert({
          user_id: authData.user.id,
          school_id: schoolId,
          role: formData.role,
          is_active: true
        })
      }

      window.location.reload()
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Ошибка при создании пользователя')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Добавить пользователя</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ФИО</label>
            <Input
              required
              value={formData.full_name}
              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Пароль</label>
            <Input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="Минимум 6 символов"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Роль</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Ученик</option>
              <option value="teacher">Учитель</option>
              <option value="parent">Родитель</option>
              <option value="school_admin">Администратор</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                'Создать пользователя'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
