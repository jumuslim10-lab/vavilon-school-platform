# VAVILON - Анализ кодовой базы (Шаг 0)

## 📁 Структура проекта

### Страницы (14)
```
app/
├── page.tsx                    # Главная (redirect)
├── login/page.tsx             # Авторизация ✓
├── dashboard/page.tsx         # Главный дашборд ✓
├── admin/page.tsx             # Администрирование
├── assignments/page.tsx       # Домашние задания
├── attendance/page.tsx        # Посещаемость
├── diary/page.tsx            # Электронный дневник
├── journal/page.tsx          # Электронный журнал
├── materials/page.tsx        # Учебные материалы
├── messages/page.tsx         # Сообщения
├── notifications/page.tsx    # Уведомления
├── reports/page.tsx          # Отчеты
├── timetable/page.tsx        # Расписание
└── demo/page.tsx             # Демо-страница
```

### Компоненты (30+)
```
components/
├── layout/
│   └── dashboard-layout.tsx   # Главный layout с sidebar ✓
├── ui/                        # Базовые UI компоненты
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   └── tabs.tsx
├── admin/                     # 9 компонентов админки
├── assignments/               # 4 компонента заданий
├── attendance/                # 1 компонент посещаемости
├── journal/                   # 1 компонент журнала
├── materials/                 # 3 компонента материалов
├── messages/                  # 1 компонент сообщений
├── notifications/             # 1 компонент уведомлений
├── reports/                   # 1 компонент отчетов
└── providers/
    └── query-provider.tsx     # React Query provider
```

### Стили
```
app/globals.css               # Глобальные стили + анимации
tailwind.config.ts            # Конфиг Tailwind CSS v4
```

---

## 🔒 ЧТО НЕЛЬЗЯ СЛОМАТЬ

### 1. Backend интеграция (Supabase)

#### Auth системы:
- `lib/auth.ts` - оригинальные функции авторизации
- `lib/auth-cached.ts` - кэшированные версии (используются везде)
- Функции: `getUser()`, `getUserProfile()`, `getUserSchoolMemberships()`, `requireAuth()`, `requireRole()`

#### Supabase клиенты:
- `lib/supabase/client.ts` - клиент для браузера
- `lib/supabase/server.ts` - клиент для сервера
- `lib/supabase/middleware.ts` - middleware для auth

#### Queries к БД (32 места):
- Все страницы делают `supabase.from('table').select(...)`
- Таблицы: profiles, school_memberships, schools, classes, subjects, students, teachers, assignments, attendance, grades, materials, messages, notifications

### 2. Маршруты и навигация

#### Middleware:
```typescript
middleware.ts - проверяет auth перед доступом к страницам
- Пропускает: /login, /auth, /demo
- Редиректит неавторизованных на /login
```

#### Навигация (dashboard-layout.tsx):
```typescript
const navItems = [
  { name: 'Главная', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Дневник', href: '/diary', icon: BookOpen, roles: ['student', 'parent'] },
  { name: 'Журнал', href: '/journal', icon: BookOpen, roles: ['teacher', 'school_admin'] },
  // ... остальные 8 пунктов
]
```
⚠️ Нельзя менять href и roles фильтрацию

### 3. Формы и обработчики

#### Login форма (app/login/page.tsx):
```typescript
- email, password inputs
- handleLogin() - вызывает supabase.auth.signInWithPassword()
- После успеха: router.push('/dashboard')
```

#### Модальные формы (components/admin/, components/assignments/):
- onClose, onSuccess callback props
- useState для formData
- handleSubmit с supabase queries
- setLoading состояния

### 4. Client Components (use client)

⚠️ Компоненты с useState, onClick, формами:
```
- dashboard-layout.tsx (sidebar state, logout)
- login/page.tsx (форма авторизации)
- *-client.tsx компоненты (все модули)
- create-*-modal.tsx, edit-*-modal.tsx (формы)
```

### 5. Props и типы

#### DashboardLayout props:
```typescript
{
  children: React.ReactNode
  userRole: string
  userName: string
}
```

#### Modal props паттерн:
```typescript
{
  onClose: () => void
  onSuccess: () => void
  initialData?: any  // для edit модалок
}
```

### 6. CSS классы используемые в JS

⚠️ Классы для анимаций и состояний:
```css
.animate-fadeIn      # используется в layout
.animate-pulse       # на loading элементах
.animate-spin        # на spinner'ах
```

### 7. ID и data-атрибуты

Не найдено критичных - компоненты используют ref и state

---

## ✅ ЧТО МОЖНО БЕЗОПАСНО МЕНЯТЬ

### Визуальные стили:
- Цвета (кроме логики hover/active состояний)
- Шрифты
- Отступы, padding, margin
- Border radius, shadows
- Background градиенты

### Layout и сетка:
- Ширина контейнеров
- Grid/flex настройки
- Breakpoints

### Компоненты UI (components/ui/):
- Полностью переделать стили
- Главное сохранить props interface

### Анимации:
- Добавить новые
- Изменить timing/easing
- Добавить IntersectionObserver

---

## 🎨 Текущее состояние дизайна

### Цвета (хаотичные):
- Градиенты: blue-600 → indigo-600, purple-600 → pink-600
- Stat cards: blue-50/100, green-50/100, purple-50/100, amber-50/100
- Нет единой палитры

### Типографика:
- Inter (латиница + кириллица) ✓
- Размеры: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
- Не выстроена иерархия

### Компоненты:
- Buttons: default, outline, ghost, destructive ✓
- Cards: базовые, нет единого стиля
- Inputs: стандартные
- Навигация: sidebar с простыми стилями

### Проблемы:
- Слишком много разных градиентов
- Нет dark mode
- Нет системы spacing через переменные
- Анимации есть, но не везде
- Нет единой цветовой схемы

---

## 📋 Чек-лист безопасности

Перед изменениями проверить:
- [ ] Сохранены все href в навигации
- [ ] Не сломаны supabase queries
- [ ] Работают формы (onSubmit, onChange)
- [ ] Модалки открываются/закрываются
- [ ] Auth redirect работает
- [ ] Client components остались client
- [ ] Props interfaces не изменились
- [ ] Анимации не конфликтуют с JS

---

**Готов к Шагу 2: предложение визуальной концепции**
