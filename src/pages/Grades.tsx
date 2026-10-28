import { useState } from 'react';
import { useStore, useCurrentUser, scopeStudentIds, WEIGHTS } from '../store';
import { useT } from '../i18n';
import { Card } from '../components/ui';

const chip = (v: number) =>
  v >= 5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  : v >= 4 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
  : v >= 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';

export default function Grades() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const scope = scopeStudentIds(user, db);
  const [sid, setSid] = useState(scope[0]);
  const student = db.users.find(u => u.id === sid);
  const clsName = db.classes.find(c => c.id === student?.classId)?.name ?? '';

  const rows = db.subjects.map(s => {
    const gs = db.grades.filter(g => g.studentId === sid && g.subjectId === s.id).sort((a, b) => a.date.localeCompare(b.date));
    const pos = gs.filter(g => g.value > 0);
    const w = pos.reduce((a, g) => a + WEIGHTS[g.type], 0);
    const avg = w ? pos.reduce((a, g) => a + g.value * WEIGHTS[g.type], 0) / w : null;
    return { s, gs, avg };
  });
  const avgs = rows.map(r => r.avg).filter((x): x is number => x !== null);
  const overall = avgs.length ? (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2) : '—';
  const sel = 'rounded-lg border border-stone-300 bg-transparent px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">{t('quarterLabel')}</p>
          <h1 className="font-display text-2xl font-bold">
            {student?.name} <span className="text-base font-normal text-stone-500">{clsName}</span>
          </h1>
        </div>
        <div className="flex items-end gap-3">
          {scope.length > 1 && (
            <label className="text-sm">{t('choosePerson')}
              <select className={`mt-1 block ${sel}`} value={sid} onChange={e => setSid(e.target.value)}>
                {scope.map(id => <option key={id} value={id}>{db.users.find(u => u.id === id)?.name}</option>)}
              </select>
            </label>
          )}
          <Card className="px-5 py-3">
            <div className="text-xs text-stone-500">{t('overallAverage')}</div>
            <div className="font-display text-2xl font-bold text-indigo-600">{overall}</div>
          </Card>
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-stone-100 text-left dark:bg-stone-800">
            <tr>
              <th className="px-4 py-3">{t('subjectCol')}</th>
              <th className="px-4 py-3">{t('gradesCol')}</th>
              <th className="px-4 py-3 text-center">{t('averageCol')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, gs, avg }) => (
              <tr key={s.id} className="border-t border-stone-200 hover:bg-indigo-50/60 dark:border-stone-800 dark:hover:bg-indigo-950/40">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">
                  {gs.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {gs.map((g, i) => (
                        <span key={i} title={`${g.date} · ${t(g.type)}`}
                          className={`grid h-7 min-w-7 place-items-center rounded-md px-1.5 text-xs font-semibold ${chip(g.value)}`}>
                          {g.value === 0 ? t('nb') : g.value}
                        </span>
                      ))}
                    </div>
                  ) : <span className="text-stone-400">{t('noGradesYet')}</span>}
                </td>
                <td className="px-4 py-3 text-center font-display font-semibold">{avg === null ? '—' : avg.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
