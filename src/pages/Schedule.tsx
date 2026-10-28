import { Fragment, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useStore, useCurrentUser } from '../store';
import { useScheduleStore, BELLS, DAYS, type Lesson } from '../scheduleStore';
import { useT } from '../i18n';
import { Button, Card } from '../components/ui';

const DAY_KEYS = ['', 'mon', 'tue', 'wed', 'thu', 'fri'];
const sel = 'rounded-lg border border-stone-300 bg-transparent px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900';

export default function Schedule() {
  const t = useT();
  const user = useCurrentUser()!;
  const db = useStore();
  const { rooms, lessons, addLesson, removeLesson } = useScheduleStore();
  const isAdmin = user.role === 'admin';
  const teachers = db.users.filter(u => u.role === 'teacher');
  const lockedClass = user.role === 'student' ? user.classId
    : user.role === 'parent' ? db.users.find(u => u.id === user.childIds?.[0])?.classId : undefined;

  const [classF, setClassF] = useState('');
  const [teacherF, setTeacherF] = useState('');
  const [roomF, setRoomF] = useState('');
  const [slot, setSlot] = useState<{ weekday: number; period: number } | null>(null);
  const [draft, setDraft] = useState({ classId: db.classes[0].id, subjectId: db.subjects[0].id, teacherId: teachers[0].id, roomId: rooms[0].id });
  const [error, setError] = useState('');

  const visible = lessons.filter(l => {
    if (user.role === 'teacher') return l.teacherId === user.id;
    if (lockedClass) return l.classId === lockedClass;
    return (!classF || l.classId === classF) && (!teacherF || l.teacherId === teacherF) && (!roomF || l.roomId === roomF);
  });

  const name = {
    cls: (id: string) => db.classes.find(c => c.id === id)?.name ?? '',
    subj: (id: string) => db.subjects.find(s => s.id === id)?.name ?? '',
    teacher: (id: string) => db.users.find(u => u.id === id)?.name ?? '',
    room: (id: string) => rooms.find(r => r.id === id)?.name ?? '',
  };

  const save = () => {
    if (!slot) return;
    const err = addLesson({ ...slot, ...draft });
    if (err) return setError(t(err));
    setError('');
    setSlot(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold">{t('schedule')}</h1>
        {isAdmin && (
          <>
            <select aria-label={t('class')} className={sel} value={classF} onChange={e => setClassF(e.target.value)}>
              <option value="">{t('allClasses')}</option>
              {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select aria-label={t('teacher')} className={sel} value={teacherF} onChange={e => setTeacherF(e.target.value)}>
              <option value="">{t('allTeachers')}</option>
              {teachers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select aria-label={t('room')} className={sel} value={roomF} onChange={e => setRoomF(e.target.value)}>
              <option value="">{t('allRooms')}</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </>
        )}
      </div>

      {isAdmin && slot && (
        <Card className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <p className="font-semibold sm:col-span-2 lg:col-span-4">{t(DAY_KEYS[slot.weekday])} · {t('period')} {slot.period}</p>
          <select aria-label={t('class')} className={sel} value={draft.classId} onChange={e => setDraft({ ...draft, classId: e.target.value })}>
            {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select aria-label={t('subject')} className={sel} value={draft.subjectId} onChange={e => setDraft({ ...draft, subjectId: e.target.value })}>
            {db.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select aria-label={t('teacher')} className={sel} value={draft.teacherId} onChange={e => setDraft({ ...draft, teacherId: e.target.value })}>
            {teachers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select aria-label={t('room')} className={sel} value={draft.roomId} onChange={e => setDraft({ ...draft, roomId: e.target.value })}>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {error && <p role="alert" className="text-sm text-rose-600 sm:col-span-2 lg:col-span-4">{error}</p>}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
            <Button onClick={save}>{t('addLesson')}</Button>
            <Button variant="ghost" onClick={() => setSlot(null)}>{t('cancel')}</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-x-auto p-3">
        <div className="grid min-w-[720px] grid-cols-[110px_repeat(5,minmax(0,1fr))] gap-2 text-sm">
          <div />
          {DAYS.map(d => <div key={d} className="py-2 text-center font-semibold">{t(DAY_KEYS[d])}</div>)}
          {BELLS.map((bell, i) => {
            const p = i + 1;
            return (
              <Fragment key={p}>
                <div className="flex flex-col justify-center text-xs text-stone-500">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">{t('period')} {p}</span>
                  {bell[0]}–{bell[1]}
                </div>
                {DAYS.map(d => {
                  const items = visible.filter(l => l.weekday === d && l.period === p);
                  return (
                    <div key={d} className="min-h-20 space-y-1 rounded-xl border border-dashed border-stone-200 p-1.5 dark:border-stone-800">
                      {items.map((l: Lesson) => (
                        <div key={l.id} className="rounded-lg bg-indigo-50 p-2 text-xs dark:bg-indigo-950/60">
                          <div className="font-semibold text-indigo-700 dark:text-indigo-300">{name.subj(l.subjectId)}</div>
                          <div className="text-stone-600 dark:text-stone-400">{name.teacher(l.teacherId)}</div>
                          <div className="flex items-center justify-between text-stone-500">
                            <span>{name.cls(l.classId)} · {name.room(l.roomId)}</span>
                            {isAdmin && (
                              <button aria-label={t('deleteLesson')} onClick={() => removeLesson(l.id)} className="hover:text-rose-600">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {isAdmin && (
                        <button aria-label={t('addLesson')} onClick={() => { setSlot({ weekday: d, period: p }); setError(''); }}
                          className="w-full rounded-lg py-1 text-xs text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800">+</button>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
