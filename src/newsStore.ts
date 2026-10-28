import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DB, Role, User } from './store';
import type { Lesson } from './scheduleStore';

// Новости и правила видимости. Для бэкенда заменить actions на REST-вызовы.
export type Target = { kind: 'all' } | { kind: 'role'; role: Role } | { kind: 'class'; classId: string };
export interface Comment { id: string; authorId: string; text: string; at: string }
export interface Post { id: string; title: string; body: string; cover: string; authorId: string; at: string; target: Target; pinned: boolean; likes: string[]; comments: Comment[] }

interface NS {
  posts: Post[];
  addPost: (p: { title: string; body: string; cover: string; authorId: string; target: Target }) => void;
  togglePin: (id: string) => void;
  toggleLike: (id: string, uid: string) => void;
  addComment: (id: string, uid: string, text: string) => void;
  removePost: (id: string) => void;
}

export const useNewsStore = create<NS>()(
  persist(
    (set) => ({
      posts: [
        { id: 'p1', title: 'Осенние каникулы', body: 'С 3 по 9 ноября — осенние каникулы. Занятия возобновятся 10 ноября.', cover: '🍂', authorId: 'u1', at: '2026-10-26T12:00:00', target: { kind: 'all' }, pinned: true, likes: ['u4'], comments: [] },
        { id: 'p2', title: 'Контрольная по математике', body: 'Подготовьтесь к контрольной по §12 в понедельник, 2 ноября.', cover: '📐', authorId: 'u2', at: '2026-10-27T10:00:00', target: { kind: 'class', classId: 'c1' }, pinned: false, likes: [], comments: [{ id: 'cm1', authorId: 'u4', text: 'Понятно, спасибо!', at: '2026-10-27T10:30:00' }] },
      ],
      addPost: p => set(s => ({ posts: [{ ...p, id: crypto.randomUUID(), at: new Date().toISOString(), pinned: false, likes: [], comments: [] }, ...s.posts] })),
      togglePin: id => set(s => ({ posts: s.posts.map(p => p.id === id ? { ...p, pinned: !p.pinned } : p) })),
      toggleLike: (id, uid) => set(s => ({
        posts: s.posts.map(p => p.id !== id ? p : { ...p, likes: p.likes.includes(uid) ? p.likes.filter(x => x !== uid) : [...p.likes, uid] }),
      })),
      addComment: (id, uid, text) => set(s => ({
        posts: s.posts.map(p => p.id !== id ? p : { ...p, comments: [...p.comments, { id: crypto.randomUUID(), authorId: uid, text, at: new Date().toISOString() }] }),
      })),
      removePost: id => set(s => ({ posts: s.posts.filter(p => p.id !== id) })),
    }),
    { name: 'vavilon-news' }
  )
);

// Классы, к которым относится пользователь
export function userClassIds(u: User, db: DB, lessons: Lesson[]): string[] {
  if (u.role === 'admin') return db.classes.map(c => c.id);
  if (u.role === 'student') return u.classId ? [u.classId] : [];
  if (u.role === 'parent') return (u.childIds ?? []).map(id => db.users.find(x => x.id === id)?.classId ?? '').filter(Boolean);
  return [...new Set(lessons.filter(l => l.teacherId === u.id).map(l => l.classId))];
}

export function canSee(p: Post, u: User, db: DB, lessons: Lesson[]): boolean {
  if (u.role === 'admin' || p.target.kind === 'all') return true;
  if (p.target.kind === 'role') return u.role === p.target.role;
  return userClassIds(u, db, lessons).includes(p.target.classId);
}
