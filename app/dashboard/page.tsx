import { getUser, getUserProfile, getUserSchoolMemberships } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, ClipboardList, Users, Bell } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile()
  const memberships = await getUserSchoolMemberships()

  if (!profile || memberships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Нет доступа к школам</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Ваша учетная запись не связана ни с одной школой. Обратитесь к администратору.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const primaryMembership = memberships[0]
  const school = primaryMembership.schools

  return (
    <DashboardLayout
      userRole={primaryMembership.role}
      userName={profile.full_name}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Главная</h1>
          <p className="text-gray-500 mt-1">
            Добро пожаловать в VAVILON, {profile.full_name}
          </p>
        </div>

        {/* School Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{school.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Учебный год 2026-2027
                </p>
              </div>
              <Badge variant="success">Активно</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Непрочитанные</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Задания</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <ClipboardList className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Уроки сегодня</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Средний балл</p>
                  <p className="text-2xl font-bold">4.5</p>
                </div>
                <BookOpen className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Последние события</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Новая оценка по математике</p>
                  <p className="text-xs text-gray-500 mt-1">2 часа назад</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Домашнее задание по физике</p>
                  <p className="text-xs text-gray-500 mt-1">Вчера</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Школьное объявление</p>
                  <p className="text-xs text-gray-500 mt-1">2 дня назад</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Настройка VAVILON</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Для полной работы платформы необходимо:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Настроить переменные окружения в .env.local</li>
                <li>Применить миграции базы данных в Supabase</li>
                <li>Создать демо-пользователей через Supabase Auth</li>
                <li>Запустить seed.sql для создания демо-данных</li>
              </ol>
              <p className="mt-3 text-xs">
                См. документацию в README.md для подробных инструкций.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
