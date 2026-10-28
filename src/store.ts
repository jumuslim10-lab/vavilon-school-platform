import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from './i18n';

// Слой данных: компоненты работают только через этот store.
// Для бэкенда замените actions на вызовы REST API (см. README).
export type Role = 'admin' | 'teacher' | 'student' | 'parent';
export interface User { id: string; name: string; role: Role; classId?: string; subjectIds?: string[]; childIds?: string[] }
export interface Cls { id: string; name: string }
export interface Subject { id: string; name: string }
export interface Submission { done: boolean; grade?: number }
export interface Homework { id: string; subjectId: string; classId: string; title: string; description: string; due: string; submissions: Record<string, Submission> }
export type GradeType = 'current' | 'test' | 'independent' | 'homeworkType';
export const WEIGHTS: Record<GradeType, number> = { current: 1, test: 2, independent: 1.5, homeworkType: 1 };
export interface Grade { studentId: string; subjectId: string; date: string; type: GradeType; value: number }
export interface Attendance { studentId: string; date: string; status: 'present' | 'late' | 'absentExcused' | 'absent' }

export interface DB {
  users: User[]; classes: Cls[]; subjects: Subject[]; homework: Homework[];
  grades: Grade[]; attendance: Attendance[];
  sessionId: string | null; lang: Lang; dark: boolean;
}
interface Actions {
  login: (id: string) => void; logout: () => void; setLang: (l: Lang) => void; toggleDark: () => void;
  addHomework: (h: Omit<Homework, 'id' | 'submissions'>) => void;
  setDone: (hid: string, sid: string, done: boolean) => void;
  setHwGrade: (hid: string, sid: string, grade: number) => void;
  setGrade: (sid: string, subj: string, date: string, value: number | null, type: GradeType) => void;
  moveStudent: (sid: string, classId: string) => void;
  setAttendance: (sid: string, date: string, status: Attendance['status']) => void;
}

const seed: DB = {
  classes: [{ id: 'c1', name: '9А' }, { id: 'c2', name: '10Б' }],
  subjects: [{ id: 's1', name: 'Математика' }, { id: 's2', name: 'История' }],
  users: [
    { id: 'u1', name: 'Анна Директорова', role: 'admin' },
    { id: 'u2', name: 'Марат Сейтов', role: 'teacher', subjectIds: ['s1'] },
    { id: 'u3', name: 'Ольга Ким', role: 'teacher', subjectIds: ['s2'] },
    { id: 'u4', name: 'Аружан Ахметова', role: 'student', classId: 'c1' },
    { id: 'u5', name: 'Данияр Жумабеков', role: 'student', classId: 'c1' },
    { id: 'u6', name: 'Лейла Оспанова', role: 'student', classId: 'c2' },
    { id: 'u7', name: 'Гульнара Ахметова', role: 'parent', childIds: ['u4'] },
  ],
  homework: [
    { id: 'h1', subjectId: 's1', classId: 'c1', title: 'Квадратные уравнения', description: 'Упр. 12–18, стр. 64', due: '2026-11-02', submissions: { u4: { done: true } } },
    { id: 'h2', subjectId: 's2', classId: 'c1', title: 'Реформы 1860-х', description: 'Прочитать §14, ответить на вопросы', due: '2026-10-20', submissions: {} },
  ],
  grades: [
    { studentId: 'u4', subjectId: 's1', date: '2026-10-21', type: 'current', value: 5 },
    { studentId: 'u4', subjectId: 's1', date: '2026-10-23', type: 'test', value: 4 },
    { studentId: 'u5', subjectId: 's1', date: '2026-10-21', type: 'current', value: 3 },
    { studentId: 'u5', subjectId: 's1', date: '2026-10-23', type: 'test', value: 2 },
    { studentId: 'u6', subjectId: 's2', date: '2026-10-27', type: 'independent', value: 4 },
  ],
  attendance: [
    { studentId: 'u4', date: '2026-10-28', status: 'present' },
    { studentId: 'u5', date: '2026-10-28', status: 'absentExcused' },
    { studentId: 'u6', date: '2026-10-28', status: 'late' },
  ],
  sessionId: null, lang: 'ru', dark: false,
};

export const useStore = create<DB & Actions>()(
  persist(
    (set) => ({
      ...seed,
      login: id => set({ sessionId: id }),
      logout: () => set({ sessionId: null }),
      setLang: lang => set({ lang }),
      toggleDark: () => set(s => ({ dark: !s.dark })),
      addHomework: h => set(s => ({ homework: [...s.homework, { ...h, id: crypto.randomUUID(), submissions: {} }] })),
      setDone: (hid, sid, done) => set(s => ({
        homework: s.homework.map(h => h.id === hid
          ? { ...h, submissions: { ...h.submissions, [sid]: { ...h.submissions[sid], done } } } : h),
      })),
      setHwGrade: (hid, sid, grade) => set(s => ({
        homework: s.homework.map(h => h.id === hid
          ? { ...h, submissions: { ...h.submissions, [sid]: { done: true, ...h.submissions[sid], grade } } } : h),
      })),
      setGrade: (sid, subj, date, value, type) => set(s => {
        const rest = s.grades.filter(g => !(g.studentId === sid && g.subjectId === subj && g.date === date));
        return { grades: value == null ? rest : [...rest, { studentId: sid, subjectId: subj, date, type, value }] };
      }),
      moveStudent: (sid, classId) => set(s => ({ users: s.users.map(u => u.id === sid ? { ...u, classId } : u) })),
      setAttendance: (sid, date, status) => set(s => ({
        attendance: [...s.attendance.filter(a => !(a.studentId === sid && a.date === date)), { studentId: sid, date, status }],
      })),
    }),
    { name: 'vavilon-db' }
  )
);

export const useCurrentUser = () => useStore(s => s.users.find(u => u.id === s.sessionId) ?? null);

export function scopeStudentIds(u: User, db: DB): string[] {
  if (u.role === 'student') return [u.id];
  if (u.role === 'parent') return u.childIds ?? [];
  return db.users.filter(x => x.role === 'student').map(x => x.id);
}
