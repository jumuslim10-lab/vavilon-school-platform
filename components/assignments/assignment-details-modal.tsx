'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { X, Download, Calendar, FileText, User } from 'lucide-react'

interface AssignmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  assignment: any
  submission: any
  role: string
}

export default function AssignmentDetailsModal({
  isOpen,
  onClose,
  assignment,
  submission,
  role
}: AssignmentDetailsModalProps) {
  if (!isOpen) return null

  const isOverdue = new Date(assignment.due_date) < new Date()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{assignment.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status badges */}
          <div className="flex items-center gap-2">
            <Badge variant={assignment.status === 'published' ? 'success' : 'default'}>
              {assignment.status === 'published' ? 'Опубликовано' : 'Черновик'}
            </Badge>
            {role === 'student' && submission && (
              <Badge variant={submission.status === 'graded' ? 'success' : 'info'}>
                {submission.status === 'graded' ? 'Проверено' : 'На проверке'}
              </Badge>
            )}
            {role === 'student' && !submission && isOverdue && (
              <Badge variant="error">Просрочено</Badge>
            )}
          </div>

          {/* Assignment info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Срок сдачи: {formatDate(assignment.due_date, 'long')}</span>
            </div>

            {role === 'teacher' && assignment.classes && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Класс: {assignment.classes.name}</span>
              </div>
            )}

            {role === 'student' && assignment.subjects && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>Предмет: {assignment.subjects.name}</span>
              </div>
            )}

            {assignment.max_grade && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>Максимальный балл: {assignment.max_grade}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Описание</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
          </div>

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Прикрепленные файлы</h3>
              <div className="space-y-2">
                {assignment.attachments.map((file: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.split('/').pop()}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Скачать
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student submission info */}
          {role === 'student' && submission && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Моя работа</h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Дата сдачи</span>
                  <span className="text-sm font-medium">
                    {formatDate(submission.submitted_at, 'long')}
                  </span>
                </div>

                {submission.status === 'graded' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Оценка</span>
                      <span className="text-lg font-bold text-green-600">
                        {submission.grade} из {assignment.max_grade}
                      </span>
                    </div>
                    {submission.feedback && (
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Комментарий преподавателя:</p>
                        <p className="text-sm">{submission.feedback}</p>
                      </div>
                    )}
                  </>
                )}

                {submission.submission_text && (
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Ваш ответ:</p>
                    <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                  </div>
                )}

                {submission.attachments && submission.attachments.length > 0 && (
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Прикрепленные файлы:</p>
                    <div className="space-y-1">
                      {submission.attachments.map((file: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <FileText className="h-3 w-3 text-gray-500" />
                          <span>{file.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
          <Button onClick={onClose} className="w-full">
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  )
}
