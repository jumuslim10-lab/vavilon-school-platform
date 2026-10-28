import { create } from 'zustand';

// Глобальные уведомления: вызов toast('Сохранено') из любого модуля
export type Tone = 'ok' | 'error';
interface ToastItem { id: string; msg: string; tone: Tone }
interface ToastState { items: ToastItem[]; dismiss: (id: string) => void }

export const useToasts = create<ToastState>(set => ({
  items: [],
  dismiss: id => set(s => ({ items: s.items.filter(x => x.id !== id) })),
}));

export function toast(msg: string, tone: Tone = 'ok') {
  const id = crypto.randomUUID();
  useToasts.setState(s => ({ items: [...s.items, { id, msg, tone }] }));
  setTimeout(() => useToasts.getState().dismiss(id), 3000);
}
