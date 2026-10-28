import { useState } from 'react';
import { format } from 'date-fns';
import { useStore, useCurrentUser, WEIGHTS, type GradeType } from '../store';
import { useT } from '../i18n';
import { Button, Card, EmptyState } from '../components/ui';

const TYPES: GradeType[] = ['current', 'test', 'independent', 'homeworkType'];

export default function Journal() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const subjects = db.subjects.filter(s => user.role === 'admin' || user.subjectIds?.includes(s.id));
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [classId, setClassId] = useState(db.classes[0]?.id ?? '');
  const [type, setType] = useState<GradeType>('current');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const students = db.users.filter(u => u.role === 'student' && u.classId === classId);
  const dates = [...new Set([
    ...db.grades.filter(g => g.subjectId === subjectId && students.some(s => s.id === g.studentId)).map(g => g.date),
    ...(newDate ? [newDate] : []),
  ])].sort();

  const cell = (sid: string, date: string) =>
    db.grades.find(g => g.studentId === sid && g.subjectId === subjectId && g.date === date);

  // Четвертная оценка: средневзвешенная по типам, округление до целого
  const quarter = (sid: string) => {
    const gs = db.grades.filter(g => g.studentId === sid && g.subjectId === subjectId && g.value > 0);
    const w = gs.reduce((a, g) => a + WEIGHTS[g.type], 0);
    if (!w) return '—';
    return String(Math.round(gs.reduce((a, g) => a + g.value * WEIGHTS[g.type], 0) / w));
  };

  const exportCsv = () => {
    const rows = [['Ученик', ...dates, 'Четверть'], ...students.map(s => [s.name, ...dates.map(d => {
      const g = cell(s.id, d); return g ? (g.value === 0 ? 'н/б' : g.value) : '';
    }), quarter(s.id)])];
    const csv = rows.map(r => r.join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `journal-${subjectId}-${classId}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const sel = 'rounded-lg border border-stone-300 bg-transparent px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">{t('subject')}
          <select className={`mt-1 block ${sel}`} value={subjectId} onChange={e => setSubjectId(e.target.value)}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="text-sm">{t('class')}
          <select className={`mt-1 block ${sel}`} value={classId} onChange={e => setClassId(e.target.value)}>
            {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="text-sm">{t('type')}
          <select className={`mt-1 block ${sel}`} value={type} onChange={e => setType(e.target.value as GradeType)}>
            {TYPES.map(x => <option key={x} value={x}>{t(x)}</option>)}
          </select>
        </label>
        <label className="text-sm">{t('date')}
          <input type="date" aria-label={t('date')} className={`mt-1 block ${sel}`} value={newDate} onChange={e => setNewDate(e.target.value)} />
        </label>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" onClick={() => students.forEach(s => db.setAttendance(s.id, newDate, 'present'))}>{t('markAllPresent')}</Button>
          <Button variant="ghost" onClick={exportCsv}>{t('exportCsv')}</Button>
        </div>
      </div>

      {!students.length ? <EmptyState text={t('noData')} /> : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-max text-sm">
            <thead className="bg-stone-100 text-left dark:bg-stone-800">
              <tr>
                <th className="sticky left-0 z-[1] bg-stone-100 px-4 py-3 dark:bg-stone-800">{t('students')}</th>
                {dates.map(d => <th key={d} className="px-3 py-3 font-medium">{d.slice(5)}</th>)}
                <th className="px-4 py-3">{t('quarterGrade')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t border-stone-200 hover:bg-indigo-50/60 dark:border-stone-800 dark:hover:bg-indigo-950/40">
                  <td className="sticky left-0 bg-white px-4 py-2 font-medium dark:bg-stone-900">{s.name}</td>
                  {dates.map(d => (
                    <td key={d} className="px-2 py-2">
                      <select aria-label={`${s.name} ${d}`} className="w-20 rounded-md border border-stone-300 bg-transparent px-1 py-1 dark:border-stone-700"
                        value={cell(s.id, d)?.value ?? ''}
                        onChange={e => {
                          const v = e.target.value;
                          db.setGrade(s.id, subjectId, d, v === '' ? null : Number(v), cell(s.id, d)?.type ?? type);
                        }}>
                        <option value="">—</option>
                        {[5, 4, 3, 2].map(v => <option key={v} value={v}>{v}</option>)}
                        <option value={0}>{t('nb')}</option>
                      </select>
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center font-display font-semibold">{quarter(s.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
