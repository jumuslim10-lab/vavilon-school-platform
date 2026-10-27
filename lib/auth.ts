import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getUserSchoolMemberships() {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) return []

  const { data: memberships } = await supabase
    .from('school_memberships')
    .select(`
      *,
      schools (*)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)

  return memberships || []
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  const memberships = await getUserSchoolMemberships()

  const hasRole = memberships.some((m: any) =>
    allowedRoles.includes(m.role)
  )

  if (!hasRole) {
    redirect('/unauthorized')
  }

  return { user, memberships }
}
