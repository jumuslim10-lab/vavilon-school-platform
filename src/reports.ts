import { WEIGHTS, type DB } from './store';

// Общие расчёты для отчётов и зоны риска
export function avgOf(db: DB, sid: string): number | null {
  const gs = db.grades.filter(g => g.studentId === sid && g.value > 0);
  const w = gs.reduce((a, g) => a + WEIGHTS[g.type], 0);
  return w ? gs.reduce((a, g) => a + g.value * WEIGHTS[g.type], 0) / w : null;
}

export function absencesOf(db: DB, sid: string): number {
  return db.attendance.filter(a => a.studentId === sid && (a.status === 'absent' || a.status === 'absentExcused')).length;
}

// Зона риска: средний балл ниже 3.5 или 3 и более пропусков
export function riskOf(db: DB, sid: string) {
  const a = avgOf(db, sid);
  const low = a !== null && a < 3.5;
  const absent = absencesOf(db, sid) >= 3;
  return { risk: low || absent, low, absent };
}

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}
