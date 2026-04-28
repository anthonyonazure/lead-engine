import { useState } from 'react';
import { Outreach, sendOutreach } from '../lib/api';

interface Props {
  outreach: Outreach[];
  onSent: (updated: Outreach) => void;
}

const STATUS_STYLES: Record<Outreach['status'], string> = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-emerald-100 text-emerald-800',
  simulated: 'bg-amber-100 text-amber-800',
  error: 'bg-rose-100 text-rose-800',
};

export function OutreachList({ outreach, onSent }: Props) {
  const [busy, setBusy] = useState<number | null>(null);

  const handleSend = async (id: number) => {
    setBusy(id);
    try {
      onSent(await sendOutreach(id));
    } finally {
      setBusy(null);
    }
  };

  if (outreach.length === 0) {
    return <div className="text-xs text-slate-400">No drafts yet — click "Draft SMS" or "Draft Email" above.</div>;
  }

  return (
    <div className="space-y-2">
      {outreach.map((o) => (
        <div key={o.id} className="rounded border border-slate-200 bg-white p-3">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-slate-500">{o.channel}</span>
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                {o.status}
              </span>
              {o.sentAt && (
                <span className="text-xs text-slate-400">{new Date(o.sentAt).toLocaleString()}</span>
              )}
            </div>
            {o.status === 'draft' && (
              <button
                onClick={() => handleSend(o.id)}
                disabled={busy === o.id}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy === o.id ? 'Sending...' : 'Send'}
              </button>
            )}
          </div>
          {o.subject && <div className="mb-1 text-sm font-medium text-slate-800">{o.subject}</div>}
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{o.body}</pre>
          {o.rationale && <div className="mt-2 text-xs italic text-slate-400">{o.rationale}</div>}
          {o.error && <div className="mt-2 text-xs text-rose-700">{o.error}</div>}
        </div>
      ))}
    </div>
  );
}
