import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { redirect } from 'next/navigation'

// Кэшируем получение пользователя
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Кэшируем получение профиля
export const getUserProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
})

// Кэшируем получение школ пользователя
export const getUserSchoolMemberships = cache(async () => {
  const user = await getUser()
  if (!user) return []

  const supabase = await createClient()
  const { data: memberships } = await supabase
    .from('school_memberships')
    .select(`
      *,
      schools (*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  return memberships || []
})

// Требовать авторизацию
export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

// Требовать определенную роль
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  const memberships = await getUserSchoolMemberships()

  const hasRole = memberships.some((m: any) =>
    allowedRoles.includes(m.role)
  )

  if (!hasRole) {
    redirect('/dashboard')
  }

  return { user, memberships }
}

// Экспорт для совместимости
export { getUser as getUserServer, getUserProfile as getUserProfileServer }
