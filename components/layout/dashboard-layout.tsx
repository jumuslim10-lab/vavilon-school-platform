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
    <div className="min-h-screen bg-[rgb(var(--color-bg))]">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))]"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-[rgb(var(--color-surface))] border-r border-[rgb(var(--color-border))] transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-[rgb(var(--color-border-subtle))]">
          <h1 className="text-[var(--font-size-2xl)] font-bold text-[rgb(var(--color-text-primary))] tracking-[var(--letter-spacing-tight)]">
            VAVILON
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[var(--font-size-sm)] font-medium transition-all duration-200',
                      isActive
                        ? 'bg-[rgb(var(--color-accent))] text-white shadow-[var(--shadow-sm)]'
                        : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))]'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User profile and logout */}
        <div className="border-t border-[rgb(var(--color-border-subtle))] p-4">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-[var(--radius-md)] bg-[rgb(var(--color-surface-hover))]">
            <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-accent))] flex items-center justify-center text-white font-semibold flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[var(--font-size-sm)] font-semibold text-[rgb(var(--color-text-primary))] truncate">
                {userName}
              </p>
              <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] capitalize truncate">
                {userRole}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-6 lg:p-8 min-h-screen">
          <div className="animate-fadeIn max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
