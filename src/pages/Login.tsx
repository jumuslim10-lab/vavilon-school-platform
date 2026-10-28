import { ShieldCheck, Presentation, GraduationCap, Users, CalendarDays, BookOpen, ClipboardList, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useStore, type Role } from '../store';
import { useT, LANGS, type Lang } from '../i18n';
import { signIn } from '../lib/supabase/auth';

const ROLE_META: Record<Role, { icon: typeof ShieldCheck; color: string; hint: string }> = {
  admin: { icon: ShieldCheck, color: 'from-indigo-500 to-violet-500', hint: 'roleAdminHint' },
  teacher: { icon: Presentation, color: 'from-emerald-500 to-teal-500', hint: 'roleTeacherHint' },
  student: { icon: GraduationCap, color: 'from-amber-400 to-orange-500', hint: 'roleStudentHint' },
  parent: { icon: Users, color: 'from-sky-500 to-indigo-400', hint: 'roleParentHint' },
};
const ORDER: Role[] = ['admin', 'teacher', 'student', 'parent'];
const CHIPS = [
  { icon: CalendarDays, key: 'chipSchedule' },
  { icon: BookOpen, key: 'chipJournal' },
  { icon: ClipboardList, key: 'chipHomework' },
  { icon: MessageSquare, key: 'chipMessages' },
];

export default function Login() {
  const t = useT();
  const { users, login, lang, setLang } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Demo credentials mapping
  const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
    admin: { email: 'admin@vavilon.kg', password: 'Demo123!' },
    teacher: { email: 'teacher@vavilon.kg', password: 'Demo123!' },
    student: { email: 'student@vavilon.kg', password: 'Demo123!' },
    parent: { email: 'parent@vavilon.kg', password: 'Demo123!' },
  };

  async function handleSupabaseLogin(role: Role) {
    setLoading(true);
    setError('');
    try {
      const creds = DEMO_CREDENTIALS[role];
      await signIn(creds.email, creds.password);
      // Supabase auth will trigger redirect automatically
    } catch (err) {
      console.error('Supabase login failed, falling back to demo mode:', err);
      // Fallback to original Zustand demo login
      const user = users.find(u => u.role === role);
      if (user) login(user.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-50 via-indigo-50/40 to-emerald-50/40 dark:from-stone-950 dark:via-indigo-950/30 dark:to-stone-950">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-emerald-400/25 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 p-6 md:grid-cols-2 md:p-10">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-display text-3xl font-bold tracking-tight text-indigo-600">vavilon</span>
            <select aria-label={t('lang')} value={lang} onChange={e => setLang(e.target.value as Lang)}
              className="rounded-lg border border-stone-300 bg-white/70 px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-900/70">
              {LANGS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">{t('heroTitle')}</h1>
          <p className="text-lg text-stone-600 dark:text-stone-400">{t('heroText')}</p>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map(c => (
              <span key={c.key} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-sm shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/70">
                <c.icon size={16} className="text-indigo-600" />{t(c.key)}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-stone-800 dark:bg-stone-900/70">
          <h2 className="mb-4 font-display text-lg font-semibold">{t('demoLogin')}</h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}
          <div className="grid gap-3">
            {ORDER.flatMap(role => users.filter(u => u.role === role)).map(u => {
              const meta = ROLE_META[u.role];
              return (
                <button key={u.id} onClick={() => handleSupabaseLogin(u.role)}
                  disabled={loading}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:border-stone-700 dark:bg-stone-900">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow ${meta.color}`}>
                    <meta.icon size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{u.name}</span>
                    <span className="block text-xs text-stone-500">{t(u.role)} · {t(meta.hint)}</span>
                  </span>
                  <span aria-hidden className="text-stone-400 transition group-hover:translate-x-1">
                    {loading ? '...' : '→'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-center text-stone-500">
            Powered by Supabase · Demo Mode Available
          </p>
        </section>
      </div>
    </div>
  );
}
