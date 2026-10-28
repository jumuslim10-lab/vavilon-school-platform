import { useState, type ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Printer } from 'lucide-react';
import { useStore, useCurrentUser } from '../store';
import { useScheduleStore } from '../scheduleStore';
import { avgOf, absencesOf, riskOf, downloadCsv } from '../reports';
import { useT } from '../i18n';
import { Badge, Button, Card, EmptyState } from '../components/ui';

type Tab = 'risk' | 'classes' | 'subjects' | 'attendance';
const TABS: Tab[] = ['risk', 'classes', 'subjects', 'attendance'];
const TAB_KEY: Record<Tab, string> = { risk: 'riskTab', classes: 'classesTab', subjects: 'subjectsTab', attendance: 'attendanceTab' };
const fmt = (v: number | null) => (v === null ? '—' : v.toFixed(2));

const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <Card className="overflow-x-auto p-0">
    <table className="w-full min-w-[480px] text-sm">
      <thead className="bg-stone-100 text-left dark:bg-stone-800">
        <tr>{head.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-stone-200 hover:bg-indigo-50/60 dark:border-stone-800 dark:hover:bg-indigo-950/40">
            {r.map((c, j) => <td key={j} className="px-4 py-2.5">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </Card>
);

export default function Reports() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const lessons = useScheduleStore(s => s.lessons);
  const [tab, setTab] = useState<Tab>('risk');

  // Администратор видит всё, учитель — свои классы
  const classIds = user.role === 'admin' ? db.classes.map(c => c.id) : [...new Set(lessons.filter(l => l.teacherId === user.id).map(l => l.classId))];
  const classes = db.classes.filter(c => classIds.includes(c.id));
  const students = db.users.filter(u => u.role === 'student' && classIds.includes(u.classId ?? ''));
  const cls = (id?: string) => db.classes.find(c => c.id === id)?.name ?? '—';

  const riskRows = students
    .map(s => ({ s, avg: avgOf(db, s.id), abs: absencesOf(db, s.id), r: riskOf(db, s.id) }))
    .filter(x => x.r.risk)
    .sort((a, b) => (a.avg ?? 9) - (b.avg ?? 9));

  const classRows = classes.map(c => {
    const ss = students.filter(s => s.classId === c.id);
    const avgs = ss.map(s => avgOf(db, s.id)).filter((x): x is number => x !== null);
    const recs = db.attendance.filter(a => ss.some(s => s.id === a.studentId));
    const present = recs.filter(a => a.status === 'present' || a.status === 'late').length;
    return {
      c, n: ss.length,
      avg: avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null,
      risk: ss.filter(s => riskOf(db, s.id).risk).length,
      pct: recs.length ? Math.round((present / recs.length) * 100) : null,
    };
  });

  const subjectRows = db.subjects.map(s => {
    const vals = db.grades.filter(g => g.subjectId === s.id && g.value > 0 && students.some(x => x.id === g.studentId)).map(g => g.value);
    return { s, n: vals.length, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
  });

  const dates = [...new Set(db.attendance.filter(a => students.some(s => s.id === a.studentId)).map(a => a.date))].sort();
  const attRows = dates.map(d => {
    const recs = db.attendance.filter(a => a.date === d && students.some(s => s.id === a.studentId));
    return {
      date: d,
      absent: recs.filter(a => a.status === 'absent' || a.status === 'absentExcused').length,
      late: recs.filter(a => a.status === 'late').length,
    };
  });

  const exportCsvTab = () => {
    let rows: (string | number)[][] = [];
    if (tab === 'risk') rows = [[t('student'), t('class'), t('averageCol'), t('absences'), t('reason')],
      ...riskRows.map(x => [x.s.name, cls(x.s.classId), fmt(x.avg), x.abs, [x.r.low ? t('riskLow') : '', x.r.absent ? t('riskAbsent') : ''].filter(Boolean).join(', ')])];
    if (tab === 'classes') rows = [[t('class'), t('students'), t('classAvgCol'), t('riskCount'), t('attendancePct')],
      ...classRows.map(x => [x.c.name, x.n, fmt(x.avg), x.risk, x.pct === null ? '' : `${x.pct}%`])];
    if (tab === 'subjects') rows = [[t('subject'), t('gradesCount'), t('averageCol')],
      ...subjectRows.map(x => [x.s.name, x.n, fmt(x.avg)])];
    if (tab === 'attendance') rows = [[t('date'), t('absentCol'), t('lateCol')],
      ...attRows.map(x => [x.date, x.absent, x.late])];
    downloadCsv(`${tab}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold">{t('reports')}</h1>
        <div className="flex gap-2 print:hidden">
          <Button variant="ghost" onClick={exportCsvTab}><Download size={16} className="mr-1 inline" />{t('exportCsv')}</Button>
          <Button variant="ghost" onClick={() => window.print()}><Printer size={16} className="mr-1 inline" />{t('printPdf')}</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        {TABS.map(x => <Button key={x} variant={tab === x ? 'primary' : 'ghost'} onClick={() => setTab(x)}>{t(TAB_KEY[x])}</Button>)}
      </div>

      {tab === 'risk' && (!riskRows.length ? <EmptyState text={t('noData')} /> : (
        <Table head={[t('student'), t('class'), t('averageCol'), t('absences'), t('reason')]}
          rows={riskRows.map(x => [
            x.s.name, cls(x.s.classId), fmt(x.avg), x.abs,
            <span className="flex flex-wrap gap-1" key="r">
              {x.r.low && <Badge tone="rose">{t('riskLow')}</Badge>}
              {x.r.absent && <Badge tone="amber">{t('riskAbsent')}</Badge>}
            </span>,
          ])} />
      ))}

      {tab === 'classes' && (!classRows.length ? <EmptyState text={t('noData')} /> : (
        <Table head={[t('class'), t('students'), t('classAvgCol'), t('riskCount'), t('attendancePct')]}
          rows={classRows.map(x => [x.c.name, x.n, fmt(x.avg), x.risk, x.pct === null ? '—' : `${x.pct}%`])} />
      ))}

      {tab === 'subjects' && (
        <Table head={[t('subject'), t('gradesCount'), t('averageCol')]}
          rows={subjectRows.map(x => [x.s.name, x.n, fmt(x.avg)])} />
      )}

      {tab === 'attendance' && (!attRows.length ? <EmptyState text={t('noData')} /> : (
        <Card className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attRows.map(x => ({ ...x, date: x.date.slice(5) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#a8a29e33" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="absent" name={t('absentCol')} fill="#F43F5E" radius={[6, 6, 0, 0]} />
              <Bar dataKey="late" name={t('lateCol')} fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ))}
    </div>
  );
}
