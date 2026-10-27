'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Search, Edit, Trash2, Shield } from 'lucide-react'
import CreateUserModal from './create-user-modal'
import EditUserModal from './edit-user-modal'

interface UsersManagementProps {
  users: any[]
  schoolId: string
}

export default function UsersManagement({ users, schoolId }: UsersManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const usersByRole = {
    teacher: filteredUsers.filter(u => u.role === 'teacher').length,
    student: filteredUsers.filter(u => u.role === 'student').length,
    parent: filteredUsers.filter(u => u.role === 'parent').length,
    school_admin: filteredUsers.filter(u => u.role === 'school_admin').length
  }

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string, variant: any }> = {
      teacher: { label: 'Учитель', variant: 'default' },
      student: { label: 'Ученик', variant: 'success' },
      parent: { label: 'Родитель', variant: 'info' },
      school_admin: { label: 'Администратор', variant: 'warning' }
    }
    const badge = badges[role] || { label: role, variant: 'default' }
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  const handleEdit = (user: any) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    // TODO: Implement delete via API
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление пользователями</h2>
          <p className="text-gray-500 mt-1">Всего пользователей: {users.length}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Добавить пользователя
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Учителей</p>
                <p className="text-2xl font-bold">{usersByRole.teacher}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Учеников</p>
                <p className="text-2xl font-bold">{usersByRole.student}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Родителей</p>
                <p className="text-2xl font-bold">{usersByRole.parent}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Администраторов</p>
                <p className="text-2xl font-bold">{usersByRole.school_admin}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все роли</option>
              <option value="teacher">Учителя</option>
              <option value="student">Ученики</option>
              <option value="parent">Родители</option>
              <option value="school_admin">Администраторы</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-semibold">ФИО</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">Роль</th>
                  <th className="text-left p-3 font-semibold">Статус</th>
                  <th className="text-right p-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {user.profiles?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.profiles?.full_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{user.profiles?.email}</td>
                    <td className="p-3">{getRoleBadge(user.role)}</td>
                    <td className="p-3">
                      <Badge variant={user.is_active ? 'success' : 'default'}>
                        {user.is_active ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">Пользователи не найдены</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          schoolId={schoolId}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={selectedUser}
        />
      )}
    </div>
  )
}
