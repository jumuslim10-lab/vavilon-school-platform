'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EditSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  subjectData: any
}

export default function EditSubjectModal({ isOpen, onClose, subjectData }: EditSubjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: subjectData.name,
    code: subjectData.code,
    description: subjectData.description || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('subjects').update({
        name: formData.name,
        code: formData.code,
        description: formData.description || null
      }).eq('id', subjectData.id)

      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error('Error updating subject:', error)
      alert('Ошибка при обновлении предмета')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Редактировать предмет</h2>
          <button onClick={onClose}><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Код</label>
            <Input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Сохранение...</> : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
