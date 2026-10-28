// Database Query Helpers
// Copy this to src/lib/supabase/queries.ts

import { supabase } from './client'

// ============================================================================
// GRADES
// ============================================================================

export async function getStudentGrades(studentProfileId: string) {
  const { data, error } = await supabase
    .from('grades')
    .select(`
      *,
      subjects(name, code),
      teacher_profiles(profiles(full_name))
    `)
    .eq('student_profile_id', studentProfileId)
    .order('grade_date', { ascending: false })

  if (error) throw error
  return data
}

export async function createGrade(grade: {
  student_profile_id: string
  subject_id: string
  class_id: string
  teacher_profile_id: string
  grade_value: number
  grade_date: string
  grade_type?: string
  comment?: string
}) {
  const { data, error } = await supabase
    .from('grades')
    .insert(grade)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// ATTENDANCE
// ============================================================================

export async function getStudentAttendance(
  studentProfileId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('attendance_records')
    .select('*')
    .eq('student_profile_id', studentProfileId)
    .order('attendance_date', { ascending: false })

  if (startDate) query = query.gte('attendance_date', startDate)
  if (endDate) query = query.lte('attendance_date', endDate)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function markAttendance(attendance: {
  student_profile_id: string
  class_id: string
  attendance_date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  comment?: string
  recorded_by?: string
}) {
  const { data, error } = await supabase
    .from('attendance_records')
    .upsert(attendance, {
      onConflict: 'student_profile_id,class_id,attendance_date'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// ASSIGNMENTS
// ============================================================================

export async function getClassAssignments(classId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      subjects(name, code),
      teacher_profiles(profiles(full_name))
    `)
    .eq('class_id', classId)
    .eq('status', 'published')
    .order('due_date', { ascending: true })

  if (error) throw error
  return data
}

export async function createAssignment(assignment: {
  teacher_profile_id: string
  class_id: string
  subject_id: string
  title: string
  description?: string
  due_date: string
  max_grade?: number
  status?: 'draft' | 'published'
}) {
  const { data, error } = await supabase
    .from('assignments')
    .insert(assignment)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function submitAssignment(submission: {
  assignment_id: string
  student_profile_id: string
  content?: string
  file_url?: string
}) {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert({
      ...submission,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// TIMETABLE
// ============================================================================

export async function getClassTimetable(classId: string) {
  const { data, error } = await supabase
    .from('timetable_entries')
    .select(`
      *,
      subjects(name, code),
      teacher_profiles(profiles(full_name)),
      classrooms(name, building),
      lesson_periods(name, start_time, end_time, period_order)
    `)
    .eq('class_id', classId)
    .order('day_of_week')
    .order('lesson_periods(period_order)')

  if (error) throw error
  return data
}

// ============================================================================
// CLASSES
// ============================================================================

export async function getSchoolClasses(schoolId: string) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('school_id', schoolId)
    .order('grade')
    .order('section')

  if (error) throw error
  return data
}

// ============================================================================
// SUBJECTS
// ============================================================================

export async function getSchoolSubjects(schoolId: string) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', schoolId)
    .order('name')

  if (error) throw error
  return data
}

// ============================================================================
// STUDENTS
// ============================================================================

export async function getClassStudents(classId: string) {
  const { data, error } = await supabase
    .from('class_enrollments')
    .select(`
      *,
      student_profiles(
        id,
        user_id,
        student_code,
        profiles(full_name, email)
      )
    `)
    .eq('class_id', classId)

  if (error) throw error
  return data
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages(content, created_at)
    `)
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
}
