import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lesson } from './scheduleStore';

// Замены учителей на конкретную дату. Для бэкенда заменить actions на REST-вызовы.
export interface Sub { id: string; date: string; lessonId: string; teacherId: string }

interface SubState {
  subs: Sub[];
  addSub: (s: Omit<Sub, 'id'>) => void;
  removeSub: (id: string) => void;
}

export const useSubsStore = create<SubState>()(
  persist(
    (set) => ({
      subs: [],
      // На один урок в одну дату — одна замена (новая заменяет старую)
      addSub: s => set(st => ({
        subs: [...st.subs.filter(x => !(x.date === s.date && x.lessonId === s.lessonId)), { ...s, id: crypto.randomUUID() }],
      })),
      removeSub: id => set(st => ({ subs: st.subs.filter(x => x.id !== id) })),
    }),
    { name: 'vavilon-subs' }
  )
);

export const weekdayOf = (dateStr: string) => new Date(dateStr + 'T00:00:00').getDay();

// Кто ведёт урок в эту дату с учётом замены
export function effectiveTeacher(lesson: Lesson, date: string, subs: Sub[]): string {
  return subs.find(s => s.date === date && s.lessonId === lesson.id)?.teacherId ?? lesson.teacherId;
}

// Свободен ли учитель, чтобы заменить урок: не ведёт параллельный урок и не заменяет другой урок в этот час
export function replacementFree(lessons: Lesson[], subs: Sub[], date: string, lesson: Lesson, teacherId: string): boolean {
  if (teacherId === lesson.teacherId) return false;
  const parallel = lessons.filter(l => l.weekday === lesson.weekday && l.period === lesson.period && l.id !== lesson.id);
  if (parallel.some(l => effectiveTeacher(l, date, subs) === teacherId)) return false;
  return !subs.some(s => s.date === date && s.teacherId === teacherId && s.lessonId !== lesson.id
    && lessons.find(l => l.id === s.lessonId)?.period === lesson.period);
}
