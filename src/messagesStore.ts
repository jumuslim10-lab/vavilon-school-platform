import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store сообщений. Для бэкенда заменить actions на REST/WebSocket-вызовы.
export type ThreadKind = 'direct' | 'group' | 'broadcast';
export interface Msg { id: string; authorId: string; text: string; at: string; replyTo?: string; file?: string; readBy: string[] }
export interface Thread { id: string; kind: ThreadKind; title: string; memberIds: string[]; messages: Msg[] }

interface MS {
  threads: Thread[];
  createThread: (kind: ThreadKind, title: string, memberIds: string[]) => string;
  send: (threadId: string, authorId: string, text: string, opts?: { replyTo?: string; file?: string }) => void;
  markRead: (threadId: string, userId: string) => void;
}

const seed: Thread[] = [
  { id: 't1', kind: 'group', title: '9А · Класс', memberIds: ['u2', 'u3', 'u4', 'u5', 'u7'], messages: [
    { id: 'm1', authorId: 'u2', text: 'Завтра контрольная по квадратным уравнениям. Повторите §12.', at: '2026-10-27T10:00', readBy: ['u2', 'u4'] },
    { id: 'm2', authorId: 'u4', text: 'Хорошо, спасибо!', at: '2026-10-27T10:20', readBy: ['u4'] },
  ] },
  { id: 't2', kind: 'direct', title: '', memberIds: ['u2', 'u7'], messages: [
    { id: 'm3', authorId: 'u2', text: 'Добрый день! Можно обсудить успеваемость?', at: '2026-10-27T15:00', readBy: ['u2'] },
  ] },
];

export const useMessages = create<MS>()(
  persist(
    (set) => ({
      threads: seed,
      createThread: (kind, title, memberIds) => {
        const id = crypto.randomUUID();
        set(s => ({ threads: [{ id, kind, title, memberIds, messages: [] }, ...s.threads] }));
        return id;
      },
      send: (threadId, authorId, text, opts) => set(s => ({
        threads: s.threads.map(th => th.id !== threadId ? th : {
          ...th,
          messages: [...th.messages, { id: crypto.randomUUID(), authorId, text, at: new Date().toISOString(), replyTo: opts?.replyTo, file: opts?.file, readBy: [authorId] }],
        }),
      })),
      markRead: (threadId, userId) => set(s => ({
        threads: s.threads.map(th => th.id !== threadId ? th : {
          ...th,
          messages: th.messages.map(m => m.readBy.includes(userId) ? m : { ...m, readBy: [...m.readBy, userId] }),
        }),
      })),
    }),
    { name: 'vavilon-messages' }
  )
);

export function unreadCount(threads: Thread[], userId: string): number {
  return threads.reduce((n, th) => n + (th.memberIds.includes(userId)
    ? th.messages.filter(m => m.authorId !== userId && !m.readBy.includes(userId)).length : 0), 0);
}
