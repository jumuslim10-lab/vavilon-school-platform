'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
}

export default function CreateClassModal({ isOpen, onClose, schoolId }: CreateClassModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    grade: '1',
    section: 'А',
    academic_year: '2026-2027',
    max_students: '30'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('classes').insert({
        school_id: schoolId,
        name: formData.name,
        grade: parseInt(formData.grade),
        section: formData.section,
        academic_year: formData.academic_year,
        max_students: parseInt(formData.max_students)
      })

      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Ошибка при создании класса')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Добавить класс</h2>
          <button onClick={onClose}><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="1-А" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Класс</label>
              <Input type="number" min="1" max="11" required value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Секция</label>
              <Input required value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Учебный год</label>
            <Input required value={formData.academic_year} onChange={e => setFormData({ ...formData, academic_year: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Макс. учеников</label>
            <Input type="number" min="1" required value={formData.max_students} onChange={e => setFormData({ ...formData, max_students: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Создание...</> : 'Создать'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
