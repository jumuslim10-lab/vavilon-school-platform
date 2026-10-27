import { requireAuth } from '@/lib/auth-cached'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import MaterialsClient from '@/components/materials/materials-client'

export const dynamic = 'force-dynamic'

export default async function MaterialsPage() {
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

  // Get subjects for this school
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', schoolId)
    .order('name')

  let materials: any[] = []
  let teacherProfile = null

  if (role === 'teacher') {
    // Get teacher profile
    const { data: teacher } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_id', schoolId)
      .single()

    teacherProfile = teacher

    // Get all materials for teacher's subjects
    const { data: teacherAssignments } = await supabase
      .from('teacher_assignments')
      .select('subject_id')
      .eq('teacher_profile_id', teacher?.id || '')

    const subjectIds = teacherAssignments?.map(a => a.subject_id) || []

    if (subjectIds.length > 0) {
      const { data: teacherMaterials } = await supabase
        .from('learning_materials')
        .select(`
          *,
          subjects(id, name, code),
          teacher_profiles(*, profiles(full_name))
        `)
        .in('subject_id', subjectIds)
        .order('created_at', { ascending: false })

      materials = teacherMaterials || []
    }
  } else if (role === 'student') {
    // Get student's class
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_id', schoolId)
      .single()

    if (studentProfile) {
      const { data: enrollment } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_profile_id', studentProfile.id)
        .single()

      if (enrollment) {
        // Get materials for student's class subjects
        const { data: studentMaterials } = await supabase
          .from('learning_materials')
          .select(`
            *,
            subjects(id, name, code),
            teacher_profiles(*, profiles(full_name))
          `)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })

        materials = studentMaterials || []
      }
    }
  }

  return (
    <DashboardLayout userRole={membership.role} userName={profile.full_name}>
      <MaterialsClient
        role={role}
        materials={materials}
        subjects={subjects || []}
        schoolId={schoolId}
        teacherProfileId={teacherProfile?.id}
      />
    </DashboardLayout>
  )
}
