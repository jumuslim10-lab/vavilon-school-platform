import { useState } from 'react';
import { ArrowRightLeft, Plus, Search, Trash2 } from 'lucide-react';
import { useStore, useCurrentUser, WEIGHTS, type User } from '../store';
import { useScheduleStore } from '../scheduleStore';
import { useStudentsStore } from '../studentsStore';
import { useT } from '../i18n';
import { Badge, Button, Card, EmptyState } from '../components/ui';

type Tab = 'students' | 'classes' | 'teachers';
const inp = 'rounded-lg border border-stone-300 bg-transparent px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900';
const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl bg-stone-100 p-3 dark:bg-stone-800">
    <div className="text-xs text-stone-500">{label}</div>
    <div className="font-display text-xl font-bold">{value}</div>
  </div>
);

export default function Students() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const { lessons } = useScheduleStore();
  const { classTeacher, docs, setClassTeacher, addDoc, removeDoc } = useStudentsStore();
  const isAdmin = user.role === 'admin';
  const [tab, setTab] = useState<Tab>('students');
  const [q, setQ] = useState('');
  const [classF, setClassF] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [moveTo, setMoveTo] = useState('');

  // Учитель видит только классы, где ведёт уроки; администратор — всё
  const myClassIds = lessons.filter(l => l.teacherId === user.id).map(l => l.classId);
  const classes = db.classes.filter(c => isAdmin || myClassIds.includes(c.id));
  const students = db.users.filter(u => u.role === 'student' && (isAdmin || myClassIds.includes(u.classId ?? '')));
  const filtered = students.filter(s =>
    (!classF || s.classId === classF) && s.name.toLowerCase().includes(q.trim().toLowerCase()));
  const sel: User | null = db.users.find(u => u.id === selId) ?? null;
  const teachers = db.users.filter(u => u.role === 'teacher');

  const className = (id?: string) => db.classes.find(c => c.id === id)?.name ?? '—';
  const avgOf = (sid: string): number | null => {
    const gs = db.grades.filter(g => g.studentId === sid && g.value > 0);
    const w = gs.reduce((a, g) => a + WEIGHTS[g.type], 0);
    return w ? gs.reduce((a, g) => a + g.value * WEIGHTS[g.type], 0) / w : null;
  };
  const absences = (sid: string) => db.attendance.filter(a => a.studentId === sid && (a.status === 'absent' || a.status === 'absentExcused')).length;
  // Зона риска: средний балл ниже 3.5 или 3 и более пропусков
  const isRisk = (sid: string) => { const a = avgOf(sid); return (a !== null && a < 3.5) || absences(sid) >= 3; };
  const parents = (sid: string) => db.users.filter(u => u.role === 'parent' && u.childIds?.includes(sid));
  const classAvg = (cid: string) => {
    const vs = db.users.filter(u => u.role === 'student' && u.classId === cid).map(u => avgOf(u.id)).filter((x): x is number => x !== null);
    return vs.length ? (vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(2) : '—';
  };

  const transfer = () => { if (sel && moveTo) { db.moveStudent(sel.id, moveTo); setMoveTo(''); } };
  const saveDoc = () => { if (sel && docName.trim()) { addDoc(sel.id, docName.trim()); setDocName(''); } };

  const tabs: Tab[] = ['students', 'classes', 'teachers'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map(x => <Button key={x} variant={tab === x ? 'primary' : 'ghost'} onClick={() => setTab(x)}>{t(x)}</Button>)}
      </div>

      {tab === 'students' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[180px] flex-1">
                <Search size={16} className="absolute left-2.5 top-2.5 text-stone-400" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')} className={`w-full pl-8 ${inp}`} />
              </div>
              <select aria-label={t('class')} className={inp} value={classF} onChange={e => setClassF(e.target.value)}>
                <option value="">{t('allClasses')}</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {!filtered.length ? <EmptyState text={t('noData')} /> : (
              <ul className="space-y-1">
                {filtered.map(s => {
                  const a = avgOf(s.id);
                  return (
                    <li key={s.id}>
                      <button onClick={() => setSelId(s.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${selId === s.id ? 'bg-indigo-50 dark:bg-indigo-950/50' : 'hover:bg-stone-50 dark:hover:bg-stone-800'}`}>
                        <span>
                          <span className="block font-medium">{s.name}</span>
                          <span className="text-xs text-stone-500">{className(s.classId)}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          {isRisk(s.id) && <Badge tone="rose">{t('riskZone')}</Badge>}
                          <span className="font-display font-semibold">{a === null ? '—' : a.toFixed(2)}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="space-y-5">
            {!sel ? <EmptyState text={t('selectStudent')} /> : (
              <>
                <div>
                  <h2 className="font-display text-xl font-bold">{sel.name}</h2>
                  <p className="text-sm text-stone-500">{className(sel.classId)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label={t('averageCol')} value={avgOf(sel.id)?.toFixed(2) ?? '—'} />
                  <Stat label={t('absences')} value={absences(sel.id)} />
                </div>
                <section>
                  <h3 className="mb-1 text-sm font-semibold">{t('parents')}</h3>
                  {parents(sel.id).length
                    ? parents(sel.id).map(p => <div key={p.id} className="text-sm">{p.name}</div>)
                    : <p className="text-sm text-stone-500">{t('noParents')}</p>}
                </section>
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">{t('documents')}</h3>
                  {!(docs[sel.id]?.length) && <p className="text-sm text-stone-500">{t('noDocs')}</p>}
                  {(docs[sel.id] ?? []).map(d => (
                    <div key={d.id} className="flex items-center justify-between rounded-lg bg-stone-100 px-3 py-1.5 text-sm dark:bg-stone-800">
                      <span className="truncate">{d.name} <span className="text-xs text-stone-500">{d.addedAt}</span></span>
                      {isAdmin && <button aria-label={t('deleteLesson')} onClick={() => removeDoc(sel.id, d.id)} className="hover:text-rose-600"><Trash2 size={14} /></button>}
                    </div>
                  ))}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <input value={docName} onChange={e => setDocName(e.target.value)} placeholder={t('docName')} className={`flex-1 ${inp}`} />
                      <Button variant="ghost" onClick={saveDoc} aria-label={t('addDoc')}><Plus size={16} /></Button>
                    </div>
                  )}
                </section>
                {isAdmin && (
                  <section className="space-y-2">
                    <h3 className="text-sm font-semibold">{t('transferTo')}</h3>
                    <div className="flex gap-2">
                      <select aria-label={t('transferTo')} className={`flex-1 ${inp}`} value={moveTo} onChange={e => setMoveTo(e.target.value)}>
                        <option value="">—</option>
                        {db.classes.filter(c => c.id !== sel.classId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <Button onClick={transfer} disabled={!moveTo} aria-label={t('transfer')}><ArrowRightLeft size={16} /></Button>
                    </div>
                  </section>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {tab === 'classes' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map(c => {
            const count = db.users.filter(u => u.role === 'student' && u.classId === c.id).length;
            const teacher = db.users.find(u => u.id === classTeacher[c.id]);
            return (
              <Card key={c.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">{c.name}</h3>
                  <Badge>{count} {t('studentsShort')}</Badge>
                </div>
                <div className="text-sm"><span className="text-stone-500">{t('classTeacher')}: </span>{teacher?.name ?? '—'}</div>
                <div className="text-sm"><span className="text-stone-500">{t('classAverage')}: </span>{classAvg(c.id)}</div>
                {isAdmin && (
                  <select aria-label={t('classTeacher')} className={`w-full ${inp}`} value={classTeacher[c.id] ?? ''} onChange={e => setClassTeacher(c.id, e.target.value)}>
                    <option value="">—</option>
                    {teachers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'teachers' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-stone-100 text-left dark:bg-stone-800">
              <tr>
                <th className="px-4 py-3">{t('teacher')}</th>
                <th className="px-4 py-3">{t('subject')}</th>
                <th className="px-4 py-3">{t('classesLabel')}</th>
                <th className="px-4 py-3">{t('hoursWeek')}</th>
                <th className="px-4 py-3">{t('homeroomOf')}</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(u => {
                const ownLessons = lessons.filter(l => l.teacherId === u.id);
                const cls = [...new Set(ownLessons.map(l => l.classId))].map(id => db.classes.find(c => c.id === id)?.name).filter(Boolean);
                const homeroom = db.classes.filter(c => classTeacher[c.id] === u.id).map(c => c.name);
                return (
                  <tr key={u.id} className="border-t border-stone-200 hover:bg-indigo-50/60 dark:border-stone-800 dark:hover:bg-indigo-950/40">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3">{db.subjects.filter(s => u.subjectIds?.includes(s.id)).map(s => s.name).join(', ') || '—'}</td>
                    <td className="px-4 py-3">{cls.join(', ') || '—'}</td>
                    <td className="px-4 py-3 font-display font-semibold">{ownLessons.length}</td>
                    <td className="px-4 py-3">{homeroom.join(', ') || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
