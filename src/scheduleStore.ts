import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Отдельный store расписания. Для бэкенда заменить actions на REST-вызовы.
export interface Room { id: string; name: string }
export interface Lesson { id: string; weekday: number; period: number; classId: string; subjectId: string; teacherId: string; roomId: string }

// Звонки: [начало, конец] для уроков 1..6, настраиваемые в «Настройках»
export const BELLS = [['08:30', '09:15'], ['09:25', '10:10'], ['10:30', '11:15'], ['11:25', '12:10'], ['12:30', '13:15'], ['13:25', '14:10']];
export const DAYS = [1, 2, 3, 4, 5];

// Возвращает ключ ошибки конфликта или null
export function conflictKey(lessons: Lesson[], l: Omit<Lesson, 'id'>): string | null {
  const same = lessons.filter(x => x.weekday === l.weekday && x.period === l.period);
  if (same.some(x => x.teacherId === l.teacherId)) return 'conflictTeacher';
  if (same.some(x => x.roomId === l.roomId)) return 'conflictRoom';
  if (same.some(x => x.classId === l.classId)) return 'conflictClass';
  return null;
}

interface ScheduleState {
  rooms: Room[];
  lessons: Lesson[];
  addLesson: (l: Omit<Lesson, 'id'>) => string | null;
  removeLesson: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      rooms: [{ id: 'r1', name: '201' }, { id: 'r2', name: '305' }, { id: 'r3', name: 'Спортзал' }],
      lessons: [
        { id: 'l1', weekday: 1, period: 1, classId: 'c1', subjectId: 's1', teacherId: 'u2', roomId: 'r1' },
        { id: 'l2', weekday: 1, period: 2, classId: 'c1', subjectId: 's2', teacherId: 'u3', roomId: 'r2' },
        { id: 'l3', weekday: 1, period: 1, classId: 'c2', subjectId: 's2', teacherId: 'u3', roomId: 'r3' },
        { id: 'l4', weekday: 2, period: 3, classId: 'c2', subjectId: 's1', teacherId: 'u2', roomId: 'r1' },
      ],
      addLesson: l => {
        const err = conflictKey(get().lessons, l);
        if (err) return err;
        set(s => ({ lessons: [...s.lessons, { ...l, id: crypto.randomUUID() }] }));
        return null;
      },
      removeLesson: id => set(s => ({ lessons: s.lessons.filter(x => x.id !== id) })),
    }),
    { name: 'vavilon-schedule' }
  )
);
