import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import NotificationsClient from '@/components/notifications/notifications-client'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
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

  // Get notifications for this user
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout userRole={membership.role} userName={profile.full_name}>
      <NotificationsClient
        notifications={notifications || []}
        userId={user.id}
      />
    </DashboardLayout>
  )
}
