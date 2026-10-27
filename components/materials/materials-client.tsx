'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { BookOpen, FileText, Download, Upload, Folder, Plus, Search, Filter } from 'lucide-react'
import UploadMaterialModal from './upload-material-modal'
import MaterialDetailsModal from './material-details-modal'

interface MaterialsClientProps {
  role: string
  materials: any[]
  subjects: any[]
  schoolId: string
  teacherProfileId?: string
}

export default function MaterialsClient({
  role,
  materials,
  subjects,
  schoolId,
  teacherProfileId
}: MaterialsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || material.subject_id === selectedSubject
    const matchesType = selectedType === 'all' || material.material_type === selectedType
    return matchesSearch && matchesSubject && matchesType
  })

  // Group materials by subject
  const materialsBySubject = subjects.map(subject => ({
    subject,
    materials: filteredMaterials.filter(m => m.subject_id === subject.id)
  })).filter(group => group.materials.length > 0)

  // Calculate statistics
  const stats = {
    total: materials.length,
    byType: {
      document: materials.filter(m => m.material_type === 'document').length,
      presentation: materials.filter(m => m.material_type === 'presentation').length,
      video: materials.filter(m => m.material_type === 'video').length,
      link: materials.filter(m => m.material_type === 'link').length,
      other: materials.filter(m => m.material_type === 'other').length
    }
  }

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5" />
      case 'presentation': return <BookOpen className="h-5 w-5" />
      case 'video': return <FileText className="h-5 w-5" />
      case 'link': return <FileText className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
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

  const handleViewDetails = (material: any) => {
    setSelectedMaterial(material)
    setShowDetailsModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Учебные материалы</h1>
          <p className="text-gray-500 mt-1">
            {role === 'teacher' ? 'Библиотека материалов' : 'Доступные материалы'}
          </p>
        </div>
        {role === 'teacher' && (
          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Загрузить материал
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Всего</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Folder className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Документы</p>
                <p className="text-2xl font-bold">{stats.byType.document}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Презентации</p>
                <p className="text-2xl font-bold">{stats.byType.presentation}</p>
              </div>
              <BookOpen className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Видео</p>
                <p className="text-2xl font-bold">{stats.byType.video}</p>
              </div>
              <FileText className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ссылки</p>
                <p className="text-2xl font-bold">{stats.byType.link}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Другое</p>
                <p className="text-2xl font-bold">{stats.byType.other}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск материалов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все предметы</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все типы</option>
              <option value="document">Документы</option>
              <option value="presentation">Презентации</option>
              <option value="video">Видео</option>
              <option value="link">Ссылки</option>
              <option value="other">Другое</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Materials by subject */}
      {materialsBySubject.map(({ subject, materials: subjectMaterials }) => (
        <Card key={subject.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {subject.name}
              <Badge variant="default" className="ml-2">
                {subjectMaterials.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectMaterials.map(material => (
                <div
                  key={material.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(material)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {getMaterialTypeIcon(material.material_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 truncate">
                        {material.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {material.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="text-xs">
                          {getMaterialTypeName(material.material_type)}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatDate(material.created_at, 'short')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredMaterials.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Folder className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">
                {searchQuery || selectedSubject !== 'all' || selectedType !== 'all'
                  ? 'Материалы не найдены'
                  : 'Материалов пока нет'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {role === 'teacher' && showUploadModal && (
        <UploadMaterialModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          subjects={subjects}
          teacherProfileId={teacherProfileId!}
          schoolId={schoolId}
        />
      )}

      {showDetailsModal && selectedMaterial && (
        <MaterialDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          material={selectedMaterial}
        />
      )}
    </div>
  )
}
