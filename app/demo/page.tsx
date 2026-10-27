import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Users,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  BarChart3
} from 'lucide-react'

export default function DemoPage() {
  const demoUser = {
    role: 'school_admin',
    name: 'Администратор (DEMO)'
  }

  const pages = [
    { href: '/dashboard', icon: BarChart3, label: 'Главная панель', color: 'blue' },
    { href: '/diary', icon: BookOpen, label: 'Дневник (ученик)', color: 'green' },
    { href: '/journal', icon: FileText, label: 'Журнал (учитель)', color: 'purple' },
    { href: '/timetable', icon: Calendar, label: 'Расписание', color: 'yellow' },
    { href: '/assignments', icon: ClipboardList, label: 'Домашние задания', color: 'red' },
    { href: '/attendance', icon: Users, label: 'Посещаемость', color: 'indigo' },
    { href: '/materials', icon: FileText, label: 'Учебные материалы', color: 'pink' },
    { href: '/messages', icon: MessageSquare, label: 'Сообщения', color: 'cyan' },
    { href: '/notifications', icon: Bell, label: 'Уведомления', color: 'orange' },
    { href: '/admin', icon: Settings, label: 'Администрирование', color: 'gray' },
    { href: '/reports', icon: BarChart3, label: 'Отчеты и аналитика', color: 'teal' },
  ]

  return (
    <DashboardLayout userRole={demoUser.role} userName={demoUser.name}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">VAVILON Platform - Demo Mode</h1>
          <p className="text-gray-500 mt-2">
            Демонстрационный режим для просмотра всех модулей без аутентификации
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Внимание:</strong> Это демо-режим. Для полной функциональности требуется настройка Supabase.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Доступные модули (10/10 завершено)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((page) => (
                <Link key={page.href} href={page.href}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer hover:border-blue-500">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-${page.color}-100 rounded-lg`}>
                        <page.icon className={`h-6 w-6 text-${page.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{page.label}</h3>
                        <p className="text-xs text-gray-500">Нажмите для просмотра</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Реализованная функциональность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">📚 Образовательные модули</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Электронный дневник - оценки учеников</li>
                  <li>✅ Электронный журнал - работа учителей</li>
                  <li>✅ Расписание уроков - недельная сетка</li>
                  <li>✅ Домашние задания - с загрузкой файлов</li>
                  <li>✅ Посещаемость - быстрая отметка</li>
                  <li>✅ Учебные материалы - библиотека</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">⚙️ Управление</h3>
                <ul className="space-y-2 text-sm">
                  <li>✅ Система сообщений - внутренний чат</li>
                  <li>✅ Центр уведомлений - оповещения</li>
                  <li>✅ Администрирование - пользователи, классы, предметы</li>
                  <li>✅ Отчеты - статистика и аналитика</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Технологический стек</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold text-blue-600">Frontend</p>
                <p className="text-gray-600">Next.js 16</p>
                <p className="text-gray-600">React 19</p>
                <p className="text-gray-600">TypeScript</p>
              </div>
              <div>
                <p className="font-semibold text-green-600">Backend</p>
                <p className="text-gray-600">Supabase</p>
                <p className="text-gray-600">PostgreSQL</p>
                <p className="text-gray-600">Row Level Security</p>
              </div>
              <div>
                <p className="font-semibold text-purple-600">Styling</p>
                <p className="text-gray-600">Tailwind CSS 4.0</p>
                <p className="text-gray-600">shadcn/ui</p>
                <p className="text-gray-600">Responsive</p>
              </div>
              <div>
                <p className="font-semibold text-yellow-600">Features</p>
                <p className="text-gray-600">35+ таблиц БД</p>
                <p className="text-gray-600">5 ролей</p>
                <p className="text-gray-600">File uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
