import { requireRole } from '@/lib/auth-cached'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UsersManagement from '@/components/admin/users-management'
import ClassesManagement from '@/components/admin/classes-management'
import SubjectsManagement from '@/components/admin/subjects-management'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const { user, memberships } = await requireRole(['school_admin', 'platform_admin'])
  const supabase = await createClient()

  const membership = memberships[0]
  const schoolId = membership.school_id

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all users in this school
  const { data: users } = await supabase
    .from('school_memberships')
    .select('*, profiles(*)')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  // Get all classes
  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', schoolId)
    .order('grade', { ascending: true })

  // Get all subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', schoolId)
    .order('name', { ascending: true })

  return (
    <DashboardLayout userRole={membership.role} userName={profile?.full_name || ''}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Администрирование</h1>
          <p className="text-gray-500 mt-1">Управление школой</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="classes">Классы</TabsTrigger>
            <TabsTrigger value="subjects">Предметы</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement users={users || []} schoolId={schoolId} />
          </TabsContent>

          <TabsContent value="classes">
            <ClassesManagement classes={classes || []} schoolId={schoolId} />
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectsManagement subjects={subjects || []} schoolId={schoolId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
