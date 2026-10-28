import { useState } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Pin, Trash2 } from 'lucide-react';
import { useStore, useCurrentUser, type Role } from '../store';
import { useScheduleStore } from '../scheduleStore';
import { useNewsStore, canSee, userClassIds, type Target, type Post } from '../newsStore';
import { toast } from '../components/toast';
import { useT } from '../i18n';
import { Badge, Button, Card, EmptyState } from '../components/ui';

const COVERS = ['📢', '🍂', '📐', '🎉', '🏆', '📚'];
type Tgt = 'all' | 'role' | 'class';
const inp = 'rounded-lg border border-stone-300 bg-transparent px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900';

export default function News() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const lessons = useScheduleStore(s => s.lessons);
  const { posts, addPost, togglePin, toggleLike, addComment, removePost } = useNewsStore();
  const canPost = user.role === 'admin' || user.role === 'teacher';
  const classOptions = user.role === 'admin' ? db.classes : db.classes.filter(c => userClassIds(user, db, lessons).includes(c.id));

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cover, setCover] = useState(COVERS[0]);
  const [tgt, setTgt] = useState<Tgt>(user.role === 'admin' ? 'all' : 'class');
  const [tgtVal, setTgtVal] = useState(user.role === 'admin' ? '' : classOptions[0]?.id ?? '');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const nameOf = (id: string) => db.users.find(u => u.id === id)?.name ?? '';
  const label = (tg: Target) => tg.kind === 'all' ? t('audAll') : tg.kind === 'role' ? t(tg.role) : db.classes.find(c => c.id === tg.classId)?.name ?? '';

  const publish = () => {
    if (!title.trim() || !body.trim()) return toast(t('required'), 'error');
    if (tgt !== 'all' && !tgtVal) return toast(t('required'), 'error');
    const target: Target = tgt === 'all' ? { kind: 'all' } : tgt === 'role' ? { kind: 'role', role: tgtVal as Role } : { kind: 'class', classId: tgtVal };
    addPost({ title: title.trim(), body: body.trim(), cover, authorId: user.id, target });
    setTitle(''); setBody('');
    toast(t('published'));
  };

  const sendComment = (id: string) => {
    const txt = (drafts[id] ?? '').trim();
    if (!txt) return;
    addComment(id, user.id, txt);
    setDrafts({ ...drafts, [id]: '' });
  };

  const feed = posts
    .filter((p: Post) => canSee(p, user, db, lessons))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('news')}</h1>

      {canPost && (
        <Card className="space-y-3">
          <h2 className="font-display text-lg font-semibold">{t('create')}</h2>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('title')} className={`w-full ${inp}`} />
          <textarea rows={3} value={body} onChange={e => setBody(e.target.value)} placeholder={t('description')} className={`w-full ${inp}`} />
          <div className="flex flex-wrap gap-2">
            {COVERS.map(c => (
              <button key={c} type="button" aria-label={`${t('coverLabel')} ${c}`} onClick={() => setCover(c)}
                className={`h-10 w-10 rounded-xl text-xl ${cover === c ? 'bg-indigo-600' : 'bg-stone-100 dark:bg-stone-800'}`}>{c}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {user.role === 'admin' && (
              <select aria-label={t('audience')} className={inp} value={tgt}
                onChange={e => { const v = e.target.value as Tgt; setTgt(v); setTgtVal(v === 'role' ? 'student' : v === 'class' ? classOptions[0]?.id ?? '' : ''); }}>
                <option value="all">{t('audAll')}</option>
                <option value="role">{t('audRole')}</option>
                <option value="class">{t('audClass')}</option>
              </select>
            )}
            {tgt === 'role' && (
              <select aria-label={t('audRole')} className={inp} value={tgtVal} onChange={e => setTgtVal(e.target.value)}>
                {['teacher', 'student', 'parent'].map(r => <option key={r} value={r}>{t(r)}</option>)}
              </select>
            )}
            {tgt === 'class' && (
              <select aria-label={t('audClass')} className={inp} value={tgtVal} onChange={e => setTgtVal(e.target.value)}>
                {classOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <Button className="ml-auto" onClick={publish}>{t('publish')}</Button>
          </div>
        </Card>
      )}

      {!feed.length ? <EmptyState text={t('noNews')} /> : feed.map(p => {
        const liked = p.likes.includes(user.id);
        const canEdit = user.role === 'admin' || p.authorId === user.id;
        return (
          <Card key={p.id} className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-3xl dark:bg-indigo-950/60">{p.cover}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {p.pinned && <Badge tone="amber">📌 {t('pinned')}</Badge>}
                  <Badge tone="indigo">{label(p.target)}</Badge>
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold">{p.title}</h3>
                <p className="text-xs text-stone-500">{nameOf(p.authorId)} · {format(new Date(p.at), 'dd.MM.yyyy HH:mm')}</p>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm">{p.body}</p>
            <div className="flex flex-wrap items-center gap-2 border-t border-stone-200 pt-3 text-sm dark:border-stone-800">
              <button onClick={() => toggleLike(p.id, user.id)} aria-pressed={liked}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 ${liked ? 'text-rose-600' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />{p.likes.length}
              </button>
              <span className="inline-flex items-center gap-1 text-stone-500"><MessageCircle size={16} />{p.comments.length}</span>
              {user.role === 'admin' && (
                <button onClick={() => togglePin(p.id)} className="ml-auto inline-flex items-center gap-1 text-stone-500 hover:text-indigo-600">
                  <Pin size={16} />{p.pinned ? t('unpin') : t('pin')}
                </button>
              )}
              {canEdit && (
                <button aria-label={t('deleteLesson')} onClick={() => { removePost(p.id); toast(t('deleted')); }} className="text-stone-500 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {p.comments.map(c => (
                <div key={c.id} className="rounded-lg bg-stone-100 px-3 py-2 text-sm dark:bg-stone-800">
                  <span className="font-medium">{nameOf(c.authorId)}: </span>{c.text}
                </div>
              ))}
              <div className="flex gap-2">
                <input value={drafts[p.id] ?? ''} onChange={e => setDrafts({ ...drafts, [p.id]: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') sendComment(p.id); }}
                  placeholder={t('writeComment')} className={`flex-1 ${inp}`} />
                <Button variant="ghost" onClick={() => sendComment(p.id)}>{t('send')}</Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Блок новостей на главной странице
export function LatestNews() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const lessons = useScheduleStore(s => s.lessons);
  const posts = useNewsStore(s => s.posts);
  const items = posts
    .filter(p => canSee(p, user, db, lessons))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.at.localeCompare(a.at))
    .slice(0, 3);
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{t('latestNews')}</h2>
        <Link to="/news" className="text-sm text-indigo-600 hover:underline">{t('filterAll')}</Link>
      </div>
      {!items.length ? <EmptyState text={t('noNews')} /> : (
        <ul className="space-y-3">
          {items.map(p => (
            <li key={p.id} className="flex items-center gap-3">
              <span className="text-2xl">{p.cover}</span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{p.title}</span>
                <span className="text-xs text-stone-500">{format(new Date(p.at), 'dd.MM.yyyy')}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
