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
        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold">Добро пожаловать!</h1>
            <p className="text-blue-100 mt-2 text-lg">
              {profile.full_name}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span>{school.name}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Уведомления</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">3</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
                  <Bell className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Задания</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">5</p>
                </div>
                <div className="p-3 rounded-xl bg-green-600 shadow-lg">
                  <ClipboardList className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Уроки сегодня</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">6</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-600 shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Средний балл</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">4.5</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-600 shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Последние события</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="p-2 rounded-lg bg-green-100">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Новая оценка по математике</p>
                  <p className="text-xs text-gray-500 mt-1">2 часа назад</p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">5</Badge>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Домашнее задание по физике</p>
                  <p className="text-xs text-gray-500 mt-1">Вчера</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Новое</Badge>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Школьное объявление</p>
                  <p className="text-xs text-gray-500 mt-1">2 дня назад</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
