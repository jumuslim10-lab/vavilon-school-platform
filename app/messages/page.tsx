import { requireAuth } from '@/lib/auth-cached'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import MessagesClient from '@/components/messages/messages-client'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('school_memberships')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!profile || !memberships || memberships.length === 0) {
    return <div>Нет доступа</div>
  }

  const membership = memberships[0]

  // Get conversations for this user
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      messages(content, created_at)
    `)
    .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  // Get all school users as potential contacts
  const { data: contacts } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .neq('id', user.id)

  return (
    <DashboardLayout userRole={membership.role} userName={profile.full_name}>
      <MessagesClient
        userId={user.id}
        conversations={conversations || []}
        contacts={contacts || []}
      />
    </DashboardLayout>
  )
}
