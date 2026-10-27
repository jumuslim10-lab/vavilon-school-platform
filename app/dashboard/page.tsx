import { getUser, getUserProfile, getUserSchoolMemberships } from '@/lib/auth-cached'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, ClipboardList, Bell, TrendingUp } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Нет доступа к школам</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[rgb(var(--color-text-secondary))]">
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
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))] tracking-[var(--letter-spacing-tight)]">
            Добро пожаловать, {profile.full_name.split(' ')[0]}
          </h1>
          <div className="flex items-center gap-2 text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">
            <span>{school.name}</span>
            <span className="text-[rgb(var(--color-text-tertiary))]">•</span>
            <span>Учебный год 2026-2027</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Уведомления</p>
                <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">3</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[var(--font-size-xs)] text-[rgb(var(--color-success))]">
                <TrendingUp className="h-3 w-3" />
                <span>2 новых</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Задания</p>
                <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">5</p>
              </div>
              <div className="mt-4 text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))]">
                3 в работе, 2 завершено
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Уроки сегодня</p>
                <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">6</p>
              </div>
              <div className="mt-4 text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))]">
                2 пройдено, 4 осталось
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="space-y-1">
                <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Средний балл</p>
                <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">4.5</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[var(--font-size-xs)] text-[rgb(var(--color-success))]">
                <TrendingUp className="h-3 w-3" />
                <span>+0.3 за месяц</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="border-b border-[rgb(var(--color-border-subtle))]">
            <CardTitle>Последние события</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[rgb(var(--color-border-subtle))]">
              <div className="flex items-center gap-4 p-4 hover:bg-[rgb(var(--color-surface-hover))] transition-colors duration-200 cursor-pointer">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[rgb(var(--color-success-light))] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-[rgb(var(--color-success))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--font-size-sm)] font-medium text-[rgb(var(--color-text-primary))]">
                    Новая оценка по математике
                  </p>
                  <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mt-0.5">
                    2 часа назад
                  </p>
                </div>
                <Badge variant="success">5</Badge>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-[rgb(var(--color-surface-hover))] transition-colors duration-200 cursor-pointer">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[rgb(var(--color-accent-light))] flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="h-5 w-5 text-[rgb(var(--color-accent))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--font-size-sm)] font-medium text-[rgb(var(--color-text-primary))]">
                    Домашнее задание по физике
                  </p>
                  <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mt-0.5">
                    Вчера в 18:30
                  </p>
                </div>
                <Badge variant="info">Новое</Badge>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-[rgb(var(--color-surface-hover))] transition-colors duration-200 cursor-pointer">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[rgb(var(--color-warning-light))] flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-[rgb(var(--color-warning))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--font-size-sm)] font-medium text-[rgb(var(--color-text-primary))]">
                    Школьное объявление
                  </p>
                  <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mt-0.5">
                    2 дня назад
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-[rgb(var(--color-surface-hover))] transition-colors duration-200 cursor-pointer">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[rgb(var(--color-accent-light))] flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-[rgb(var(--color-accent))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--font-size-sm)] font-medium text-[rgb(var(--color-text-primary))]">
                    Изменение в расписании
                  </p>
                  <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mt-0.5">
                    3 дня назад
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
