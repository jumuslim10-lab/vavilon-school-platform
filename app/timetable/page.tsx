import { requireAuth } from '@/lib/auth-cached'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDayName, getDayNameShort, formatTime, cn } from '@/lib/utils'
import { Clock, MapPin, User, Calendar as CalendarIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

const DAYS = [1, 2, 3, 4, 5, 6] // Monday to Saturday

export default async function TimetablePage() {
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

  let timetableEntries: any[] = []
  let className = ''

  // Get timetable based on role
  if (role === 'student') {
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
        .select('*, classes(name)')
        .eq('student_profile_id', studentProfile.id)
        .single()

      if (enrollment) {
        className = enrollment.classes?.name || ''

        // Get timetable for student's class
        const { data: entries } = await supabase
          .from('timetable_entries')
          .select(`
            *,
            subjects(name, code),
            classrooms(name, building),
            teacher_profiles(*, profiles(full_name)),
            lesson_periods(name, start_time, end_time, period_order)
          `)
          .eq('class_id', enrollment.class_id)
          .order('day_of_week')
          .order('lesson_periods(period_order)')

        timetableEntries = entries || []
      }
    }
  } else if (role === 'teacher') {
    // Get teacher's timetable
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('school_id', schoolId)
      .single()

    if (teacherProfile) {
      const { data: entries } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          subjects(name, code),
          classes(name),
          classrooms(name, building),
          lesson_periods(name, start_time, end_time, period_order)
        `)
        .eq('teacher_profile_id', teacherProfile.id)
        .order('day_of_week')
        .order('lesson_periods(period_order)')

      timetableEntries = entries || []
    }
  }

  // Get all lesson periods for the school
  const { data: periods } = await supabase
    .from('lesson_periods')
    .select('*')
    .eq('school_id', schoolId)
    .order('period_order')

  // Organize timetable by day and period
  const timetableByDay = DAYS.map(day => ({
    day,
    lessons: periods?.map(period => {
      const entry = timetableEntries.find(
        e => e.day_of_week === day && e.lesson_period_id === period.id
      )
      return {
        period,
        entry
      }
    }) || []
  }))

  // Get current day
  const currentDay = new Date().getDay() || 7
  const currentDayAdjusted = currentDay === 7 ? 7 : currentDay

  return (
    <DashboardLayout userRole={membership.role} userName={profile.full_name}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))] tracking-[var(--letter-spacing-tight)]">
              Расписание уроков
            </h1>
            <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">
              {role === 'student' && className ? `Класс ${className}` : 'Мое расписание'}
            </p>
          </div>
          <Badge variant="info" className="text-[var(--font-size-sm)] px-4 py-2">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Неделя 1
          </Badge>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Уроков в неделю</p>
                  <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">{timetableEntries.length}</p>
                </div>
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-accent-light))] flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-[rgb(var(--color-accent))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Сегодня уроков</p>
                  <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">
                    {timetableEntries.filter(e => e.day_of_week === currentDayAdjusted).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-success-light))] flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[rgb(var(--color-success))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Предметов</p>
                  <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">
                    {new Set(timetableEntries.map(e => e.subject_id)).size}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-warning-light))] flex items-center justify-center">
                  <User className="h-6 w-6 text-[rgb(var(--color-warning))]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Кабинетов</p>
                  <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">
                    {new Set(timetableEntries.map(e => e.classroom_id).filter(Boolean)).size}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-error-light))] flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[rgb(var(--color-error))]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Timetable */}
        <Card>
          <CardHeader className="border-b border-[rgb(var(--color-border-subtle))]">
            <CardTitle>Расписание на неделю</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[rgb(var(--color-border-subtle))]">
                    <th className="text-left p-3 bg-[rgb(var(--color-surface-hover))] font-semibold text-[var(--font-size-sm)] text-[rgb(var(--color-text-primary))]">Урок</th>
                    {timetableByDay.map(({ day }) => (
                      <th
                        key={day}
                        className={cn(
                          "text-left p-3 bg-[rgb(var(--color-surface-hover))] font-semibold text-[var(--font-size-sm)] min-w-[200px]",
                          day === currentDayAdjusted && "bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))]"
                        )}
                      >
                        {getDayName(day)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods?.map(period => (
                    <tr key={period.id} className="border-b border-[rgb(var(--color-border-subtle))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors duration-200">
                      <td className="p-3 align-top bg-[rgb(var(--color-surface-hover))]">
                        <div className="font-semibold text-[var(--font-size-sm)] text-[rgb(var(--color-text-primary))]">{period.name}</div>
                        <div className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))] mt-1">
                          {formatTime(period.start_time)} - {formatTime(period.end_time)}
                        </div>
                      </td>
                      {timetableByDay.map(({ day, lessons }) => {
                        const lesson = lessons.find(l => l.period.id === period.id)
                        const entry = lesson?.entry

                        return (
                          <td
                            key={day}
                            className={cn(
                              "p-2 align-top",
                              day === currentDayAdjusted && "bg-[rgb(var(--color-accent-light))]/10"
                            )}
                          >
                            {entry ? (
                              <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-[var(--radius-md)] p-3 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
                                <div className="font-semibold text-[var(--font-size-sm)] text-[rgb(var(--color-accent))] mb-1">
                                  {entry.subjects?.name}
                                </div>
                                {role === 'student' && entry.teacher_profiles?.profiles && (
                                  <div className="flex items-center gap-1 text-[var(--font-size-xs)] text-[rgb(var(--color-text-secondary))] mb-1">
                                    <User className="h-3 w-3" />
                                    {entry.teacher_profiles.profiles.full_name}
                                  </div>
                                )}
                                {role === 'teacher' && entry.classes && (
                                  <div className="text-[var(--font-size-xs)] text-[rgb(var(--color-text-secondary))] mb-1">
                                    Класс: {entry.classes.name}
                                  </div>
                                )}
                                {entry.classrooms && (
                                  <div className="flex items-center gap-1 text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))]">
                                    <MapPin className="h-3 w-3" />
                                    {entry.classrooms.name}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))]">—</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {!periods || periods.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-3 opacity-50" />
                  <p className="text-[rgb(var(--color-text-tertiary))]">Расписание не настроено</p>
                </div>
              ) : timetableEntries.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-3 opacity-50" />
                  <p className="text-[rgb(var(--color-text-tertiary))]">Расписание пусто</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="border-b border-[rgb(var(--color-border-subtle))]">
            <CardTitle>Уроки сегодня</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[rgb(var(--color-border-subtle))]">
              {timetableEntries
                .filter(e => e.day_of_week === currentDayAdjusted)
                .sort((a, b) => a.lesson_periods.period_order - b.lesson_periods.period_order)
                .map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 hover:bg-[rgb(var(--color-surface-hover))] transition-colors duration-200 cursor-pointer">
                    <div className="flex items-center justify-center w-16 h-16 rounded-[var(--radius-md)] bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))] flex-shrink-0">
                      <div className="text-center">
                        <div className="text-[var(--font-size-xs)] font-semibold">{entry.lesson_periods.period_order}</div>
                        <div className="text-[10px]">{formatTime(entry.lesson_periods.start_time)}</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--font-size-sm)] text-[rgb(var(--color-text-primary))]">{entry.subjects?.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-[var(--font-size-xs)] text-[rgb(var(--color-text-tertiary))]">
                        {role === 'student' && entry.teacher_profiles?.profiles && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {entry.teacher_profiles.profiles.full_name}
                          </span>
                        )}
                        {role === 'teacher' && entry.classes && (
                          <span>Класс: {entry.classes.name}</span>
                        )}
                        {entry.classrooms && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {entry.classrooms.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-[var(--font-size-sm)]">
                      <div className="font-semibold text-[rgb(var(--color-text-primary))]">{formatTime(entry.lesson_periods.start_time)}</div>
                      <div className="text-[rgb(var(--color-text-tertiary))]">{formatTime(entry.lesson_periods.end_time)}</div>
                    </div>
                  </div>
                ))}

              {timetableEntries.filter(e => e.day_of_week === currentDayAdjusted).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[rgb(var(--color-text-tertiary))]">Сегодня уроков нет</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
