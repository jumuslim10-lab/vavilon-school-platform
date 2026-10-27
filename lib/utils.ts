import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'short') {
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function formatTime(time: string): string {
  return time.slice(0, 5)
}

export function getDayName(dayNumber: number): string {
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  return days[dayNumber - 1] || ''
}

export function getDayNameShort(dayNumber: number): string {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  return days[dayNumber - 1] || ''
}

export function getTermName(term: string): string {
  const terms: Record<string, string> = {
    first: '1-я четверть',
    second: '2-я четверть',
    third: '3-я четверть',
    fourth: '4-я четверть'
  }
  return terms[term] || term
}

export function getRoleName(role: string): string {
  const roles: Record<string, string> = {
    platform_admin: 'Администратор платформы',
    school_admin: 'Администратор школы',
    teacher: 'Учитель',
    student: 'Ученик',
    parent: 'Родитель'
  }
  return roles[role] || role
}

export function getAttendanceStatusName(status: string): string {
  const statuses: Record<string, string> = {
    present: 'Присутствовал',
    absent: 'Отсутствовал',
    excused: 'Уважительная причина',
    late: 'Опоздал'
  }
  return statuses[status] || status
}

export function getAttendanceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    present: 'text-green-600 bg-green-50',
    absent: 'text-red-600 bg-red-50',
    excused: 'text-blue-600 bg-blue-50',
    late: 'text-yellow-600 bg-yellow-50'
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}

export function getAssignmentStatusName(status: string): string {
  const statuses: Record<string, string> = {
    draft: 'Черновик',
    published: 'Опубликовано',
    in_progress: 'В процессе',
    submitted: 'Сдано',
    graded: 'Оценено',
    overdue: 'Просрочено'
  }
  return statuses[status] || status
}

export function getAssignmentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-gray-600 bg-gray-50',
    published: 'text-blue-600 bg-blue-50',
    in_progress: 'text-yellow-600 bg-yellow-50',
    submitted: 'text-green-600 bg-green-50',
    graded: 'text-green-700 bg-green-100',
    overdue: 'text-red-600 bg-red-50'
  }
  return colors[status] || 'text-gray-600 bg-gray-50'
}

export function calculateAverage(grades: number[]): number {
  if (grades.length === 0) return 0
  const sum = grades.reduce((acc, grade) => acc + grade, 0)
  return Math.round((sum / grades.length) * 100) / 100
}

export function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date()
}
