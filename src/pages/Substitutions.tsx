import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useStore, useCurrentUser } from '../store';
import { useScheduleStore, BELLS } from '../scheduleStore';
import { useSubsStore, replacementFree, weekdayOf } from '../substitutionsStore';
import { userClassIds } from '../newsStore';
import { toast } from '../components/toast';
import { useT } from '../i18n';
import { Badge, Button, Card, EmptyState } from '../components/ui';

const inp = 'rounded-lg border border-stone-300 bg-transparent px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900';

export default function Substitutions() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const { lessons, rooms } = useScheduleStore();
  const { subs, addSub, removeSub } = useSubsStore();
  const isAdmin = user.role === 'admin';
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [lessonId, setLessonId] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const wd = weekdayOf(date);
  const isSchool = wd >= 1 && wd <= 5;
  const dayLessons = lessons.filter(l => l.weekday === wd).sort((a, b) => a.period - b.period);
  const lessonOf = (id: string) => lessons.find(l => l.id === id);
  const lesson = lessonOf(lessonId);
  const candidates = lesson
    ? db.users.filter(u => u.role === 'teacher' && replacementFree(lessons, subs, date, lesson, u.id))
    : [];

  const nameOf = (id: string) => db.users.find(u => u.id === id)?.name ?? '—';
  const clsName = (id: string) => db.classes.find(c => c.id === id)?.name ?? '';
  const subjName = (id: string) => db.subjects.find(s => s.id === id)?.name ?? '';
  const roomName = (id: string) => rooms.find(r => r.id === id)?.name ?? '';

  // Замены видят только затронутые классы; администратор — все
  const my = userClassIds(user, db, lessons);
  const daySubs = subs.filter(s => s.date === date && (isAdmin || my.includes(lessonOf(s.lessonId)?.classId ?? '')));

  const save = () => {
    if (!lesson || !teacherId) return toast(t('required'), 'error');
    const others = subs.filter(s => !(s.date === date && s.lessonId === lesson.id));
    if (!replacementFree(lessons, others, date, lesson, teacherId)) return toast(t('replacementBusy'), 'error');
    addSub({ date, lessonId: lesson.id, teacherId });
    setTeacherId('');
    toast(t('saved'));
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('subsTitle')}</h1>

      <Card className="flex flex-wrap items-end gap-3">
        <label className="text-sm">{t('date')}
          <input type="date" aria-label={t('date')} value={date} className={`mt-1 block ${inp}`}
            onChange={e => { setDate(e.target.value); setLessonId(''); setTeacherId(''); }} />
        </label>
        {isAdmin && isSchool && (
          <>
            <label className="text-sm">{t('lesson')}
              <select aria-label={t('lesson')} className={`mt-1 block ${inp}`} value={lessonId}
                onChange={e => { setLessonId(e.target.value); setTeacherId(''); }}>
                <option value="">—</option>
                {dayLessons.map(l => (
                  <option key={l.id} value={l.id}>{t('period')} {l.period} · {clsName(l.classId)} · {subjName(l.subjectId)} ({nameOf(l.teacherId)})</option>
                ))}
              </select>
            </label>
            <label className="text-sm">{t('replacementFor')}
              <select aria-label={t('replacementFor')} className={`mt-1 block ${inp}`} value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                <option value="">—</option>
                {candidates.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <Button onClick={save} disabled={!lessonId || !teacherId}>{t('addSub')}</Button>
          </>
        )}
      </Card>

      {!isSchool ? <EmptyState text={t('weekendLabel')} /> : !daySubs.length ? <EmptyState text={t('noSubs')} /> : (
        <ul className="space-y-3">
          {daySubs.map(s => {
            const l = lessonOf(s.lessonId);
            if (!l) return null;
            return (
              <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-semibold">{t('period')} {l.period} · {BELLS[l.period - 1][0]} · {clsName(l.classId)} · {subjName(l.subjectId)}</div>
                  <div className="text-sm text-stone-500">{t('originalTeacher')}: {nameOf(l.teacherId)}</div>
                  <div className="text-sm">{t('replacementFor')}: <Badge tone="emerald">{nameOf(s.teacherId)}</Badge> <span className="text-stone-500">· {roomName(l.roomId)}</span></div>
                </div>
                {isAdmin && (
                  <button aria-label={t('deleteLesson')} onClick={() => { removeSub(s.id); toast(t('deleted')); }} className="hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
