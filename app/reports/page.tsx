import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import ReportsClient from '@/components/reports/reports-client'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const { user, memberships } = await requireRole(['school_admin', 'platform_admin', 'teacher'])
  const supabase = await createClient()

  const membership = memberships[0]
  const schoolId = membership.school_id

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get overall statistics
  const { count: totalStudents } = await supabase
    .from('student_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  const { count: totalTeachers } = await supabase
    .from('teacher_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  const { count: totalClasses } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)

  // Get average grade
  const { data: gradesData } = await supabase
    .from('grades')
    .select('grade_value')
    .eq('class_id', schoolId)

  const averageGrade = gradesData && gradesData.length > 0
    ? gradesData.reduce((sum, g) => sum + g.grade_value, 0) / gradesData.length
    : 0

  // Get attendance rate
  const { data: attendanceData } = await supabase
    .from('attendance_records')
    .select('status')

  const attendanceRate = attendanceData && attendanceData.length > 0
    ? (attendanceData.filter(a => a.status === 'present').length / attendanceData.length) * 100
    : 0

  // Get grades by subject
  const { data: gradesBySubject } = await supabase
    .from('grades')
    .select('grade_value, subject_id, subjects(name)')

  const subjectStats = gradesBySubject?.reduce((acc: any[], grade: any) => {
    const subjectName = grade.subjects?.name || 'Unknown'
    const existing = acc.find(s => s.subject_name === subjectName)

    if (existing) {
      existing.total += grade.grade_value
      existing.count += 1
      existing[`grade_${grade.grade_value}`] = (existing[`grade_${grade.grade_value}`] || 0) + 1
    } else {
      acc.push({
        subject_name: subjectName,
        total: grade.grade_value,
        count: 1,
        [`grade_${grade.grade_value}`]: 1
      })
    }
    return acc
  }, []).map((s: any) => ({
    ...s,
    avg_grade: s.total / s.count
  })) || []

  // Get attendance by class
  const { data: attendanceByClass } = await supabase
    .from('attendance_records')
    .select('status, class_id, classes(name)')

  const classStats = attendanceByClass?.reduce((acc: any[], record: any) => {
    const className = record.classes?.name || 'Unknown'
    const existing = acc.find(c => c.class_name === className)

    if (existing) {
      existing.total += 1
      if (record.status === 'present') existing.present += 1
      if (record.status === 'absent') existing.absent = (existing.absent || 0) + 1
      if (record.status === 'late') existing.late = (existing.late || 0) + 1
      if (record.status === 'excused') existing.excused = (existing.excused || 0) + 1
    } else {
      acc.push({
        class_name: className,
        total: 1,
        present: record.status === 'present' ? 1 : 0,
        absent: record.status === 'absent' ? 1 : 0,
        late: record.status === 'late' ? 1 : 0,
        excused: record.status === 'excused' ? 1 : 0
      })
    }
    return acc
  }, []).map((c: any) => ({
    ...c,
    attendance_rate: (c.present / c.total) * 100
  })) || []

  return (
    <DashboardLayout userRole={membership.role} userName={profile?.full_name || ''}>
      <ReportsClient
        schoolId={schoolId}
        role={membership.role}
        stats={{
          totalStudents: totalStudents || 0,
          totalTeachers: totalTeachers || 0,
          totalClasses: totalClasses || 0,
          averageGrade,
          attendanceRate
        }}
        gradesBySubject={subjectStats}
        attendanceByClass={classStats}
      />
    </DashboardLayout>
  )
}
