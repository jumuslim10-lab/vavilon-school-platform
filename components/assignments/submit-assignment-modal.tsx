'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SubmitAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: any
  studentProfileId: string
}

export default function SubmitAssignmentModal({
  isOpen,
  onClose,
  assignment,
  studentProfileId
}: SubmitAssignmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [submissionText, setSubmissionText] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])

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
        const filePath = `submissions/${studentProfileId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('school-files')
          .upload(filePath, file)

        if (!uploadError) {
          uploadedFiles.push(filePath)
        }
      }

      // Create submission
      const { error } = await supabase.from('assignment_submissions').insert({
        assignment_id: assignment.id,
        student_profile_id: studentProfileId,
        submission_text: submissionText,
        attachments: uploadedFiles,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })

      if (error) throw error

      // Refresh the page
      window.location.reload()
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Ошибка при сдаче задания')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Сдать задание</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-1">{assignment.title}</h3>
            <p className="text-sm text-gray-600">{assignment.subjects?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ваш ответ</label>
            <textarea
              required
              value={submissionText}
              onChange={e => setSubmissionText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Введите ваш ответ на задание..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Прикрепить файлы</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="submission-file-upload"
              />
              <label htmlFor="submission-file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Нажмите для выбора файлов (опционально)
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

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              После сдачи задания вы не сможете изменить свой ответ.
              Убедитесь, что все правильно заполнено.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                'Сдать задание'
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
