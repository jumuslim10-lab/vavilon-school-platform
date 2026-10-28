import { format, getDay } from 'date-fns';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Award, BookOpen, CalendarDays, ClipboardList } from 'lucide-react';
import { useStore, useCurrentUser, scopeStudentIds } from '../store';
import { useScheduleStore, BELLS } from '../scheduleStore';
import { useSubsStore, effectiveTeacher } from '../substitutionsStore';
import { useT } from '../i18n';
import { Badge, Card, EmptyState } from '../components/ui';
import { LatestNews } from './News';
import { UpcomingEvents } from './Calendar';

interface Tile { to: string; key: string; icon: LucideIcon; color: string; roles?: string[]; sub?: string }

export default function Dashboard() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const { lessons, rooms } = useScheduleStore();
  const subs = useSubsStore(x => x.subs);
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const hhmm = format(now, 'HH:mm');
  const wd = getDay(now);
  const isSchool = wd >= 1 && wd <= 5;
  const scope = scopeStudentIds(user, db);
  const classIds = new Set(db.users.filter(u => scope.includes(u.id)).map(u => u.classId));
  const current = BELLS.findIndex(([s, e]) => hhmm >= s && hhmm <= e) + 1;

  const subj = (id: string) => db.subjects.find(s => s.id === id)?.name ?? '';
  const cls = (id: string) => db.classes.find(c => c.id === id)?.name ?? '';
  const room = (id: string) => rooms.find(r => r.id === id)?.name ?? '';
  const tname = (id: string) => db.users.find(u => u.id === id)?.name ?? '';

  const todays = isSchool ? lessons
    .filter(l => l.weekday === wd && (user.role === 'admin' || (user.role === 'teacher' ? l.teacherId === user.id : classIds.has(l.classId))))
    .sort((a, b) => a.period - b.period) : [];

  const hwList = db.homework
    .filter(h => h.due >= today && (user.role === 'admin' || (user.role === 'teacher' ? !!user.subjectIds?.includes(h.subjectId) : classIds.has(h.classId))))
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 4);

  const tiles: Tile[] = [
    { to: '/grades', key: 'tileGrades', icon: Award, color: 'from-amber-400 to-orange-500' },
    { to: '/schedule', key: 'tileTimetable', icon: CalendarDays, color: 'from-sky-500 to-indigo-500' },
    { to: '/homework', key: 'tileHomework', icon: ClipboardList, color: 'from-emerald-500 to-teal-500', sub: String(hwList.length) },
    { to: '/journal', key: 'tileJournal', icon: BookOpen, color: 'from-indigo-500 to-violet-500', roles: ['admin', 'teacher'] },
  ].filter(x => !x.roles || x.roles.includes(user.role));

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-lg">
        <div className="text-sm opacity-80">{format(now, 'dd.MM.yyyy')}</div>
        <h1 className="font-display text-2xl font-bold">{t('hello')}, {user.name.split(' ')[0]}!</h1>
        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold opacity-90">{t('todayLessons')}</div>
          {!isSchool ? <p className="text-sm opacity-90">{t('weekendLabel')}</p>
            : !todays.length ? <p className="text-sm opacity-90">{t('noLessonsToday')}</p>
            : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {todays.map(l => {
                  const isNow = l.period === current;
                  return (
                    <div key={l.id} className={`min-w-[160px] rounded-2xl p-3 text-sm ${isNow ? 'bg-amber-400 text-stone-900' : 'bg-white/15 backdrop-blur'}`}>
                      <div className="text-xs opacity-80">{t('period')} {l.period} · {BELLS[l.period - 1][0]}</div>
                      <div className="mt-1 font-semibold">{subj(l.subjectId)}</div>
                      <div className="text-xs opacity-90">{cls(l.classId)} · {room(l.roomId)} · {tname(effectiveTeacher(l, today, subs)).split(' ').slice(-1)[0]}</div>
                      {isNow && <div className="mt-1 text-xs font-semibold">● {t('nowLabel')}</div>}
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(x => (
          <Link key={x.to} to={x.to}
            className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-stone-800 dark:bg-stone-900/80">
            <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow ${x.color}`}><x.icon size={24} /></span>
            <span className="flex-1 font-semibold">{t(x.key)}</span>
            {x.sub && <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs dark:bg-stone-800">{x.sub}</span>}
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold">{t('upcomingHw')}</h2>
        {!hwList.length ? <EmptyState text={t('noData')} /> : (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800">
            {hwList.map(h => {
              const done = user.role === 'student' || user.role === 'parent' ? !!h.submissions[scope[0]]?.done : null;
              return (
                <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{h.title}</div>
                    <div className="text-xs text-stone-500">{subj(h.subjectId)} · {cls(h.classId)} · {t('dueLabel')}: {h.due}</div>
                  </div>
                  {done !== null && <Badge tone={done ? 'emerald' : 'amber'}>{done ? t('doneLabel') : t('pendingLabel')}</Badge>}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <div className="grid gap-6 lg:grid-cols-2"><LatestNews /><UpcomingEvents /></div>
    </div>
  );
}
