import { useState } from 'react';
import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useStore, useCurrentUser } from '../store';
import { useScheduleStore } from '../scheduleStore';
import { useCalendarStore, type CalEvent, type EventType } from '../calendarStore';
import { userClassIds } from '../newsStore';
import { toast } from '../components/toast';
import { useT } from '../i18n';
import { Badge, Button, Card, EmptyState } from '../components/ui';

const TYPES: EventType[] = ['event', 'exam', 'holiday', 'meeting'];
const TONE: Record<EventType, 'indigo' | 'rose' | 'emerald' | 'amber'> = { event: 'indigo', exam: 'rose', holiday: 'emerald', meeting: 'amber' };
const KEY: Record<EventType, string> = { event: 'evEvent', exam: 'evExam', holiday: 'evHoliday', meeting: 'evMeeting' };
const inp = 'rounded-lg border border-stone-300 bg-transparent px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900';
const dayKey = (d: Date) => format(d, 'yyyy-MM-dd');

export default function Calendar() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const lang = useStore(s => s.lang);
  const lessons = useScheduleStore(s => s.lessons);
  const { events, addEvent, removeEvent } = useCalendarStore();
  const canEdit = user.role === 'admin' || user.role === 'teacher';
  const myClasses = userClassIds(user, db, lessons);
  const classOptions = user.role === 'admin' ? db.classes : db.classes.filter(c => myClasses.includes(c.id));
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'kk' ? 'kk-KZ' : 'en-US';

  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selected, setSelected] = useState(dayKey(new Date()));
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('event');
  const [classId, setClassId] = useState('');

  const visible = events.filter((e: CalEvent) => !e.classId || myClasses.includes(e.classId));
  const days = view === 'month'
    ? eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }) })
    : eachDayOfInterval({ start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }) });
  const evOn = (key: string) => visible.filter(e => e.date === key);
  const shift = (n: number) => setCursor(view === 'month' ? addMonths(cursor, n) : addWeeks(cursor, n));
  const weekdayLabel = (i: number) => new Date(2026, 0, 5 + i).toLocaleDateString(locale, { weekday: 'short' });

  const save = () => {
    if (!title.trim()) return toast(t('required'), 'error');
    addEvent({ date: selected, title: title.trim(), type, classId: classId || undefined });
    setTitle('');
    toast(t('saved'));
  };

  const dayEvents = evOn(selected);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold capitalize">
          {cursor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setView('month')}>{t('month')}</Button>
          <Button variant="ghost" onClick={() => setView('week')}>{t('week')}</Button>
          <Button variant="ghost" onClick={() => { setCursor(new Date()); setSelected(dayKey(new Date())); }}>{t('today')}</Button>
          <button aria-label="‹" onClick={() => shift(-1)} className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800"><ChevronLeft size={18} /></button>
          <button aria-label="›" onClick={() => shift(1)} className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800"><ChevronRight size={18} /></button>
        </div>
      </div>

      <Card className="p-3">
        <div className="grid grid-cols-7 gap-1 pb-2 text-center text-xs font-semibold text-stone-500">
          {[0, 1, 2, 3, 4, 5, 6].map(i => <div key={i}>{weekdayLabel(i)}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(d => {
            const k = dayKey(d);
            const list = evOn(k);
            const on = k === selected;
            return (
              <button key={k} onClick={() => setSelected(k)} aria-label={k}
                className={`flex ${view === 'month' ? 'min-h-20' : 'min-h-32'} flex-col gap-1 rounded-xl border p-1.5 text-left text-xs transition
                  ${on ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50' : 'border-stone-200 hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800'}
                  ${view === 'month' && !isSameMonth(d, cursor) ? 'opacity-40' : ''}`}>
                <span className={`inline-grid h-6 w-6 place-items-center rounded-full font-semibold ${isToday(d) ? 'bg-indigo-600 text-white' : ''}`}>{format(d, 'd')}</span>
                {list.slice(0, 2).map(e => <span key={e.id} className="truncate rounded px-1 py-0.5 font-medium" style={{}}><Badge tone={TONE[e.type]}>{e.title}</Badge></span>)}
                {list.length > 2 && <span className="text-stone-500">+{list.length - 2}</span>}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg font-semibold">{selected}</h2>
        {!dayEvents.length ? <EmptyState text={t('noEvents')} /> : (
          <ul className="space-y-2">
            {dayEvents.map(e => (
              <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl bg-stone-100 px-3 py-2 text-sm dark:bg-stone-800">
                <span className="flex items-center gap-2"><Badge tone={TONE[e.type]}>{t(KEY[e.type])}</Badge>{e.title}</span>
                {canEdit && (
                  <button aria-label={t('deleteLesson')} onClick={() => { removeEvent(e.id); toast(t('deleted')); }} className="hover:text-rose-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit && (
          <div className="flex flex-wrap gap-2 border-t border-stone-200 pt-4 dark:border-stone-800">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('title')} className={`min-w-[200px] flex-1 ${inp}`} />
            <select aria-label={t('type')} className={inp} value={type} onChange={e => setType(e.target.value as EventType)}>
              {TYPES.map(x => <option key={x} value={x}>{t(KEY[x])}</option>)}
            </select>
            <select aria-label={t('class')} className={inp} value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">{t('audAll')}</option>
              {classOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button onClick={save}>{t('addEvent')}</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// Ближайшие события для главной страницы
export function UpcomingEvents() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const lessons = useScheduleStore(s => s.lessons);
  const events = useCalendarStore(s => s.events);
  const my = userClassIds(user, db, lessons);
  const today = dayKey(new Date());
  const items = events
    .filter(e => e.date >= today && (!e.classId || my.includes(e.classId)))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  return (
    <Card>
      <h2 className="mb-3 font-display text-lg font-semibold">{t('upcomingEvents')}</h2>
      {!items.length ? <EmptyState text={t('noEvents')} /> : (
        <ul className="divide-y divide-stone-200 dark:divide-stone-800">
          {items.map(e => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
              <span><span className="block font-medium">{e.title}</span><span className="text-xs text-stone-500">{e.date}</span></span>
              <Badge tone={TONE[e.type]}>{t(KEY[e.type])}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
