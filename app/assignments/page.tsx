import { requireAuth } from '@/lib/auth-cached'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import AssignmentsClient from '@/components/assignments/assignments-client'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AssignmentsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get user profile and memberships
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('school_memberships')
    .select('*, schools(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!profile || !memberships || memberships.length === 0) {
    return <div>Нет доступа</div>
  }

  const membership = memberships[0]
  const schoolId = membership.school_id
  const role = membership.role

  let assignments: any[] = []
  let submissions: any[] = []
  let teacherProfile = null
  let studentProfile = null

  if (role === 'teacher') {
    // Get teacher profile
    const { data: teacher } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_id', schoolId)
      .single()

    teacherProfile = teacher

    if (teacher) {
      // Get assignments created by this teacher
      const { data: teacherAssignments } = await supabase
        .from('assignments')
        .select(`
          *,
          classes(id, name, grade, section),
          subjects(id, name, code),
          assignment_submissions(count)
        `)
        .eq('teacher_profile_id', teacher.id)
        .order('created_at', { ascending: false })

      assignments = teacherAssignments || []
    }
  } else if (role === 'student') {
    // Get student profile
    const { data: student } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_id', schoolId)
      .single()

    studentProfile = student

    if (student) {
      // Get student's class
      const { data: enrollment } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_profile_id', student.id)
        .single()

      if (enrollment) {
        // Get assignments for student's class
        const { data: classAssignments } = await supabase
          .from('assignments')
          .select(`
            *,
            subjects(id, name, code),
            teacher_profiles(*, profiles(full_name))
          `)
          .eq('class_id', enrollment.class_id)
          .eq('status', 'published')
          .order('due_date', { ascending: true })

        assignments = classAssignments || []

        // Get student's submissions
        const { data: studentSubmissions } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('student_profile_id', student.id)

        submissions = studentSubmissions || []
      }
    }
  }

  if (!teacherProfile && !studentProfile) {
    return (
      <DashboardLayout userRole={membership.role} userName={profile.full_name}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Профиль не найден</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={membership.role} userName={profile.full_name}>
      <AssignmentsClient
        role={role}
        assignments={assignments}
        submissions={submissions}
        teacherProfileId={teacherProfile?.id}
        studentProfileId={studentProfile?.id}
        schoolId={schoolId}
      />
    </DashboardLayout>
  )
}
