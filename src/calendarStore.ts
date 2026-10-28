import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Календарь событий. Для бэкенда заменить actions на REST-вызовы.
export type EventType = 'event' | 'exam' | 'holiday' | 'meeting';
export interface CalEvent { id: string; date: string; title: string; type: EventType; classId?: string }

interface CS {
  events: CalEvent[];
  addEvent: (e: Omit<CalEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
}

export const useCalendarStore = create<CS>()(
  persist(
    (set) => ({
      events: [
        { id: 'e1', date: '2026-11-02', title: 'Контрольная по математике', type: 'exam', classId: 'c1' },
        { id: 'e2', date: '2026-11-03', title: 'Начало осенних каникул', type: 'holiday' },
        { id: 'e3', date: '2026-11-07', title: 'Школьный концерт', type: 'event' },
        { id: 'e4', date: '2026-11-12', title: 'Родительское собрание 9А', type: 'meeting', classId: 'c1' },
      ],
      addEvent: e => set(s => ({ events: [...s.events, { ...e, id: crypto.randomUUID() }] })),
      removeEvent: id => set(s => ({ events: s.events.filter(x => x.id !== id) })),
    }),
    { name: 'vavilon-calendar' }
  )
);
