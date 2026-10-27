'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Save, Users, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AttendanceClientProps {
  classInfo: any
  students: any[]
  todayAttendance: any[]
  recentAttendance: any[]
  classId: string
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export default function AttendanceClient({
  classInfo,
  students,
  todayAttendance,
  recentAttendance,
  classId
}: AttendanceClientProps) {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {}
    todayAttendance.forEach(record => {
      initial[record.student_profile_id] = record.status
    })
    return initial
  })
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    todayAttendance.forEach(record => {
      if (record.notes) initial[record.student_profile_id] = record.notes
    })
    return initial
  })
  const [saving, setSaving] = useState(false)

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes(prev => ({ ...prev, [studentId]: note }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      // Delete existing attendance for today
      await supabase
        .from('attendance_records')
        .delete()
        .eq('class_id', classId)
        .eq('attendance_date', selectedDate)

      // Insert new attendance records
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        student_profile_id: studentId,
        class_id: classId,
        attendance_date: selectedDate,
        status,
        notes: notes[studentId] || null
      }))

      const { error } = await supabase
        .from('attendance_records')
        .insert(records)

      if (error) throw error

      window.location.reload()
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Ошибка при сохранении посещаемости')
    } finally {
      setSaving(false)
    }
  }

  // Calculate statistics
  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length
  const lateCount = Object.values(attendance).filter(s => s === 'late').length
  const excusedCount = Object.values(attendance).filter(s => s === 'excused').length
  const unmarkedCount = students.length - Object.keys(attendance).length

  // Calculate recent stats
  const recentStats = students.map(student => {
    const records = recentAttendance.filter(r => r.student_profile_id === student.id)
    const present = records.filter(r => r.status === 'present').length
    const absent = records.filter(r => r.status === 'absent').length
    const total = records.length
    return {
      studentId: student.id,
      present,
      absent,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 0
    }
  })

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-300'
      case 'absent': return 'bg-red-100 text-red-800 border-red-300'
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5" />
      case 'absent': return <XCircle className="h-5 w-5" />
      case 'late': return <AlertCircle className="h-5 w-5" />
      case 'excused': return <AlertCircle className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Посещаемость</h1>
          <p className="text-gray-500 mt-1">{classInfo.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Присутствуют</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Отсутствуют</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Опоздали</p>
                <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">По уважит.</p>
                <p className="text-2xl font-bold text-blue-600">{excusedCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Не отмечено</p>
                <p className="text-2xl font-bold text-gray-600">{unmarkedCount}</p>
              </div>
              <Users className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance marking */}
      <Card>
        <CardHeader>
          <CardTitle>Отметить посещаемость</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.map((student, index) => {
              const studentStats = recentStats.find(s => s.studentId === student.id)
              const currentStatus = attendance[student.id]

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.profiles?.full_name}</p>
                      <p className="text-xs text-gray-500">
                        За 7 дней: {studentStats?.rate}% ({studentStats?.present}/{studentStats?.total})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`p-2 border rounded-md transition-all ${
                            currentStatus === status
                              ? getStatusColor(status) + ' border-2'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                          title={
                            status === 'present' ? 'Присутствует' :
                            status === 'absent' ? 'Отсутствует' :
                            status === 'late' ? 'Опоздал' :
                            'По уважительной причине'
                          }
                        >
                          {getStatusIcon(status)}
                        </button>
                      ))}
                    </div>

                    {currentStatus && (
                      <input
                        type="text"
                        placeholder="Примечание..."
                        value={notes[student.id] || ''}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        className="w-48 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              )
            })}

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">Учеников в классе нет</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Присутствует</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Отсутствует</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span>Опоздал</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span>По уважительной причине</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
