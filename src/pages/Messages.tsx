import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Megaphone, MessageSquarePlus, Paperclip, Reply, Send, X } from 'lucide-react';
import { useStore, useCurrentUser, type User } from '../store';
import { useScheduleStore } from '../scheduleStore';
import { useMessages, type Thread } from '../messagesStore';
import { useT } from '../i18n';
import { Button, Card, EmptyState } from '../components/ui';

const inp = 'rounded-lg border border-stone-300 bg-transparent px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900';
type Aud = 'all' | 'role' | 'class';

export default function Messages() {
  const t = useT();
  const db = useStore();
  const user = useCurrentUser()!;
  const { lessons } = useScheduleStore();
  const { threads, send, createThread, markRead } = useMessages();
  const mine = threads.filter(th => th.memberIds.includes(user.id));
  const [activeId, setActiveId] = useState<string | null>(mine[0]?.id ?? null);
  const active: Thread | null = mine.find(th => th.id === activeId) ?? null;
  const [panel, setPanel] = useState<null | 'new' | 'broadcast'>(null);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [aud, setAud] = useState<Aud>('all');
  const [audVal, setAudVal] = useState('');
  const [bcast, setBcast] = useState('');

  useEffect(() => { if (activeId) markRead(activeId, user.id); }, [activeId, active?.messages.length]);

  const nameOf = (id: string) => db.users.find(u => u.id === id)?.name ?? '';
  const classOf = (id: string) => db.users.find(u => u.id === id)?.classId;
  const titleOf = (th: Thread) => th.kind === 'direct' ? nameOf(th.memberIds.find(id => id !== user.id) ?? '') : th.title;
  const unread = (th: Thread) => th.messages.filter(m => m.authorId !== user.id && !m.readBy.includes(user.id)).length;

  // Кому можно писать: админ — всем; учитель — ученикам и родителям своих классов, коллегам и админу;
  // ученик/родитель — только учителям своего класса и админу.
  const myTeachClasses = lessons.filter(l => l.teacherId === user.id).map(l => l.classId);
  const myClasses = user.role === 'student' ? [user.classId ?? ''] : user.role === 'parent' ? (user.childIds ?? []).map(id => classOf(id) ?? '') : [];
  const contacts: User[] = db.users.filter(u => {
    if (u.id === user.id) return false;
    if (user.role === 'admin' || u.role === 'admin') return true;
    if (user.role === 'teacher') {
      if (u.role === 'teacher') return true;
      if (u.role === 'student') return myTeachClasses.includes(u.classId ?? '');
      return (u.childIds ?? []).some(c => myTeachClasses.includes(classOf(c) ?? ''));
    }
    if (u.role === 'teacher') return lessons.some(l => l.teacherId === u.id && myClasses.includes(l.classId));
    return false;
  });

  const openDirect = (otherId: string) => {
    const existing = threads.find(th => th.kind === 'direct' && th.memberIds.includes(user.id) && th.memberIds.includes(otherId));
    setActiveId(existing ? existing.id : createThread('direct', '', [user.id, otherId]));
    setPanel(null);
  };

  const recipientsFor = (): string[] => db.users.filter(u => {
    if (u.id === user.id) return false;
    if (aud === 'all') return true;
    if (aud === 'role') return u.role === audVal;
    return u.classId === audVal || (u.childIds ?? []).some(c => classOf(c) === audVal);
  }).map(u => u.id);

  const sendBroadcast = () => {
    const ids = recipientsFor();
    if (!bcast.trim() || !ids.length) return;
    const label = aud === 'all' ? t('audAll') : aud === 'role' ? t(audVal) : db.classes.find(c => c.id === audVal)?.name ?? '';
    const id = createThread('broadcast', `${t('broadcastTitle')} · ${label}`, [user.id, ...ids]);
    send(id, user.id, bcast.trim());
    setBcast('');
    setPanel(null);
    setActiveId(id);
  };

  const submit = () => {
    if (!active || (!text.trim() && !file)) return;
    send(active.id, user.id, text.trim(), { replyTo: replyTo ?? undefined, file: file ?? undefined });
    setText(''); setReplyTo(null); setFile(null);
  };

  const sorted = [...mine].sort((a, b) => (b.messages.at(-1)?.at ?? '').localeCompare(a.messages.at(-1)?.at ?? ''));

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="flex flex-col gap-3 p-3">
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setPanel(panel === 'new' ? null : 'new')}>
            <MessageSquarePlus size={16} className="mr-1 inline" />{t('newChat')}
          </Button>
          {user.role === 'admin' && (
            <Button className="flex-1" onClick={() => setPanel(panel === 'broadcast' ? null : 'broadcast')}>
              <Megaphone size={16} className="mr-1 inline" />{t('broadcast')}
            </Button>
          )}
        </div>
        <div className="max-h-[60vh] space-y-1 overflow-y-auto">
          {!sorted.length ? <EmptyState text={t('noThreads')} /> : sorted.map(th => {
            const n = unread(th);
            const last = th.messages.at(-1);
            const on = th.id === activeId;
            return (
              <button key={th.id} onClick={() => { setActiveId(th.id); setPanel(null); }}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${on ? 'bg-indigo-600 text-white' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{titleOf(th)}</span>
                  <span className={`block truncate text-xs ${on ? 'text-white/80' : 'text-stone-500'}`}>{last ? (last.text || last.file) : ''}</span>
                </span>
                {n > 0 && <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">{n}</span>}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        {panel === 'new' && (
          <Card>
            <h3 className="mb-3 font-semibold">{t('pickRecipient')}</h3>
            {!contacts.length ? <EmptyState text={t('noContacts')} /> : (
              <div className="grid gap-2 sm:grid-cols-2">
                {contacts.map(c => (
                  <button key={c.id} onClick={() => openDirect(c.id)}
                    className="rounded-xl border border-stone-200 p-3 text-left hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-stone-500">{t(c.role)}</div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {panel === 'broadcast' && user.role === 'admin' && (
          <Card className="space-y-3">
            <h3 className="font-semibold">{t('broadcast')}</h3>
            <div className="flex flex-wrap gap-2">
              <select aria-label={t('audience')} className={inp} value={aud}
                onChange={e => { const v = e.target.value as Aud; setAud(v); setAudVal(v === 'role' ? 'student' : v === 'class' ? db.classes[0].id : ''); }}>
                <option value="all">{t('audAll')}</option>
                <option value="role">{t('audRole')}</option>
                <option value="class">{t('audClass')}</option>
              </select>
              {aud === 'role' && (
                <select aria-label={t('audRole')} className={inp} value={audVal} onChange={e => setAudVal(e.target.value)}>
                  {['teacher', 'student', 'parent'].map(r => <option key={r} value={r}>{t(r)}</option>)}
                </select>
              )}
              {aud === 'class' && (
                <select aria-label={t('audClass')} className={inp} value={audVal} onChange={e => setAudVal(e.target.value)}>
                  {db.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
            <textarea rows={3} value={bcast} onChange={e => setBcast(e.target.value)} placeholder={t('typeMessage')} className={`w-full ${inp}`} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">{recipientsFor().length} {t('recipients')}</span>
              <Button onClick={sendBroadcast}>{t('send')}</Button>
            </div>
          </Card>
        )}

        {active ? (
          <Card className="flex flex-1 flex-col p-0">
            <div className="border-b border-stone-200 px-4 py-3 font-semibold dark:border-stone-800">{titleOf(active)}</div>
            <div className="max-h-[55vh] flex-1 space-y-3 overflow-y-auto p-4">
              {!active.messages.length && <EmptyState text={t('noData')} />}
              {active.messages.map(m => {
                const own = m.authorId === user.id;
                const q = m.replyTo ? active.messages.find(x => x.id === m.replyTo) : undefined;
                const readAll = active.memberIds.filter(id => id !== m.authorId).every(id => m.readBy.includes(id));
                return (
                  <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${own ? 'bg-indigo-600 text-white' : 'bg-stone-100 dark:bg-stone-800'}`}>
                      {!own && active.kind !== 'direct' && <div className="mb-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300">{nameOf(m.authorId)}</div>}
                      {q && <div className={`mb-1 border-l-2 px-2 py-1 text-xs ${own ? 'border-white/60 bg-white/15' : 'border-indigo-500 bg-white/60 dark:bg-stone-900/60'}`}>{q.text || q.file}</div>}
                      {m.text && <div className="whitespace-pre-wrap">{m.text}</div>}
                      {m.file && <div className="mt-1 inline-flex items-center gap-1 text-xs underline"><Paperclip size={12} />{m.file}</div>}
                      <div className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${own ? 'text-white/70' : 'text-stone-500'}`}>
                        {format(new Date(m.at), 'dd.MM HH:mm')}
                        {own && (readAll ? <CheckCheck size={13} aria-label={t('readAll')} /> : <Check size={13} />)}
                        <button aria-label={t('replyTo')} onClick={() => setReplyTo(m.id)} className="ml-1 opacity-70 hover:opacity-100"><Reply size={13} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {replyTo && (
              <div className="flex items-center justify-between border-t border-stone-200 px-4 py-2 text-xs dark:border-stone-800">
                <span className="truncate">{t('replyTo')}: {active.messages.find(m => m.id === replyTo)?.text}</span>
                <button aria-label={t('cancel')} onClick={() => setReplyTo(null)}><X size={14} /></button>
              </div>
            )}
            {file && (
              <div className="flex items-center justify-between border-t border-stone-200 px-4 py-2 text-xs dark:border-stone-800">
                <span className="inline-flex items-center gap-1"><Paperclip size={12} />{file}</span>
                <button aria-label={t('cancel')} onClick={() => setFile(null)}><X size={14} /></button>
              </div>
            )}
            <div className="flex items-end gap-2 border-t border-stone-200 p-3 dark:border-stone-800">
              <label aria-label={t('attach')} className="cursor-pointer rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-stone-800">
                <Paperclip size={18} />
                <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0]?.name ?? null)} />
              </label>
              <textarea rows={1} value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                placeholder={t('typeMessage')}
                className="min-h-10 flex-1 resize-none rounded-xl border border-stone-300 bg-transparent px-3 py-2 text-sm dark:border-stone-700" />
              <Button onClick={submit} aria-label={t('send')}><Send size={16} /></Button>
            </div>
          </Card>
        ) : !panel && <EmptyState text={t('selectThread')} />}
      </div>
    </div>
  );
}
