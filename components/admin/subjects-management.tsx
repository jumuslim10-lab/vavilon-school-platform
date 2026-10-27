'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Search, Edit, Trash2 } from 'lucide-react'
import CreateSubjectModal from './create-subject-modal'
import EditSubjectModal from './edit-subject-modal'

interface SubjectsManagementProps {
  subjects: any[]
  schoolId: string
}

export default function SubjectsManagement({ subjects, schoolId }: SubjectsManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const filteredSubjects = subjects.filter(subj =>
    subj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subj.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (subj: any) => {
    setSelectedSubject(subj)
    setShowEditModal(true)
  }

  const handleDelete = async (subjectId: string) => {
    if (!confirm('Удалить предмет?')) return
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление предметами</h2>
          <p className="text-gray-500 mt-1">Всего предметов: {subjects.length}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить предмет
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск предмета..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map(subj => (
          <Card key={subj.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    {subj.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Код: {subj.code}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subj.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{subj.description}</p>
                )}

                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(subj)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(subj.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">Предметы не найдены</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateSubjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          schoolId={schoolId}
        />
      )}

      {showEditModal && selectedSubject && (
        <EditSubjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          subjectData={selectedSubject}
        />
      )}
    </div>
  )
}
