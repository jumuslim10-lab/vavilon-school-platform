import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useToasts } from './toast';

export default function Toaster() {
  const items = useToasts(s => s.items);
  const dismiss = useToasts(s => s.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-20 right-4 z-50 flex flex-col gap-2 md:bottom-6">
      {items.map(i => (
        <div key={i.id} role="status"
          className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg ${i.tone === 'ok' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {i.tone === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{i.msg}</span>
          <button aria-label="×" onClick={() => dismiss(i.id)}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
