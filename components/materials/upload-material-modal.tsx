'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UploadMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  subjects: any[]
  teacherProfileId: string
  schoolId: string
}

export default function UploadMaterialModal({
  isOpen,
  onClose,
  subjects,
  teacherProfileId,
  schoolId
}: UploadMaterialModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    material_type: 'document',
    external_url: ''
  })
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      let filePath = null

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const uploadPath = `materials/${schoolId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('school-files')
          .upload(uploadPath, file)

        if (uploadError) throw uploadError
        filePath = uploadPath
      }

      // Create material record
      const { error } = await supabase.from('learning_materials').insert({
        ...formData,
        school_id: schoolId,
        uploaded_by: teacherProfileId,
        file_path: filePath
      })

      if (error) throw error

      window.location.reload()
    } catch (error) {
      console.error('Error uploading material:', error)
      alert('Ошибка при загрузке материала')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Загрузить материал</h2>
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
              placeholder="Введите название материала"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Краткое описание материала"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Предмет</label>
              <select
                required
                value={formData.subject_id}
                onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите предмет</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Тип материала</label>
              <select
                value={formData.material_type}
                onChange={e => setFormData({ ...formData, material_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="document">Документ</option>
                <option value="presentation">Презентация</option>
                <option value="video">Видео</option>
                <option value="link">Ссылка</option>
                <option value="other">Другое</option>
              </select>
            </div>
          </div>

          {formData.material_type === 'link' ? (
            <div>
              <label className="block text-sm font-medium mb-1">Внешняя ссылка</label>
              <Input
                type="url"
                required
                value={formData.external_url}
                onChange={e => setFormData({ ...formData, external_url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Файл</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="material-file-upload"
                />
                <label htmlFor="material-file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Нажмите для выбора файла
                  </p>
                </label>
                {file && (
                  <p className="text-xs text-gray-600 mt-2">{file.name}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                'Загрузить'
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
