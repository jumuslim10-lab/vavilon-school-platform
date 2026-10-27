'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { School, Plus, Search, Edit, Trash2, Users } from 'lucide-react'
import CreateClassModal from './create-class-modal'
import EditClassModal from './edit-class-modal'

interface ClassesManagementProps {
  classes: any[]
  schoolId: string
}

export default function ClassesManagement({ classes, schoolId }: ClassesManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const filteredClasses = classes.filter(cls =>
    cls.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (cls: any) => {
    setSelectedClass(cls)
    setShowEditModal(true)
  }

  const handleDelete = async (classId: string) => {
    if (!confirm('Удалить класс? Все данные будут потеряны.')) return
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление классами</h2>
          <p className="text-gray-500 mt-1">Всего классов: {classes.length}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить класс
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Поиск класса..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(cls => (
          <Card key={cls.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5 text-blue-500" />
                    {cls.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {cls.grade} класс • {cls.section}
                  </p>
                </div>
                <Badge variant="default">{cls.academic_year}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Учеников: {cls.max_students || 0}</span>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(cls)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cls.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClasses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <School className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">Классы не найдены</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateClassModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          schoolId={schoolId}
        />
      )}

      {showEditModal && selectedClass && (
        <EditClassModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          classData={selectedClass}
        />
      )}
    </div>
  )
}
