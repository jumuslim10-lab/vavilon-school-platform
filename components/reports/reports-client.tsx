'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { BarChart3, Download, FileText, TrendingUp, Users, Calendar } from 'lucide-react'

interface ReportsClientProps {
  schoolId: string
  role: string
  stats: {
    totalStudents: number
    totalTeachers: number
    totalClasses: number
    averageGrade: number
    attendanceRate: number
  }
  gradesBySubject: any[]
  attendanceByClass: any[]
}

export default function ReportsClient({
  schoolId,
  role,
  stats,
  gradesBySubject,
  attendanceByClass
}: ReportsClientProps) {
  const [reportType, setReportType] = useState<string>('overview')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const handleExportPDF = () => {
    alert('Функция экспорта в PDF будет доступна в следующей версии')
  }

  const getGradeColor = (avg: number) => {
    if (avg >= 4.5) return 'text-green-600'
    if (avg >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Отчеты и аналитика</h1>
          <p className="text-gray-500 mt-1">Статистика успеваемости и посещаемости</p>
        </div>
        <Button onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Экспорт в PDF
        </Button>
      </div>

      {/* Report type selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button
                variant={reportType === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReportType('overview')}
              >
                Обзор
              </Button>
              <Button
                variant={reportType === 'grades' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReportType('grades')}
              >
                Успеваемость
              </Button>
              <Button
                variant={reportType === 'attendance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReportType('attendance')}
              >
                Посещаемость
              </Button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <span className="text-gray-500">—</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Statistics */}
      {reportType === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Учеников</p>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Учителей</p>
                    <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Классов</p>
                    <p className="text-2xl font-bold">{stats.totalClasses}</p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Средний балл</p>
                    <p className={`text-2xl font-bold ${getGradeColor(stats.averageGrade)}`}>
                      {stats.averageGrade.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Посещаемость</p>
                    <p className={`text-2xl font-bold ${getAttendanceColor(stats.attendanceRate)}`}>
                      {stats.attendanceRate.toFixed(1)}%
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Успеваемость по предметам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gradesBySubject.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.subject_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.avg_grade >= 4 ? 'success' : item.avg_grade >= 3 ? 'warning' : 'error'}>
                          {item.avg_grade.toFixed(2)}
                        </Badge>
                        <span className="text-xs text-gray-500">({item.count} оценок)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Посещаемость по классам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceByClass.slice(0, 8).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.class_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.attendance_rate >= 90 ? 'success' : item.attendance_rate >= 75 ? 'warning' : 'error'}>
                          {item.attendance_rate.toFixed(1)}%
                        </Badge>
                        <span className="text-xs text-gray-500">({item.present}/{item.total})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Grades Report */}
      {reportType === 'grades' && (
        <Card>
          <CardHeader>
            <CardTitle>Детальная статистика успеваемости</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-semibold">Предмет</th>
                    <th className="text-center p-3 font-semibold">Средний балл</th>
                    <th className="text-center p-3 font-semibold">Оценок</th>
                    <th className="text-center p-3 font-semibold">Отлично (5)</th>
                    <th className="text-center p-3 font-semibold">Хорошо (4)</th>
                    <th className="text-center p-3 font-semibold">Удовл. (3)</th>
                    <th className="text-center p-3 font-semibold">Неудовл. (2)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gradesBySubject.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.subject_name}</td>
                      <td className="p-3 text-center">
                        <Badge variant={item.avg_grade >= 4 ? 'success' : item.avg_grade >= 3 ? 'warning' : 'error'}>
                          {item.avg_grade.toFixed(2)}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">{item.count}</td>
                      <td className="p-3 text-center text-green-600 font-semibold">{item.grade_5 || 0}</td>
                      <td className="p-3 text-center text-blue-600 font-semibold">{item.grade_4 || 0}</td>
                      <td className="p-3 text-center text-yellow-600 font-semibold">{item.grade_3 || 0}</td>
                      <td className="p-3 text-center text-red-600 font-semibold">{item.grade_2 || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Report */}
      {reportType === 'attendance' && (
        <Card>
          <CardHeader>
            <CardTitle>Детальная статистика посещаемости</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-semibold">Класс</th>
                    <th className="text-center p-3 font-semibold">Посещаемость</th>
                    <th className="text-center p-3 font-semibold">Присутствовали</th>
                    <th className="text-center p-3 font-semibold">Отсутствовали</th>
                    <th className="text-center p-3 font-semibold">Опоздали</th>
                    <th className="text-center p-3 font-semibold">Уважит. причина</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceByClass.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.class_name}</td>
                      <td className="p-3 text-center">
                        <Badge variant={item.attendance_rate >= 90 ? 'success' : item.attendance_rate >= 75 ? 'warning' : 'error'}>
                          {item.attendance_rate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-green-600 font-semibold">{item.present}</td>
                      <td className="p-3 text-center text-red-600 font-semibold">{item.absent || 0}</td>
                      <td className="p-3 text-center text-yellow-600 font-semibold">{item.late || 0}</td>
                      <td className="p-3 text-center text-blue-600 font-semibold">{item.excused || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
