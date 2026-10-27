import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import JournalClient from '@/components/journal/journal-client'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const { user, memberships } = await requireRole(['teacher', 'school_admin'])
  const supabase = await createClient()

  const membership = memberships[0]
  const schoolId = membership.school_id

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get teacher profile
  const { data: teacherProfile } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('school_id', schoolId)
    .single()

  if (!teacherProfile) {
    return (
      <DashboardLayout userRole={membership.role} userName={profile?.full_name || ''}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Профиль учителя не найден</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  // Get teacher's assignments (classes and subjects)
  const { data: assignments } = await supabase
    .from('teacher_assignments')
    .select(`
      *,
      classes(id, name, grade, section),
      subjects(id, name, code)
    `)
    .eq('teacher_profile_id', teacherProfile.id)

  // For now, show first assignment
  const firstAssignment = assignments?.[0]

  if (!firstAssignment) {
    return (
      <DashboardLayout userRole={membership.role} userName={profile?.full_name || ''}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">У вас нет назначенных классов</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  // Get students in the class
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      *,
      student_profiles(id, user_id, profiles(full_name))
    `)
    .eq('class_id', firstAssignment.class_id)

  const students = enrollments?.map(e => ({
    id: e.student_profiles.id,
    profiles: e.student_profiles.profiles
  })) || []

  // Get current academic year and term
  const { data: academicYear } = await supabase
    .from('academic_years')
    .select('*, academic_terms(*)')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .single()

  const currentTerm = academicYear?.academic_terms?.[0]

  // Get grades for this class and subject
  const { data: grades } = await supabase
    .from('grades')
    .select('*')
    .eq('class_id', firstAssignment.class_id)
    .eq('subject_id', firstAssignment.subject_id)
    .order('grade_date', { ascending: false })

  // Get attendance for this class
  const { data: attendance } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('class_id', firstAssignment.class_id)
    .order('attendance_date', { ascending: false })

  return (
    <DashboardLayout userRole={membership.role} userName={profile?.full_name || ''}>
      <JournalClient
        classInfo={firstAssignment.classes}
        subject={firstAssignment.subjects}
        students={students}
        grades={grades || []}
        attendance={attendance || []}
        term={currentTerm}
      />
    </DashboardLayout>
  )
}
