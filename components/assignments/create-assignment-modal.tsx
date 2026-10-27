'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  teacherProfileId: string
  schoolId: string
}

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  teacherProfileId,
  schoolId
}: CreateAssignmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    due_date: '',
    max_grade: '5',
    status: 'draft'
  })
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [attachments, setAttachments] = useState<File[]>([])

  // Load classes and subjects on mount
  useState(() => {
    const loadData = async () => {
      const supabase = createClient()

      // Get teacher assignments to find classes
      const { data: assignments } = await supabase
        .from('teacher_assignments')
        .select('*, classes(*), subjects(*)')
        .eq('teacher_profile_id', teacherProfileId)

      if (assignments) {
        const uniqueClasses = Array.from(
          new Map(assignments.map(a => [a.classes.id, a.classes])).values()
        )
        const uniqueSubjects = Array.from(
          new Map(assignments.map(a => [a.subjects.id, a.subjects])).values()
        )
        setClasses(uniqueClasses)
        setSubjects(uniqueSubjects)
      }
    }
    loadData()
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Upload attachments first
      const uploadedFiles: string[] = []
      for (const file of attachments) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `assignments/${teacherProfileId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('school-files')
          .upload(filePath, file)

        if (!uploadError) {
          uploadedFiles.push(filePath)
        }
      }

      // Create assignment
      const { error } = await supabase.from('assignments').insert({
        ...formData,
        teacher_profile_id: teacherProfileId,
        attachments: uploadedFiles,
        max_grade: parseInt(formData.max_grade)
      })

      if (error) throw error

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error('Error creating assignment:', error)
      alert('Ошибка при создании задания')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Создать задание</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <Input
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название задания"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Опишите задание подробно"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Класс</label>
              <select
                required
                value={formData.class_id}
                onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите класс</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Предмет</label>
              <select
                required
                value={formData.subject_id}
                onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите предмет</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Срок сдачи</label>
              <Input
                type="date"
                required
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Макс. балл</label>
              <Input
                type="number"
                required
                min="1"
                max="100"
                value={formData.max_grade}
                onChange={e => setFormData({ ...formData, max_grade: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Прикрепить файлы</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Нажмите для выбора файлов
                </p>
              </label>
              {attachments.length > 0 && (
                <div className="mt-2 text-left">
                  <p className="text-xs text-gray-500 mb-1">Выбрано файлов: {attachments.length}</p>
                  {attachments.map((file, i) => (
                    <p key={i} className="text-xs text-gray-600">{file.name}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Статус</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликовать</option>
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
                'Создать задание'
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
