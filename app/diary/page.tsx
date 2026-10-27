import { requireAuth } from '@/lib/auth-cached'
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))] tracking-[var(--letter-spacing-tight)]">
              Электронный дневник
            </h1>
            <div className="flex items-center gap-2 text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">
              <span>{enrollment?.classes?.name}</span>
              <span className="text-[rgb(var(--color-text-tertiary))]">•</span>
              <span>{academicYear?.name || '2026-2027'}</span>
            </div>
          </div>
          <Card className="bg-[rgb(var(--color-accent-light))] border-[rgb(var(--color-accent))]/20">
            <CardContent className="pt-4 pb-4 px-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-[rgb(var(--color-accent))]" />
                <div>
                  <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Средний балл</p>
                  <p className="text-[var(--font-size-2xl)] font-bold text-[rgb(var(--color-accent))]">
                    {overallAverage > 0 ? overallAverage.toFixed(2) : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Всего оценок</p>
                  <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">{allGradeValues.length}</p>
                </div>
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-accent-light))] flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-[rgb(var(--color-accent))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Предметов</p>
                  <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">{subjectStats.filter(s => s.count > 0).length}</p>
                </div>
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-success-light))] flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[rgb(var(--color-success))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Последняя оценка</p>
                  <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">
                    {grades && grades.length > 0 ? grades[0].grade_value : '—'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-warning-light))] flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-[rgb(var(--color-warning))]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grades by Subject */}
        <Card>
          <CardHeader className="border-b border-[rgb(var(--color-border-subtle))]">
            <CardTitle>Оценки по предметам</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {subjectStats.map(stat => (
                <div key={stat.subject.id} className="border-b border-[rgb(var(--color-border-subtle))] pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[var(--font-size-lg)] text-[rgb(var(--color-text-primary))]">{stat.subject.name}</h3>
                      {stat.average > 0 && (
                        <Badge variant={stat.average >= 4 ? 'success' : stat.average >= 3 ? 'warning' : 'error'}>
                          Средний: {stat.average.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-tertiary))]">{stat.count} оценок</span>
                  </div>

                  {stat.grades.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stat.grades.slice(0, 6).map(grade => (
                        <div key={grade.id} className="flex items-center justify-between bg-[rgb(var(--color-surface-hover))] p-3 rounded-[var(--radius-md)] transition-colors duration-200 hover:bg-[rgb(var(--color-border-subtle))]">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--font-size-lg)] text-[rgb(var(--color-text-primary))]">
                                {grade.grade_value}
                              </span>
                              <span className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-tertiary))]">
                                / {grade.max_grade}
                              </span>
                              {grade.grade_type && (
                                <Badge variant="outline" className="text-[var(--font-size-xs)]">
                                  {grade.grade_type}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mt-1">
                              {formatDate(grade.grade_date, 'long')}
                            </p>
                            {grade.comment && (
                              <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-secondary))] mt-1 italic">{grade.comment}</p>
                            )}
                          </div>
                          <div className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] text-right">
                            {grade.teacher_profiles?.profiles?.full_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-tertiary))] italic">Оценок пока нет</p>
                  )}
                </div>
              ))}

              {subjectStats.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-3 opacity-50" />
                  <p className="text-[rgb(var(--color-text-tertiary))]">Предметы не найдены</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades Timeline */}
        <Card>
          <CardHeader className="border-b border-[rgb(var(--color-border-subtle))]">
            <CardTitle>Последние оценки</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[rgb(var(--color-border-subtle))]">
              {grades && grades.length > 0 ? (
                grades.slice(0, 10).map(grade => (
                  <div key={grade.id} className="flex items-center gap-4 p-4 hover:bg-[rgb(var(--color-surface-hover))] transition-colors duration-200 cursor-pointer">
                    <div className="flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))] font-bold text-[var(--font-size-lg)] flex-shrink-0">
                      {grade.grade_value}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--font-size-sm)] text-[rgb(var(--color-text-primary))]">{grade.subjects?.name}</p>
                      <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mt-0.5">
                        {formatDate(grade.grade_date, 'long')} • {grade.grade_type || 'Оценка'}
                      </p>
                      {grade.comment && (
                        <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-secondary))] mt-1 italic">{grade.comment}</p>
                      )}
                    </div>
                    <div className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] text-right">
                      <p>{grade.teacher_profiles?.profiles?.full_name}</p>
                      <p className="text-[var(--font-size-xs)]">{grade.academic_terms ? getTermName(grade.academic_terms.term) : ''}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-[rgb(var(--color-text-tertiary))]">Оценок пока нет</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
