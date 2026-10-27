import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDayName, getDayNameShort, formatTime } from '@/lib/utils'
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Расписание уроков</h1>
            <p className="text-gray-500 mt-1">
              {role === 'student' && className ? `Класс ${className}` : 'Мое расписание'}
            </p>
          </div>
          <Badge variant="info" className="text-sm px-4 py-2">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Неделя 1
          </Badge>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Уроков в неделю</p>
                  <p className="text-2xl font-bold">{timetableEntries.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Сегодня уроков</p>
                  <p className="text-2xl font-bold">
                    {timetableEntries.filter(e => e.day_of_week === currentDayAdjusted).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Предметов</p>
                  <p className="text-2xl font-bold">
                    {new Set(timetableEntries.map(e => e.subject_id)).size}
                  </p>
                </div>
                <User className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Кабинетов</p>
                  <p className="text-2xl font-bold">
                    {new Set(timetableEntries.map(e => e.classroom_id).filter(Boolean)).size}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Timetable */}
        <Card>
          <CardHeader>
            <CardTitle>Расписание на неделю</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 bg-gray-50 font-semibold">Урок</th>
                    {timetableByDay.map(({ day }) => (
                      <th
                        key={day}
                        className={`text-left p-3 bg-gray-50 font-semibold min-w-[200px] ${
                          day === currentDayAdjusted ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {getDayName(day)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods?.map(period => (
                    <tr key={period.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 align-top bg-gray-50">
                        <div className="font-semibold text-sm">{period.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(period.start_time)} - {formatTime(period.end_time)}
                        </div>
                      </td>
                      {timetableByDay.map(({ day, lessons }) => {
                        const lesson = lessons.find(l => l.period.id === period.id)
                        const entry = lesson?.entry

                        return (
                          <td
                            key={day}
                            className={`p-2 align-top ${
                              day === currentDayAdjusted ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            {entry ? (
                              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                <div className="font-semibold text-sm text-blue-600 mb-1">
                                  {entry.subjects?.name}
                                </div>
                                {role === 'student' && entry.teacher_profiles?.profiles && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                    <User className="h-3 w-3" />
                                    {entry.teacher_profiles.profiles.full_name}
                                  </div>
                                )}
                                {role === 'teacher' && entry.classes && (
                                  <div className="text-xs text-gray-600 mb-1">
                                    Класс: {entry.classes.name}
                                  </div>
                                )}
                                {entry.classrooms && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    {entry.classrooms.name}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center text-xs text-gray-300">—</div>
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
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">Расписание не настроено</p>
                </div>
              ) : timetableEntries.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400">Расписание пусто</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Уроки сегодня</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timetableEntries
                .filter(e => e.day_of_week === currentDayAdjusted)
                .sort((a, b) => a.lesson_periods.period_order - b.lesson_periods.period_order)
                .map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-600">
                      <div className="text-center">
                        <div className="text-xs font-semibold">{entry.lesson_periods.period_order}</div>
                        <div className="text-[10px]">{formatTime(entry.lesson_periods.start_time)}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{entry.subjects?.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
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
                    <div className="text-right text-sm">
                      <div className="font-semibold">{formatTime(entry.lesson_periods.start_time)}</div>
                      <div className="text-gray-500">{formatTime(entry.lesson_periods.end_time)}</div>
                    </div>
                  </div>
                ))}

              {timetableEntries.filter(e => e.day_of_week === currentDayAdjusted).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Сегодня уроков нет</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
