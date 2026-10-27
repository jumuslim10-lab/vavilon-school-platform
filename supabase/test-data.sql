-- Создание тестовой школы и данных для VAVILON

-- 1. Создание школы
INSERT INTO schools (name, address, phone, email, website)
VALUES ('Средняя школа №1 г. Бишкек', 'г. Бишкек, ул. Ленина 1', '+996 312 123456', 'school1@edu.kg', 'https://school1.edu.kg')
RETURNING id;

-- Сохраните id школы из результата выше и используйте вместо [SCHOOL_ID] ниже

-- 2. Создание учебного года
INSERT INTO academic_years (school_id, name, start_date, end_date, is_current)
VALUES 
  ('[SCHOOL_ID]', '2026-2027', '2026-09-01', '2027-06-30', true);

-- Получить id учебного года
SELECT id FROM academic_years WHERE school_id = '[SCHOOL_ID]' AND is_current = true;

-- 3. Создание четвертей
INSERT INTO academic_terms (academic_year_id, term, start_date, end_date)
VALUES 
  ('[ACADEMIC_YEAR_ID]', 1, '2026-09-01', '2026-10-31'),
  ('[ACADEMIC_YEAR_ID]', 2, '2026-11-09', '2026-12-26'),
  ('[ACADEMIC_YEAR_ID]', 3, '2027-01-11', '2027-03-20'),
  ('[ACADEMIC_YEAR_ID]', 4, '2027-04-01', '2027-06-30');

-- 4. Создание предметов
INSERT INTO subjects (school_id, name, code, description)
VALUES 
  ('[SCHOOL_ID]', 'Математика', 'MATH', 'Алгебра, геометрия, математический анализ'),
  ('[SCHOOL_ID]', 'Русский язык', 'RUS', 'Язык и литература'),
  ('[SCHOOL_ID]', 'Кыргызский язык', 'KYR', 'Кыргыз тили жана адабият'),
  ('[SCHOOL_ID]', 'Английский язык', 'ENG', 'English Language'),
  ('[SCHOOL_ID]', 'История Кыргызстана', 'HIST', 'История и обществознание'),
  ('[SCHOOL_ID]', 'Физика', 'PHYS', 'Физика и астрономия'),
  ('[SCHOOL_ID]', 'Химия', 'CHEM', 'Химия'),
  ('[SCHOOL_ID]', 'Биология', 'BIO', 'Биология'),
  ('[SCHOOL_ID]', 'География', 'GEO', 'География Кыргызстана и мира'),
  ('[SCHOOL_ID]', 'Информатика', 'IT', 'Информатика и ИКТ'),
  ('[SCHOOL_ID]', 'Физкультура', 'PE', 'Физическая культура'),
  ('[SCHOOL_ID]', 'Музыка', 'MUS', 'Музыка'),
  ('[SCHOOL_ID]', 'ИЗО', 'ART', 'Изобразительное искусство');

-- 5. Создание классов
INSERT INTO classes (school_id, name, grade, section, academic_year, max_students)
VALUES 
  ('[SCHOOL_ID]', '5-А', 5, 'А', '2026-2027', 30),
  ('[SCHOOL_ID]', '5-Б', 5, 'Б', '2026-2027', 30),
  ('[SCHOOL_ID]', '6-А', 6, 'А', '2026-2027', 28),
  ('[SCHOOL_ID]', '6-Б', 6, 'Б', '2026-2027', 28),
  ('[SCHOOL_ID]', '7-А', 7, 'А', '2026-2027', 25),
  ('[SCHOOL_ID]', '7-Б', 7, 'Б', '2026-2027', 25),
  ('[SCHOOL_ID]', '8-А', 8, 'А', '2026-2027', 30),
  ('[SCHOOL_ID]', '9-А', 9, 'А', '2026-2027', 25),
  ('[SCHOOL_ID]', '10-А', 10, 'А', '2026-2027', 22),
  ('[SCHOOL_ID]', '11-А', 11, 'А', '2026-2027', 20);

-- 6. Создание периодов уроков
INSERT INTO lesson_periods (school_id, name, start_time, end_time, period_order)
VALUES 
  ('[SCHOOL_ID]', '1 урок', '08:00', '08:45', 1),
  ('[SCHOOL_ID]', '2 урок', '08:55', '09:40', 2),
  ('[SCHOOL_ID]', '3 урок', '10:00', '10:45', 3),
  ('[SCHOOL_ID]', '4 урок', '10:55', '11:40', 4),
  ('[SCHOOL_ID]', '5 урок', '12:00', '12:45', 5),
  ('[SCHOOL_ID]', '6 урок', '12:55', '13:40', 6);

-- 7. Создание кабинетов
INSERT INTO classrooms (school_id, name, room_number, building, floor, capacity)
VALUES 
  ('[SCHOOL_ID]', 'Кабинет математики', '201', 'Главный корпус', 2, 30),
  ('[SCHOOL_ID]', 'Кабинет физики', '301', 'Главный корпус', 3, 28),
  ('[SCHOOL_ID]', 'Кабинет химии', '302', 'Главный корпус', 3, 28),
  ('[SCHOOL_ID]', 'Кабинет биологии', '202', 'Главный корпус', 2, 30),
  ('[SCHOOL_ID]', 'Кабинет информатики', '101', 'Главный корпус', 1, 25),
  ('[SCHOOL_ID]', 'Кабинет русского языка', '203', 'Главный корпус', 2, 30),
  ('[SCHOOL_ID]', 'Кабинет английского языка', '204', 'Главный корпус', 2, 25),
  ('[SCHOOL_ID]', 'Кабинет истории', '303', 'Главный корпус', 3, 30),
  ('[SCHOOL_ID]', 'Спортзал', 'С1', 'Спортивный корпус', 1, 50);

-- 8. Создание администратора школы (после регистрации через Supabase Auth)
-- Сначала создайте пользователя через Supabase Dashboard:
-- Authentication → Users → Add user
-- Email: admin@school1.edu.kg
-- Password: [надежный пароль]
-- Затем выполните:

INSERT INTO profiles (id, email, full_name, phone)
VALUES ('[ADMIN_USER_ID]', 'admin@school1.edu.kg', 'Алиев Алмаз Алмазович', '+996 555 123456');

INSERT INTO school_memberships (user_id, school_id, role, is_active)
VALUES ('[ADMIN_USER_ID]', '[SCHOOL_ID]', 'school_admin', true);

-- 9. Создание тестового учителя
-- Создайте через Auth:
-- Email: teacher@school1.edu.kg
-- Password: [надежный пароль]

INSERT INTO profiles (id, email, full_name, phone)
VALUES ('[TEACHER_USER_ID]', 'teacher@school1.edu.kg', 'Касымова Гульнара Токтосуновна', '+996 555 234567');

INSERT INTO school_memberships (user_id, school_id, role, is_active)
VALUES ('[TEACHER_USER_ID]', '[SCHOOL_ID]', 'teacher', true);

INSERT INTO teacher_profiles (user_id, school_id, subject_specialization, hire_date)
VALUES ('[TEACHER_USER_ID]', '[SCHOOL_ID]', 'Математика', '2020-09-01');

-- Получить teacher_profile_id
SELECT id FROM teacher_profiles WHERE user_id = '[TEACHER_USER_ID]';

-- Назначение учителя на класс и предмет
INSERT INTO teacher_assignments (teacher_profile_id, class_id, subject_id)
VALUES 
  ('[TEACHER_PROFILE_ID]', '[CLASS_5A_ID]', '[MATH_SUBJECT_ID]'),
  ('[TEACHER_PROFILE_ID]', '[CLASS_6A_ID]', '[MATH_SUBJECT_ID]');

-- 10. Создание тестового ученика
-- Создайте через Auth:
-- Email: student@school1.edu.kg
-- Password: [надежный пароль]

INSERT INTO profiles (id, email, full_name, phone)
VALUES ('[STUDENT_USER_ID]', 'student@school1.edu.kg', 'Токтогулов Эрлан Бекболотович', '+996 555 345678');

INSERT INTO school_memberships (user_id, school_id, role, is_active)
VALUES ('[STUDENT_USER_ID]', '[SCHOOL_ID]', 'student', true);

INSERT INTO student_profiles (user_id, school_id, date_of_birth, address)
VALUES ('[STUDENT_USER_ID]', '[SCHOOL_ID]', '2011-05-15', 'г. Бишкек, мкр. Асанбай 12-15');

-- Получить student_profile_id
SELECT id FROM student_profiles WHERE user_id = '[STUDENT_USER_ID]';

-- Зачисление в класс
INSERT INTO class_enrollments (student_profile_id, class_id, enrollment_date)
VALUES ('[STUDENT_PROFILE_ID]', '[CLASS_5A_ID]', '2026-09-01');

-- ГОТОВО!
-- Теперь можете войти в систему с любым из созданных аккаунтов:
-- admin@school1.edu.kg - администратор
-- teacher@school1.edu.kg - учитель
-- student@school1.edu.kg - ученик
