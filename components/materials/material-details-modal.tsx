'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { X, Download, FileText, BookOpen, User } from 'lucide-react'

interface MaterialDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  material: any
}

export default function MaterialDetailsModal({
  isOpen,
  onClose,
  material
}: MaterialDetailsModalProps) {
  if (!isOpen) return null

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-6 w-6" />
      case 'presentation': return <BookOpen className="h-6 w-6" />
      case 'video': return <FileText className="h-6 w-6" />
      case 'link': return <FileText className="h-6 w-6" />
      default: return <FileText className="h-6 w-6" />
    }
  }

  const getMaterialTypeName = (type: string) => {
    switch (type) {
      case 'document': return 'Документ'
      case 'presentation': return 'Презентация'
      case 'video': return 'Видео'
      case 'link': return 'Ссылка'
      default: return 'Другое'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{material.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Material icon and type */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              {getMaterialTypeIcon(material.material_type)}
            </div>
            <div>
              <Badge variant="default">
                {getMaterialTypeName(material.material_type)}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {material.subjects?.name}
              </p>
            </div>
          </div>

          {/* Description */}
          {material.description && (
            <div>
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-gray-700">{material.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Загружено</span>
              <span className="font-medium">
                {formatDate(material.created_at, 'long')}
              </span>
            </div>

            {material.teacher_profiles?.profiles && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Автор</span>
                <span className="font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {material.teacher_profiles.profiles.full_name}
                </span>
              </div>
            )}
          </div>

          {/* File or link */}
          {material.material_type === 'link' && material.external_url && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Внешняя ссылка:</p>
              <a
                href={material.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {material.external_url}
              </a>
            </div>
          )}

          {material.file_path && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">
                  {material.file_path.split('/').pop()}
                </span>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Скачать
              </Button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3">
          {material.material_type === 'link' && material.external_url && (
            <Button
              className="flex-1"
              onClick={() => window.open(material.external_url, '_blank')}
            >
              Открыть ссылку
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  )
}
