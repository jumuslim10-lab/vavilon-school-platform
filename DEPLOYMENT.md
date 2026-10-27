# Развертывание VAVILON на Supabase и Vercel

## Шаг 1: Настройка Supabase

### 1.1 Создание проекта
1. Перейдите на https://supabase.com
2. Войдите или создайте аккаунт
3. Нажмите "New Project"
4. Заполните:
   - Name: `vavilon-production`
   - Database Password: (сохраните в безопасном месте)
   - Region: выберите ближайший к вам
5. Дождитесь создания проекта (~2 минуты)

### 1.2 Применение миграций базы данных
1. В панели Supabase перейдите в "SQL Editor"
2. Создайте новый запрос
3. Скопируйте содержимое `supabase/migrations/20261026_001_initial_schema.sql`
4. Вставьте и выполните (Run)
5. Повторите для `supabase/migrations/20261026_002_row_level_security.sql`

### 1.3 Настройка Storage
1. Перейдите в "Storage" в боковой панели
2. Создайте новый bucket с именем `school-files`
3. Настройки:
   - Public: No (приватный)
   - File size limit: 50 MB
   - Allowed MIME types: `image/*`, `application/pdf`, `application/vnd.*`, `text/*`
4. Настройте RLS политики для bucket:

```sql
-- Политика для загрузки файлов
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'school-files');

-- Политика для чтения файлов
CREATE POLICY "Users can read own school files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'school-files');

-- Политика для удаления файлов
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'school-files');
```

### 1.4 Получение ключей API
1. Перейдите в "Settings" → "API"
2. Скопируйте:
   - Project URL: `https://xxx.supabase.co`
   - anon/public key: `eyJhb...` (публичный ключ)
   - service_role key: `eyJhb...` (НЕ используйте на клиенте!)

## Шаг 2: Локальная настройка

### 2.1 Создание .env.local
Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 Тестирование локально
```bash
npm run dev
```

Откройте http://localhost:3000/login

### 2.3 Создание тестовых данных

Выполните в SQL Editor:

```sql
-- Создание тестовой школы
INSERT INTO schools (name, address, phone, email)
VALUES ('Средняя школа №1', 'г. Бишкек, ул. Ленина 1', '+996 312 123456', 'school1@example.com')
RETURNING id;

-- Запомните id школы из результата

-- Создание учебного года
INSERT INTO academic_years (school_id, name, start_date, end_date, is_current)
VALUES 
  ('[school_id]', '2026-2027', '2026-09-01', '2027-06-30', true);

-- Создание предметов
INSERT INTO subjects (school_id, name, code)
VALUES 
  ('[school_id]', 'Математика', 'MATH'),
  ('[school_id]', 'Русский язык', 'RUS'),
  ('[school_id]', 'Английский язык', 'ENG'),
  ('[school_id]', 'История', 'HIST'),
  ('[school_id]', 'Физика', 'PHYS');

-- Создание классов
INSERT INTO classes (school_id, name, grade, section, academic_year)
VALUES 
  ('[school_id]', '5-А', 5, 'А', '2026-2027'),
  ('[school_id]', '6-Б', 6, 'Б', '2026-2027'),
  ('[school_id]', '7-А', 7, 'А', '2026-2027');

-- Создание периодов уроков
INSERT INTO lesson_periods (school_id, name, start_time, end_time, period_order)
VALUES 
  ('[school_id]', '1 урок', '08:00', '08:45', 1),
  ('[school_id]', '2 урок', '08:55', '09:40', 2),
  ('[school_id]', '3 урок', '10:00', '10:45', 3),
  ('[school_id]', '4 урок', '10:55', '11:40', 4),
  ('[school_id]', '5 урок', '12:00', '12:45', 5);
```

## Шаг 3: Развертывание на Vercel

### 3.1 Подготовка репозитория
```bash
# Инициализируйте git (если еще не сделано)
git init
git add .
git commit -m "Initial commit: VAVILON platform complete"

# Создайте репозиторий на GitHub и загрузите
git remote add origin https://github.com/ваш-username/vavilon-app.git
git branch -M main
git push -u origin main
```

### 3.2 Деплой на Vercel
1. Перейдите на https://vercel.com
2. Войдите через GitHub
3. Нажмите "Add New..." → "Project"
4. Выберите репозиторий `vavilon-app`
5. Configure Project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: (оставьте пустым)

6. Environment Variables - добавьте:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...
   ```

7. Нажмите "Deploy"
8. Дождитесь завершения (~3-5 минут)

### 3.3 Проверка деплоя
1. Откройте URL от Vercel (например: `https://vavilon-app.vercel.app`)
2. Перейдите на `/login`
3. Войдите с тестовым аккаунтом

## Шаг 4: Создание первого пользователя

### 4.1 Через Supabase Auth
1. В Supabase перейдите в "Authentication" → "Users"
2. Нажмите "Add user" → "Create new user"
3. Заполните:
   - Email: `admin@school.kg`
   - Password: (придумайте сложный пароль)
   - Auto Confirm User: Yes

4. Скопируйте User ID (UUID)

### 4.2 Создание профиля и членства
Выполните в SQL Editor:

```sql
-- Создание профиля
INSERT INTO profiles (id, email, full_name)
VALUES 
  ('[user_id]', 'admin@school.kg', 'Администратор Школы');

-- Назначение роли school_admin
INSERT INTO school_memberships (user_id, school_id, role, is_active)
VALUES 
  ('[user_id]', '[school_id]', 'school_admin', true);
```

## Шаг 5: Настройка домена (опционально)

### 5.1 В Vercel
1. Перейдите в Settings → Domains
2. Добавьте свой домен (например: `vavilon.school.kg`)
3. Следуйте инструкциям для настройки DNS

### 5.2 Настройка DNS
Добавьте A-запись или CNAME у вашего регистратора:
```
CNAME vavilon cname.vercel-dns.com
```

## Шаг 6: Создание дополнительных пользователей

### Через веб-интерфейс
1. Войдите как admin
2. Перейдите в `/admin`
3. Вкладка "Пользователи"
4. Нажмите "Добавить пользователя"
5. Заполните форму и создайте

### Создание учителей и учеников
После создания пользователей:

```sql
-- Для учителя
INSERT INTO teacher_profiles (user_id, school_id, subject_specialization)
VALUES ('[teacher_user_id]', '[school_id]', 'Математика');

-- Для ученика
INSERT INTO student_profiles (user_id, school_id, date_of_birth)
VALUES ('[student_user_id]', '[school_id]', '2012-05-15');

-- Зачисление ученика в класс
INSERT INTO class_enrollments (student_profile_id, class_id, enrollment_date)
VALUES ('[student_profile_id]', '[class_id]', CURRENT_DATE);

-- Назначение учителя на предмет и класс
INSERT INTO teacher_assignments (teacher_profile_id, class_id, subject_id)
VALUES ('[teacher_profile_id]', '[class_id]', '[subject_id]');
```

## Шаг 7: Мониторинг и обслуживание

### 7.1 Логи в Vercel
- Functions → [ваш деплой] → Logs
- Смотрите ошибки в реальном времени

### 7.2 Метрики Supabase
- Database → Performance
- Мониторинг использования базы данных

### 7.3 Бэкапы
- Supabase автоматически создает ежедневные бэкапы
- Settings → Database → Backups

## Шаг 8: Безопасность

### 8.1 Включите Email подтверждение
1. Supabase → Authentication → Providers → Email
2. Enable "Confirm email"

### 8.2 Настройте Email шаблоны
1. Authentication → Email Templates
2. Настройте шаблоны для:
   - Подтверждение email
   - Сброс пароля
   - Приглашение

### 8.3 Rate Limiting
1. Vercel → Settings → Firewall
2. Настройте лимиты запросов

## Готово!

Платформа VAVILON развернута и готова к использованию.

### Полезные ссылки:
- Production URL: `https://ваш-проект.vercel.app`
- Supabase Dashboard: `https://supabase.com/dashboard/project/[project-id]`
- Vercel Dashboard: `https://vercel.com/[username]/vavilon-app`

### Следующие шаги:
1. Создайте пользователей через админ-панель
2. Настройте классы и предметы
3. Назначьте учителей на классы
4. Начните использовать платформу!
