import { useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardList, CalendarDays, Award, MessageSquare, Users, Newspaper, CalendarRange, BarChart3, ArrowLeftRight, LogOut, Moon, Sun } from 'lucide-react';
import { useStore, useCurrentUser } from '../store';
import { useT, LANGS, type Lang } from '../i18n';
import { useMessages, unreadCount } from '../messagesStore';
import { Badge } from './ui';

const items = [
  { to: '/substitutions', key: 'subsTitle', icon: ArrowLeftRight, roles: ['admin', 'teacher', 'student', 'parent'] },
  { to: '/reports', key: 'reports', icon: BarChart3, roles: ['admin', 'teacher'] },
  { to: '/news', key: 'news', icon: Newspaper, roles: ['admin', 'teacher', 'student', 'parent'] },
  { to: '/calendar', key: 'calendar', icon: CalendarRange, roles: ['admin', 'teacher', 'student', 'parent'] },
  { to: '/students', key: 'students', icon: Users, roles: ['admin', 'teacher'] },
  { to: '/messages', key: 'messages', icon: MessageSquare, roles: ['admin', 'teacher', 'student', 'parent'] },
  { to: '/grades', key: 'grades', icon: Award, roles: ['admin', 'teacher', 'student', 'parent'] },
  { to: '/schedule', key: 'schedule', icon: CalendarDays, roles: ['admin', 'teacher', 'student', 'parent'] },
  { to: '/', key: 'dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent'] },
  { to: '/journal', key: 'journal', icon: BookOpen, roles: ['admin', 'teacher'] },
  { to: '/homework', key: 'homework', icon: ClipboardList, roles: ['admin', 'teacher', 'student', 'parent'] },
];

export default function Layout({ children }: { children: ReactNode }) {
  const t = useT();
  const user = useCurrentUser()!;
  const { dark, toggleDark, lang, setLang, logout } = useStore();
  const visible = items.filter(i => i.roles.includes(user.role));
  const unread = useMessages(st => unreadCount(st.threads, user.id));

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);

  const link = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:outline-indigo-500 ${active ? 'bg-indigo-600 text-white' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-stone-200 bg-white/70 p-4 backdrop-blur md:block dark:border-stone-800 dark:bg-stone-900/70">
        <div className="mb-6 px-2 font-display text-xl font-bold text-indigo-600">vavilon</div>
        <nav className="space-y-1">
          {visible.map(i => (
            <NavLink key={i.to} to={i.to} end className={({ isActive }) => link(isActive)}>
              <i.icon size={18} />{t(i.key)}{i.key === 'messages' && unread > 0 && <span className="ml-auto rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-200 bg-white/70 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-900/70">
          <div className="flex items-center gap-2 text-sm font-medium">{user.name} <Badge>{t(user.role)}</Badge></div>
          <div className="flex items-center gap-2">
            <select aria-label={t('lang')} value={lang} onChange={e => setLang(e.target.value as Lang)}
              className="rounded-lg border border-stone-300 bg-transparent px-2 py-1 text-sm dark:border-stone-700">
              {LANGS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <button aria-label={t('theme')} onClick={toggleDark} className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button aria-label={t('logout')} onClick={logout} className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-24 md:p-8 md:pb-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-stone-200 bg-white/90 p-2 backdrop-blur md:hidden dark:border-stone-800 dark:bg-stone-900/90">
          {visible.map(i => (
            <NavLink key={i.to} to={i.to} end className={({ isActive }) => `flex flex-col items-center rounded-lg px-3 py-1 text-xs ${isActive ? 'text-indigo-600' : 'text-stone-500'}`}>
              <i.icon size={20} />{t(i.key)}{i.key === 'messages' && unread > 0 && <span className="ml-auto rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
