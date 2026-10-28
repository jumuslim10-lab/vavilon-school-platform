import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { useStore, useCurrentUser, scopeStudentIds, type Homework as HW } from '../store';
import { useT } from '../i18n';
import { Badge, Button, Card, EmptyState } from '../components/ui';

type Filter = 'all' | 'active' | 'overdue' | 'done';
const today = format(new Date(), 'yyyy-MM-dd');
const inp = 'w-full rounded-lg border border-stone-300 bg-transparent px-3 py-2 text-sm dark:border-stone-700';

export default function Homework() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ subjectId: '', classId: '', title: '', description: '', due: format(addDays(new Date(), 7), 'yyyy-MM-dd') });

  const scope = scopeStudentIds(user, db);
  const scopeClasses = db.users.filter(u => scope.includes(u.id)).map(u => u.classId);
  const mySubjects = db.subjects.filter(s => user.role === 'admin' || user.subjectIds?.includes(s.id));
  const isTeacher = user.role === 'teacher' || user.role === 'admin';

  const visible = db.homework.filter(h =>
    user.role === 'admin' || (user.role === 'teacher' ? user.subjectIds?.includes(h.subjectId) : scopeClasses.includes(h.classId)));

  const isDone = (h: HW, sid: string) => !!h.submissions[sid]?.done;
  const list = visible.filter(h => {
    if (isTeacher || filter === 'all') return true;
    const sid = scope[0];
    if (filter === 'done') return isDone(h, sid);
    if (filter === 'overdue') return h.due < today && !isDone(h, sid);
    return h.due >= today && !isDone(h, sid);
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.classId || !form.title.trim()) return setError(t('required'));
    db.addHomework({ ...form });
    setForm({ ...form, title: '', description: '' });
    setError('');
  };

  const subjName = (id: string) => db.subjects.find(s => s.id === id)?.name ?? '';
  const className = (id: string) => db.classes.find(c => c.id === id)?.name ?? '';

  return (
    <div className="space-y-6">
      {isTeacher ? (
        <Card>
          <form onSubmit={submit} noValidate className="grid gap-3 md:grid-cols-2">
            <h2 className="font-display text-lg font-semibold md:col-span-2">{t('create')}</h2>
            <label className="text-sm">{t('subject')}
              <select className={`mt-1 ${inp}`} value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                <option value="">—</option>{mySubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="text-sm">{t('class')}
              <select className={`mt-1 ${inp}`} value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}>
                <option value="">—</option>{db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="text-sm">{t('title')}
              <input className={`mt-1 ${inp}`} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="text-sm">{t('due')}
              <input type="date" className={`mt-1 ${inp}`} value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} />
            </label>
            <label className="text-sm md:col-span-2">{t('description')}
              <textarea rows={2} className={`mt-1 ${inp}`} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </label>
            {error && <p role="alert" className="text-sm text-rose-600 md:col-span-2">{error}</p>}
            <div className="md:col-span-2"><Button type="submit">{t('add')}</Button></div>
          </form>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'overdue', 'done'] as Filter[]).map(f => (
            <Button key={f} variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)}>
              {t({ all: 'filterAll', active: 'filterActive', overdue: 'filterOverdue', done: 'filterDone' }[f])}
            </Button>
          ))}
        </div>
      )}

      {!list.length ? <EmptyState text={t('noData')} /> : list.map(h => (
        <Card key={h.id}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{h.title}</h3>
              <p className="text-sm text-stone-500">{subjName(h.subjectId)} · {className(h.classId)} · {t('due')}: {h.due}</p>
              {h.description && <p className="mt-2 text-sm">{h.description}</p>}
            </div>
            {!isTeacher && (
              <Badge tone={isDone(h, scope[0]) ? 'emerald' : h.due < today ? 'rose' : 'amber'}>
                {isDone(h, scope[0]) ? t('done') : h.due < today ? t('filterOverdue') : t('notDone')}
              </Badge>
            )}
          </div>

          {isTeacher ? (
            <div className="mt-4 grid gap-2">
              {db.users.filter(u => u.role === 'student' && u.classId === h.classId).map(s => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-100/70 px-3 py-2 text-sm dark:bg-stone-800/70">
                  <span>{s.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge tone={isDone(h, s.id) ? 'emerald' : 'amber'}>{isDone(h, s.id) ? t('submitted') : t('notDone')}</Badge>
                    <select aria-label={`${t('grade')} ${s.name}`} className="rounded-md border border-stone-300 bg-transparent px-2 py-1 dark:border-stone-700"
                      value={h.submissions[s.id]?.grade ?? ''} onChange={e => e.target.value && db.setHwGrade(h.id, s.id, Number(e.target.value))}>
                      <option value="">{t('grade')}</option>
                      {[5, 4, 3, 2].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : user.role === 'student' ? (
            <div className="mt-4 flex items-center gap-3">
              <Button variant="ghost" onClick={() => db.setDone(h.id, user.id, !isDone(h, user.id))}>
                {isDone(h, user.id) ? t('notDone') : t('done')}
              </Button>
              {h.submissions[user.id]?.grade && <span className="text-sm">{t('grade')}: {h.submissions[user.id].grade}</span>}
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
