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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))] tracking-[var(--letter-spacing-tight)]">
            Домашние задания
          </h1>
          <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">
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
        <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">
                  {role === 'teacher' ? 'Всего заданий' : 'Доступно заданий'}
                </p>
                <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">{stats.total}</p>
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
                <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">
                  {role === 'teacher' ? 'Опубликовано' : 'Сдано'}
                </p>
                <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">
                  {role === 'teacher' ? stats.published : stats.submitted}
                </p>
              </div>
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-success-light))] flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[rgb(var(--color-success))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">
                  {role === 'teacher' ? 'Черновиков' : 'Ожидает сдачи'}
                </p>
                <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">
                  {role === 'teacher' ? stats.draft : stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-warning-light))] flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[rgb(var(--color-warning))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))]">Просрочено</p>
                <p className="text-[var(--font-size-3xl)] font-bold text-[rgb(var(--color-text-primary))]">{stats.overdue}</p>
              </div>
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[rgb(var(--color-error-light))] flex items-center justify-center">
                <XCircle className="h-6 w-6 text-[rgb(var(--color-error))]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader className="border-b border-[rgb(var(--color-border-subtle))]">
          <CardTitle>
            {role === 'teacher' ? 'Мои задания' : 'Список заданий'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {assignments.map(assignment => {
              const submission = role === 'student' ? getSubmissionStatus(assignment.id) : null
              const overdue = isOverdue(assignment.due_date)

              return (
                <div
                  key={assignment.id}
                  className="border border-[rgb(var(--color-border))] rounded-[var(--radius-md)] p-4 hover:shadow-[var(--shadow-md)] transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[var(--font-size-lg)] text-[rgb(var(--color-text-primary))]">{assignment.title}</h3>
                        {getStatusBadge(assignment)}
                      </div>

                      <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-text-secondary))] mb-3 line-clamp-2">
                        {assignment.description}
                      </p>

                      <div className="flex items-center gap-4 text-[var(--font-size-sm)] text-[rgb(var(--color-text-tertiary))]">
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
                        <div className="mt-3 p-3 bg-[rgb(var(--color-success-light))] rounded-[var(--radius-md)] border border-[rgb(var(--color-success))]/20">
                          <p className="text-[var(--font-size-sm)] text-[rgb(var(--color-success))]">
                            Оценка: <strong>{submission.grade}</strong> из {assignment.max_grade}
                          </p>
                          {submission.feedback && (
                            <p className="text-[var(--font-size-xs)] text-[rgb(var(--color-success))] mt-1">
                              {submission.feedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
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
                <BookOpen className="h-12 w-12 text-[rgb(var(--color-text-tertiary))] mx-auto mb-3 opacity-50" />
                <p className="text-[rgb(var(--color-text-tertiary))]">
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
