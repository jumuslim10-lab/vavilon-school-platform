import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, getTermName, calculateAverage } from '@/lib/utils'
import { BookOpen, Calendar, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DiaryPage() {
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

  // Get student profile
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('school_id', schoolId)
    .single()

  if (!studentProfile) {
    return <div>Профиль ученика не найден</div>
  }

  // Get current academic year
  const { data: academicYear } = await supabase
    .from('academic_years')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .single()

  // Get student's class
  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('*, classes(*)')
    .eq('student_profile_id', studentProfile.id)
    .single()

  // Get grades
  const { data: grades } = await supabase
    .from('grades')
    .select(`
      *,
      subjects(name, code),
      academic_terms(term),
      teacher_profiles(*, profiles(full_name))
    `)
    .eq('student_profile_id', studentProfile.id)
    .order('grade_date', { ascending: false })

  // Get subjects with grade statistics
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', schoolId)

  // Calculate statistics per subject
  const subjectStats = subjects?.map(subject => {
    const subjectGrades = grades?.filter(g => g.subject_id === subject.id) || []
    const average = calculateAverage(subjectGrades.map(g => g.grade_value))
    return {
      subject,
      grades: subjectGrades,
      average,
      count: subjectGrades.length
    }
  }) || []

  // Calculate overall average
  const allGradeValues = grades?.map(g => g.grade_value) || []
  const overallAverage = calculateAverage(allGradeValues)

  return (
    <DashboardLayout userRole={membership.role} userName={profile.full_name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Электронный дневник</h1>
            <p className="text-gray-500 mt-1">
              {enrollment?.classes?.name} • {academicYear?.name || '2026-2027'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 pb-4 px-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Средний балл</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {overallAverage > 0 ? overallAverage.toFixed(2) : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Всего оценок</p>
                  <p className="text-2xl font-bold">{allGradeValues.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Предметов</p>
                  <p className="text-2xl font-bold">{subjectStats.filter(s => s.count > 0).length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Последняя оценка</p>
                  <p className="text-2xl font-bold">
                    {grades && grades.length > 0 ? grades[0].grade_value : '—'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grades by Subject */}
        <Card>
          <CardHeader>
            <CardTitle>Оценки по предметам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectStats.map(stat => (
                <div key={stat.subject.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{stat.subject.name}</h3>
                      {stat.average > 0 && (
                        <Badge variant={stat.average >= 4 ? 'success' : stat.average >= 3 ? 'warning' : 'error'}>
                          Средний: {stat.average.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{stat.count} оценок</span>
                  </div>

                  {stat.grades.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stat.grades.slice(0, 6).map(grade => (
                        <div key={grade.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">
                                {grade.grade_value}
                              </span>
                              <span className="text-sm text-gray-500">
                                / {grade.max_grade}
                              </span>
                              {grade.grade_type && (
                                <Badge variant="default" className="text-xs">
                                  {grade.grade_type}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(grade.grade_date, 'long')}
                            </p>
                            {grade.comment && (
                              <p className="text-xs text-gray-600 mt-1 italic">{grade.comment}</p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            {grade.teacher_profiles?.profiles?.full_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Оценок пока нет</p>
                  )}
                </div>
              ))}

              {subjectStats.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">Предметы не найдены</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Последние оценки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grades && grades.length > 0 ? (
                grades.slice(0, 10).map(grade => (
                  <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
                        {grade.grade_value}
                      </div>
                      <div>
                        <p className="font-semibold">{grade.subjects?.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(grade.grade_date, 'long')} • {grade.grade_type || 'Оценка'}
                        </p>
                        {grade.comment && (
                          <p className="text-sm text-gray-600 mt-1 italic">{grade.comment}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      <p>{grade.teacher_profiles?.profiles?.full_name}</p>
                      <p className="text-xs">{grade.academic_terms ? getTermName(grade.academic_terms.term) : ''}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Оценок пока нет</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
