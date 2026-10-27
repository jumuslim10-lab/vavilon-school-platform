'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Plus,
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import CreateAssignmentModal from './create-assignment-modal'
import AssignmentDetailsModal from './assignment-details-modal'
import SubmitAssignmentModal from './submit-assignment-modal'

interface AssignmentsClientProps {
  role: string
  assignments: any[]
  submissions: any[]
  teacherProfileId?: string
  studentProfileId?: string
  schoolId: string
}

export default function AssignmentsClient({
  role,
  assignments,
  submissions,
  teacherProfileId,
  studentProfileId,
  schoolId
}: AssignmentsClientProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Get submission status for an assignment
  const getSubmissionStatus = (assignmentId: string) => {
    return submissions.find(s => s.assignment_id === assignmentId)
  }

  // Check if assignment is overdue
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  // Get status badge for assignment
  const getStatusBadge = (assignment: any) => {
    if (role === 'teacher') {
      const submissionCount = assignment.assignment_submissions?.[0]?.count || 0
      return (
        <Badge variant={assignment.status === 'published' ? 'success' : 'default'}>
          {assignment.status === 'published' ? 'Опубликовано' : 'Черновик'}
        </Badge>
      )
    } else {
      const submission = getSubmissionStatus(assignment.id)
      if (!submission) {
        return isOverdue(assignment.due_date) ? (
          <Badge variant="error">Просрочено</Badge>
        ) : (
          <Badge variant="warning">Не сдано</Badge>
        )
      }
      if (submission.status === 'submitted') {
        return <Badge variant="info">На проверке</Badge>
      }
      if (submission.status === 'graded') {
        return <Badge variant="success">Проверено</Badge>
      }
      return <Badge variant="default">{submission.status}</Badge>
    }
  }

  // Calculate statistics
  const stats = role === 'teacher'
    ? {
        total: assignments.length,
        published: assignments.filter(a => a.status === 'published').length,
        draft: assignments.filter(a => a.status === 'draft').length,
        overdue: assignments.filter(a => a.status === 'published' && isOverdue(a.due_date)).length
      }
    : {
        total: assignments.length,
        submitted: submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length,
        pending: assignments.filter(a => !getSubmissionStatus(a.id)).length,
        overdue: assignments.filter(a => !getSubmissionStatus(a.id) && isOverdue(a.due_date)).length
      }

  const handleViewDetails = (assignment: any) => {
    setSelectedAssignment(assignment)
    setShowDetailsModal(true)
  }

  const handleSubmit = (assignment: any) => {
    setSelectedAssignment(assignment)
    setShowSubmitModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Домашние задания</h1>
          <p className="text-gray-500 mt-1">
            {role === 'teacher' ? 'Управление заданиями' : 'Мои задания'}
          </p>
        </div>
        {role === 'teacher' && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать задание
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {role === 'teacher' ? 'Всего заданий' : 'Доступно заданий'}
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {role === 'teacher' ? 'Опубликовано' : 'Сдано'}
                </p>
                <p className="text-2xl font-bold">
                  {role === 'teacher' ? stats.published : stats.submitted}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {role === 'teacher' ? 'Черновиков' : 'Ожидает сдачи'}
                </p>
                <p className="text-2xl font-bold">
                  {role === 'teacher' ? stats.draft : stats.pending}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Просрочено</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {role === 'teacher' ? 'Мои задания' : 'Список заданий'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.map(assignment => {
              const submission = role === 'student' ? getSubmissionStatus(assignment.id) : null
              const overdue = isOverdue(assignment.due_date)

              return (
                <div
                  key={assignment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        {getStatusBadge(assignment)}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {assignment.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {role === 'teacher'
                            ? assignment.classes?.name
                            : assignment.subjects?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Срок: {formatDate(assignment.due_date, 'short')}
                        </span>
                        {assignment.max_grade && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Макс. балл: {assignment.max_grade}
                          </span>
                        )}
                      </div>

                      {role === 'student' && submission?.status === 'graded' && (
                        <div className="mt-3 p-2 bg-green-50 rounded-md">
                          <p className="text-sm text-green-800">
                            Оценка: <strong>{submission.grade}</strong> из {assignment.max_grade}
                          </p>
                          {submission.feedback && (
                            <p className="text-xs text-green-700 mt-1">
                              {submission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(assignment)}
                      >
                        Подробнее
                      </Button>

                      {role === 'student' && !submission && (
                        <Button
                          size="sm"
                          onClick={() => handleSubmit(assignment)}
                          disabled={overdue}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Сдать
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {assignments.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">
                  {role === 'teacher'
                    ? 'Вы еще не создали ни одного задания'
                    : 'Нет доступных заданий'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {role === 'teacher' && showCreateModal && (
        <CreateAssignmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          teacherProfileId={teacherProfileId!}
          schoolId={schoolId}
        />
      )}

      {showDetailsModal && selectedAssignment && (
        <AssignmentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          assignment={selectedAssignment}
          submission={role === 'student' ? getSubmissionStatus(selectedAssignment.id) : null}
          role={role}
        />
      )}

      {role === 'student' && showSubmitModal && selectedAssignment && (
        <SubmitAssignmentModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          assignment={selectedAssignment}
          studentProfileId={studentProfileId!}
        />
      )}
    </div>
  )
}
