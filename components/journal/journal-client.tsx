'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate, getAttendanceStatusColor, getAttendanceStatusName } from '@/lib/utils'
import { Save, X, Check, Calendar as CalendarIcon, Users } from 'lucide-react'

interface JournalProps {
  classInfo: any
  subject: any
  students: any[]
  grades: any[]
  attendance: any[]
  term: any
}

export default function JournalClient({ classInfo, subject, students, grades, attendance, term }: JournalProps) {
  const [editingGrade, setEditingGrade] = useState<{studentId: string, date: string} | null>(null)
  const [gradeValue, setGradeValue] = useState('')

  // Get unique dates from grades and attendance
  const dates = Array.from(
    new Set([
      ...grades.map(g => g.grade_date),
      ...attendance.map(a => a.attendance_date)
    ])
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 10)

  // Get grade for specific student and date
  const getGrade = (studentId: string, date: string) => {
    return grades.find(g =>
      g.student_profile_id === studentId &&
      g.grade_date === date
    )
  }

  // Get attendance for specific student and date
  const getAttendance = (studentId: string, date: string) => {
    return attendance.find(a =>
      a.student_profile_id === studentId &&
      a.attendance_date === date
    )
  }

  // Calculate average for student
  const getStudentAverage = (studentId: string) => {
    const studentGrades = grades.filter(g => g.student_profile_id === studentId)
    if (studentGrades.length === 0) return null
    const sum = studentGrades.reduce((acc, g) => acc + g.grade_value, 0)
    return (sum / studentGrades.length).toFixed(2)
  }

  const handleSaveGrade = async () => {
    // TODO: Implement save grade via API
    console.log('Saving grade:', { editingGrade, gradeValue })
    setEditingGrade(null)
    setGradeValue('')
  }

  const handleCancelEdit = () => {
    setEditingGrade(null)
    setGradeValue('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Электронный журнал</h1>
          <p className="text-gray-500 mt-1">
            {classInfo.name} • {subject.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="info">{term ? `${term.term} четверть` : '2026-2027'}</Badge>
          <Button variant="default">
            <Save className="h-4 w-4 mr-2" />
            Сохранить изменения
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Учеников</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Оценок выставлено</p>
                <p className="text-2xl font-bold">{grades.length}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Средний балл</p>
                <p className="text-2xl font-bold">
                  {grades.length > 0
                    ? (grades.reduce((acc, g) => acc + g.grade_value, 0) / grades.length).toFixed(2)
                    : '—'}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Посещаемость</p>
                <p className="text-2xl font-bold">
                  {attendance.length > 0
                    ? `${Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)}%`
                    : '—'}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journal Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Журнал оценок</CardTitle>
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Добавить дату
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="sticky left-0 bg-white z-10 p-3 text-left font-semibold min-w-[200px] border-r border-gray-200">
                    Ученик
                  </th>
                  {dates.map(date => (
                    <th key={date} className="p-3 text-center font-semibold min-w-[80px] border-r border-gray-100">
                      <div className="text-xs">{formatDate(date, 'short')}</div>
                    </th>
                  ))}
                  <th className="p-3 text-center font-semibold bg-gray-50 min-w-[80px]">
                    Средний
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const avg = getStudentAverage(student.id)

                  return (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="sticky left-0 bg-white z-10 p-3 border-r border-gray-200 font-medium">
                        {student.profiles?.full_name || 'Ученик'}
                      </td>
                      {dates.map(date => {
                        const grade = getGrade(student.id, date)
                        const att = getAttendance(student.id, date)
                        const isEditing = editingGrade?.studentId === student.id && editingGrade?.date === date

                        return (
                          <td
                            key={date}
                            className="p-2 text-center border-r border-gray-100 cursor-pointer hover:bg-blue-50"
                            onClick={() => {
                              if (!isEditing) {
                                setEditingGrade({ studentId: student.id, date })
                                setGradeValue(grade?.grade_value?.toString() || '')
                              }
                            }}
                          >
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={gradeValue}
                                  onChange={(e) => setGradeValue(e.target.value)}
                                  className="w-16 h-8 text-center"
                                  min="1"
                                  max="5"
                                  autoFocus
                                />
                                <Button size="sm" variant="ghost" onClick={handleSaveGrade}>
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <div>
                                {grade && (
                                  <Badge
                                    variant={
                                      grade.grade_value >= 4 ? 'success' :
                                      grade.grade_value >= 3 ? 'warning' :
                                      'error'
                                    }
                                    className="font-bold"
                                  >
                                    {grade.grade_value}
                                  </Badge>
                                )}
                                {att && !grade && (
                                  <Badge
                                    className={getAttendanceStatusColor(att.status)}
                                  >
                                    {att.status === 'present' ? 'П' :
                                     att.status === 'absent' ? 'Н' :
                                     att.status === 'excused' ? 'У' : 'О'}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </td>
                        )
                      })}
                      <td className="p-3 text-center bg-gray-50 font-bold">
                        {avg ? (
                          <Badge variant={
                            parseFloat(avg) >= 4 ? 'success' :
                            parseFloat(avg) >= 3 ? 'warning' :
                            'error'
                          }>
                            {avg}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">Учеников в классе нет</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Инструкция:</strong> Нажмите на ячейку для выставления оценки.
            Используйте клавишу Enter для быстрого сохранения.
            Оценки: 5 (отлично), 4 (хорошо), 3 (удовлетворительно), 2 (неудовлетворительно).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
