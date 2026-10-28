// Auth Helper Functions
// Copy this to src/lib/supabase/auth.ts

import { supabase } from './client'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile() {
  const user = await getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function getUserRole() {
  const user = await getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('school_memberships')
    .select('role, school_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}
