-- VAVILON Row Level Security Policies
-- Ensures multi-school data isolation and role-based access control

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's role in a specific school
CREATE OR REPLACE FUNCTION get_user_role_in_school(user_id_param UUID, school_id_param UUID)
RETURNS user_role AS $$
  SELECT role FROM school_memberships
  WHERE user_id = user_id_param
    AND school_id = school_id_param
    AND is_active = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM school_memberships
    WHERE user_id = user_id_param
      AND role = 'platform_admin'
      AND is_active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is school admin in a school
CREATE OR REPLACE FUNCTION is_school_admin(user_id_param UUID, school_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM school_memberships
    WHERE user_id = user_id_param
      AND school_id = school_id_param
      AND role = 'school_admin'
      AND is_active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is member of a school
CREATE OR REPLACE FUNCTION is_school_member(user_id_param UUID, school_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM school_memberships
    WHERE user_id = user_id_param
      AND school_id = school_id_param
      AND is_active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get student's school ID
CREATE OR REPLACE FUNCTION get_student_school_id(user_id_param UUID)
RETURNS UUID AS $$
  SELECT school_id FROM student_profiles
  WHERE user_id = user_id_param
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Get teacher's school ID
CREATE OR REPLACE FUNCTION get_teacher_school_id(user_id_param UUID)
RETURNS UUID AS $$
  SELECT school_id FROM teacher_profiles
  WHERE user_id = user_id_param
  LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if teacher teaches a class
CREATE OR REPLACE FUNCTION teacher_teaches_class(teacher_user_id UUID, class_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM teacher_assignments ta
    JOIN teacher_profiles tp ON ta.teacher_profile_id = tp.id
    WHERE tp.user_id = teacher_user_id
      AND ta.class_id = class_id_param
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if student is in a class
CREATE OR REPLACE FUNCTION student_in_class(student_user_id UUID, class_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN student_profiles sp ON ce.student_profile_id = sp.id
    WHERE sp.user_id = student_user_id
      AND ce.class_id = class_id_param
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if parent has access to student
CREATE OR REPLACE FUNCTION parent_has_student_access(parent_user_id UUID, student_profile_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM parent_student_relationships psr
    JOIN parent_profiles pp ON psr.parent_profile_id = pp.id
    WHERE pp.user_id = parent_user_id
      AND psr.student_profile_id = student_profile_id_param
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- School admins can read profiles in their school
CREATE POLICY "School admins can read school profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school_memberships sm1
      JOIN school_memberships sm2 ON sm1.school_id = sm2.school_id
      WHERE sm1.user_id = auth.uid()
        AND sm1.role = 'school_admin'
        AND sm1.is_active = true
        AND sm2.user_id = profiles.id
    )
  );

-- ============================================================================
-- SCHOOLS POLICIES
-- ============================================================================

-- Platform admins can manage all schools
CREATE POLICY "Platform admins can manage schools"
  ON schools FOR ALL
  USING (is_platform_admin(auth.uid()));

-- School members can read their schools
CREATE POLICY "School members can read their schools"
  ON schools FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM school_memberships
      WHERE user_id = auth.uid()
        AND school_id = schools.id
        AND is_active = true
    )
  );

-- ============================================================================
-- SCHOOL MEMBERSHIPS POLICIES
-- ============================================================================

-- Users can read their own memberships
CREATE POLICY "Users can read own memberships"
  ON school_memberships FOR SELECT
  USING (user_id = auth.uid());

-- School admins can read memberships in their school
CREATE POLICY "School admins can read school memberships"
  ON school_memberships FOR SELECT
  USING (is_school_admin(auth.uid(), school_id));

-- School admins can manage memberships in their school (except platform_admin role)
CREATE POLICY "School admins can manage memberships"
  ON school_memberships FOR ALL
  USING (
    is_school_admin(auth.uid(), school_id)
    AND role != 'platform_admin'
  );

-- ============================================================================
-- CLASSES POLICIES
-- ============================================================================

-- School members can read classes in their school
CREATE POLICY "School members can read classes"
  ON classes FOR SELECT
  USING (is_school_member(auth.uid(), school_id));

-- School admins can manage classes
CREATE POLICY "School admins can manage classes"
  ON classes FOR ALL
  USING (is_school_admin(auth.uid(), school_id));

-- ============================================================================
-- SUBJECTS POLICIES
-- ============================================================================

-- School members can read subjects
CREATE POLICY "School members can read subjects"
  ON subjects FOR SELECT
  USING (is_school_member(auth.uid(), school_id));

-- School admins can manage subjects
CREATE POLICY "School admins can manage subjects"
  ON subjects FOR ALL
  USING (is_school_admin(auth.uid(), school_id));

-- ============================================================================
-- STUDENT PROFILES POLICIES
-- ============================================================================

-- Students can read their own profile
CREATE POLICY "Students can read own profile"
  ON student_profiles FOR SELECT
  USING (user_id = auth.uid());

-- School staff can read student profiles
CREATE POLICY "School staff can read student profiles"
  ON student_profiles FOR SELECT
  USING (
    is_school_member(auth.uid(), school_id)
    AND get_user_role_in_school(auth.uid(), school_id) IN ('school_admin', 'teacher')
  );

-- Parents can read their children's profiles
CREATE POLICY "Parents can read children profiles"
  ON student_profiles FOR SELECT
  USING (parent_has_student_access(auth.uid(), id));

-- School admins can manage student profiles
CREATE POLICY "School admins can manage student profiles"
  ON student_profiles FOR ALL
  USING (is_school_admin(auth.uid(), school_id));

-- ============================================================================
-- TEACHER PROFILES POLICIES
-- ============================================================================

-- Teachers can read their own profile
CREATE POLICY "Teachers can read own profile"
  ON teacher_profiles FOR SELECT
  USING (user_id = auth.uid());

-- School members can read teacher profiles
CREATE POLICY "School members can read teacher profiles"
  ON teacher_profiles FOR SELECT
  USING (is_school_member(auth.uid(), school_id));

-- School admins can manage teacher profiles
CREATE POLICY "School admins can manage teacher profiles"
  ON teacher_profiles FOR ALL
  USING (is_school_admin(auth.uid(), school_id));

-- ============================================================================
-- PARENT PROFILES POLICIES
-- ============================================================================

-- Parents can read their own profile
CREATE POLICY "Parents can read own profile"
  ON parent_profiles FOR SELECT
  USING (user_id = auth.uid());

-- School staff can read parent profiles
CREATE POLICY "School staff can read parent profiles"
  ON parent_profiles FOR SELECT
  USING (
    is_school_member(auth.uid(), school_id)
    AND get_user_role_in_school(auth.uid(), school_id) IN ('school_admin', 'teacher')
  );

-- School admins can manage parent profiles
CREATE POLICY "School admins can manage parent profiles"
  ON parent_profiles FOR ALL
  USING (is_school_admin(auth.uid(), school_id));

-- ============================================================================
-- GRADES POLICIES
-- ============================================================================

-- Students can read their own grades
CREATE POLICY "Students can read own grades"
  ON grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE id = grades.student_profile_id
        AND user_id = auth.uid()
    )
  );

-- Parents can read their children's grades
CREATE POLICY "Parents can read children grades"
  ON grades FOR SELECT
  USING (parent_has_student_access(auth.uid(), student_profile_id));

-- Teachers can read grades for their classes
CREATE POLICY "Teachers can read class grades"
  ON grades FOR SELECT
  USING (teacher_teaches_class(auth.uid(), class_id));

-- Teachers can insert/update grades for their assignments
CREATE POLICY "Teachers can manage grades for their classes"
  ON grades FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN teacher_assignments ta ON tp.id = ta.teacher_profile_id
      WHERE tp.user_id = auth.uid()
        AND ta.class_id = grades.class_id
        AND ta.subject_id = grades.subject_id
    )
  );

-- School admins can manage all grades in their school
CREATE POLICY "School admins can manage grades"
  ON grades FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = grades.class_id
        AND is_school_admin(auth.uid(), school_id)
    )
  );

-- ============================================================================
-- ATTENDANCE POLICIES
-- ============================================================================

-- Students can read their own attendance
CREATE POLICY "Students can read own attendance"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE id = attendance_records.student_profile_id
        AND user_id = auth.uid()
    )
  );

-- Parents can read their children's attendance
CREATE POLICY "Parents can read children attendance"
  ON attendance_records FOR SELECT
  USING (parent_has_student_access(auth.uid(), student_profile_id));

-- Teachers can read/manage attendance for their classes
CREATE POLICY "Teachers can manage class attendance"
  ON attendance_records FOR ALL
  USING (teacher_teaches_class(auth.uid(), class_id));

-- School admins can manage all attendance
CREATE POLICY "School admins can manage attendance"
  ON attendance_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE id = attendance_records.class_id
        AND is_school_admin(auth.uid(), school_id)
    )
  );

-- ============================================================================
-- TIMETABLE POLICIES
-- ============================================================================

-- School members can read timetables
CREATE POLICY "School members can read timetables"
  ON timetable_entries FOR SELECT
  USING (is_school_member(auth.uid(), school_id));

-- School admins can manage timetables
CREATE POLICY "School admins can manage timetables"
  ON timetable_entries FOR ALL
  USING (is_school_admin(auth.uid(), school_id));

-- ============================================================================
-- ASSIGNMENTS POLICIES
-- ============================================================================

-- Students can read assignments for their classes
CREATE POLICY "Students can read class assignments"
  ON assignments FOR SELECT
  USING (student_in_class(auth.uid(), class_id));

-- Parents can read assignments for their children's classes
CREATE POLICY "Parents can read children assignments"
  ON assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relationships psr
      JOIN parent_profiles pp ON psr.parent_profile_id = pp.id
      JOIN class_enrollments ce ON psr.student_profile_id = ce.student_profile_id
      WHERE pp.user_id = auth.uid()
        AND ce.class_id = assignments.class_id
    )
  );

-- Teachers can manage assignments for their classes
CREATE POLICY "Teachers can manage class assignments"
  ON assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles tp
      JOIN teacher_assignments ta ON tp.id = ta.teacher_profile_id
      WHERE tp.user_id = auth.uid()
        AND ta.class_id = assignments.class_id
        AND ta.subject_id = assignments.subject_id
    )
  );

-- School admins can manage all assignments
CREATE POLICY "School admins can manage assignments"
  ON assignments FOR ALL
  USING (is_school_admin(auth.uid(), school_id));

-- ============================================================================
-- ASSIGNMENT SUBMISSIONS POLICIES
-- ============================================================================

-- Students can manage their own submissions
CREATE POLICY "Students can manage own submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE id = assignment_submissions.student_profile_id
        AND user_id = auth.uid()
    )
  );

-- Teachers can read/grade submissions for their assignments
CREATE POLICY "Teachers can manage submissions"
  ON assignment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN teacher_profiles tp ON a.teacher_profile_id = tp.id
      WHERE a.id = assignment_submissions.assignment_id
        AND tp.user_id = auth.uid()
    )
  );

-- Parents can read their children's submissions
CREATE POLICY "Parents can read children submissions"
  ON assignment_submissions FOR SELECT
  USING (parent_has_student_access(auth.uid(), student_profile_id));

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- School staff can create notifications
CREATE POLICY "School staff can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    is_school_member(auth.uid(), school_id)
    AND get_user_role_in_school(auth.uid(), school_id) IN ('school_admin', 'teacher')
  );

-- ============================================================================
-- ANNOUNCEMENTS POLICIES
-- ============================================================================

-- School members can read announcements
CREATE POLICY "School members can read announcements"
  ON announcements FOR SELECT
  USING (is_school_member(auth.uid(), school_id));

-- School staff can create announcements
CREATE POLICY "School staff can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    is_school_member(auth.uid(), school_id)
    AND get_user_role_in_school(auth.uid(), school_id) IN ('school_admin', 'teacher')
  );

-- Authors can update/delete their announcements
CREATE POLICY "Authors can manage own announcements"
  ON announcements FOR ALL
  USING (author_id = auth.uid());

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Conversation members can read messages
CREATE POLICY "Conversation members can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- Conversation members can send messages
CREATE POLICY "Conversation members can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- LEARNING MATERIALS POLICIES
-- ============================================================================

-- Students can read materials for their classes
CREATE POLICY "Students can read class materials"
  ON learning_materials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM material_access ma
      JOIN class_enrollments ce ON ma.class_id = ce.class_id
      JOIN student_profiles sp ON ce.student_profile_id = sp.id
      WHERE ma.learning_material_id = learning_materials.id
        AND sp.user_id = auth.uid()
    )
  );

-- Teachers can manage their materials
CREATE POLICY "Teachers can manage own materials"
  ON learning_materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teacher_profiles
      WHERE id = learning_materials.teacher_profile_id
        AND user_id = auth.uid()
    )
  );

-- School admins can manage all materials
CREATE POLICY "School admins can manage materials"
  ON learning_materials FOR ALL
  USING (is_school_admin(auth.uid(), school_id));
