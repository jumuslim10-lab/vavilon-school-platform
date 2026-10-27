'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  Users,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: any
  roles?: string[]
}

const navItems: NavItem[] = [
  { name: 'Главная', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Дневник', href: '/diary', icon: BookOpen, roles: ['student', 'parent'] },
  { name: 'Журнал', href: '/journal', icon: BookOpen, roles: ['teacher', 'school_admin'] },
  { name: 'Расписание', href: '/timetable', icon: Calendar },
  { name: 'Задания', href: '/assignments', icon: ClipboardList },
  { name: 'Материалы', href: '/materials', icon: FileText },
  { name: 'Посещаемость', href: '/attendance', icon: Users, roles: ['teacher', 'school_admin'] },
  { name: 'Сообщения', href: '/messages', icon: MessageSquare },
  { name: 'Уведомления', href: '/notifications', icon: Bell },
  { name: 'Отчеты', href: '/reports', icon: BarChart3, roles: ['teacher', 'school_admin', 'platform_admin'] },
  { name: 'Администрирование', href: '/admin', icon: Settings, roles: ['school_admin', 'platform_admin'] },
]

export default function DashboardLayout({
  children,
  userRole,
  userName,
}: {
  children: React.ReactNode
  userRole: string
  userName: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-border">
          <h1 className="text-2xl font-bold text-brand-blue">VAVILON</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-blue text-white'
                        : 'text-gray-700 hover:bg-background-secondary'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User profile and logout */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-8">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
