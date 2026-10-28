import type { ButtonHTMLAttributes, ReactNode } from 'react';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-stone-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 ${className}`}>{children}</div>
);

export const Button = ({ variant = 'primary', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) => (
  <button {...p} className={`rounded-xl px-4 py-2 text-sm font-medium transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 ${variant === 'primary' ? 'bg-indigo-600 text-white' : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'} ${className}`} />
);

const tones = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};
export const Badge = ({ children, tone = 'indigo' }: { children: ReactNode; tone?: keyof typeof tones }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
);

export const EmptyState = ({ text }: { text: string }) => (
  <div className="py-10 text-center text-sm text-stone-500">{text}</div>
);
