export type UserRole = 'platform_admin' | 'school_admin' | 'teacher' | 'student' | 'parent'

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late'

export type AssignmentStatus = 'draft' | 'published' | 'in_progress' | 'submitted' | 'graded' | 'overdue'

export type NotificationType = 'grade' | 'assignment' | 'attendance' | 'announcement' | 'message' | 'timetable_change' | 'general'

export type AcademicTerm = 'first' | 'second' | 'third' | 'fourth'

export interface School {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  date_of_birth?: string
  created_at: string
  updated_at: string
}

export interface SchoolMembership {
  id: string
  user_id: string
  school_id: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AcademicYear {
  id: string
  school_id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
  updated_at: string
}

export interface AcademicTermModel {
  id: string
  academic_year_id: string
  term: AcademicTerm
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  school_id: string
  name: string
  code: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  school_id: string
  academic_year_id: string
  name: string
  grade: number
  section?: string
  class_teacher_id?: string
  created_at: string
  updated_at: string
}

export interface StudentProfile {
  id: string
  user_id: string
  school_id: string
  student_id_number?: string
  enrollment_date?: string
  created_at: string
  updated_at: string
}

export interface TeacherProfile {
  id: string
  user_id: string
  school_id: string
  employee_id_number?: string
  hire_date?: string
  created_at: string
  updated_at: string
}

export interface ParentProfile {
  id: string
  user_id: string
  school_id: string
  created_at: string
  updated_at: string
}

export interface ClassEnrollment {
  id: string
  student_profile_id: string
  class_id: string
  enrollment_date: string
  created_at: string
  updated_at: string
}

export interface TeacherAssignment {
  id: string
  teacher_profile_id: string
  class_id: string
  subject_id: string
  created_at: string
  updated_at: string
}

export interface Classroom {
  id: string
  school_id: string
  name: string
  building?: string
  capacity?: number
  created_at: string
  updated_at: string
}

export interface LessonPeriod {
  id: string
  school_id: string
  name: string
  start_time: string
  end_time: string
  period_order: number
  created_at: string
  updated_at: string
}

export interface TimetableEntry {
  id: string
  school_id: string
  class_id: string
  subject_id: string
  teacher_profile_id: string
  classroom_id?: string
  lesson_period_id: string
  day_of_week: number
  created_at: string
  updated_at: string
}

export interface Grade {
  id: string
  student_profile_id: string
  class_id: string
  subject_id: string
  academic_term_id: string
  teacher_profile_id: string
  grade_value: number
  max_grade: number
  grade_type?: string
  grade_date: string
  comment?: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string
}

export interface AttendanceRecord {
  id: string
  student_profile_id: string
  class_id: string
  attendance_date: string
  status: AttendanceStatus
  lesson_period_id?: string
  subject_id?: string
  recorded_by: string
  note?: string
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  school_id: string
  class_id: string
  subject_id: string
  teacher_profile_id: string
  title: string
  description: string
  due_date: string
  max_points?: number
  status: AssignmentStatus
  created_at: string
  updated_at: string
}

export interface AssignmentSubmission {
  id: string
  assignment_id: string
  student_profile_id: string
  submission_text?: string
  submitted_at: string
  grade?: number
  feedback?: string
  graded_at?: string
  graded_by?: string
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  school_id: string
  author_id: string
  title: string
  content: string
  target_audience?: UserRole[]
  class_id?: string
  published_at: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  school_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

export interface CalendarEvent {
  id: string
  school_id: string
  title: string
  description?: string
  event_date: string
  start_time?: string
  end_time?: string
  location?: string
  created_by: string
  created_at: string
  updated_at: string
}
