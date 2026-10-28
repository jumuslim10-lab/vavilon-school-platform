import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Классные руководители и документы учеников. Для бэкенда заменить actions на REST-вызовы.
export interface Doc { id: string; name: string; addedAt: string }
interface SS {
  classTeacher: Record<string, string>;
  docs: Record<string, Doc[]>;
  setClassTeacher: (classId: string, teacherId: string) => void;
  addDoc: (sid: string, name: string) => void;
  removeDoc: (sid: string, docId: string) => void;
}

export const useStudentsStore = create<SS>()(
  persist(
    (set) => ({
      classTeacher: { c1: 'u2', c2: 'u3' },
      docs: { u4: [{ id: 'd1', name: 'Свидетельство о рождении.pdf', addedAt: '2026-09-01' }] },
      setClassTeacher: (classId, teacherId) => set(s => ({ classTeacher: { ...s.classTeacher, [classId]: teacherId } })),
      addDoc: (sid, name) => set(s => ({
        docs: { ...s.docs, [sid]: [...(s.docs[sid] ?? []), { id: crypto.randomUUID(), name, addedAt: new Date().toISOString().slice(0, 10) }] },
      })),
      removeDoc: (sid, docId) => set(s => ({ docs: { ...s.docs, [sid]: (s.docs[sid] ?? []).filter(d => d.id !== docId) } })),
    }),
    { name: 'vavilon-students' }
  )
);
