import { useEffect, useState } from 'react';
import {
  Lead,
  Outreach,
  draftOutreach,
  listOutreach,
  scoreLead,
  updateStage,
} from '../lib/api';
import { OutreachList } from './OutreachList';

interface Props {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}

export function LeadDetail({ lead, onUpdate }: Props) {
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listOutreach(lead.id).then(setOutreach);
  }, [lead.id]);

  const refreshOutreach = async () => {
    setOutreach(await listOutreach(lead.id));
  };

  const handleScore = async () => {
    setBusy('score');
    setError(null);
    try {
      const updated = await scoreLead(lead.id);
      onUpdate(updated);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleDraft = async (channel: 'sms' | 'email') => {
    setBusy(`draft-${channel}`);
    setError(null);
    try {
      await draftOutreach(lead.id, channel);
      await refreshOutreach();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleStageChange = async (stage: Lead['stage']) => {
    onUpdate(await updateStage(lead.id, stage));
  };

  const handleOutreachUpdate = (updated: Outreach) => {
    setOutreach((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{lead.name}</h2>
          <div className="text-sm text-slate-500">
            {lead.email ?? '—'} · {lead.phone ?? '—'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            source: {lead.source} · {lead.location ?? 'no location'}
          </div>
        </div>
        <select
          value={lead.stage}
          onChange={(e) => handleStageChange(e.target.value as Lead['stage'])}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
        >
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="engaged">Engaged</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {lead.notes && (
        <div className="mb-4 rounded bg-slate-50 p-3 text-sm text-slate-700">{lead.notes}</div>
      )}

      <div className="mb-4">
        <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Score</div>
        {lead.score !== null ? (
          <div>
            <div className="text-2xl font-bold text-slate-800">{lead.score}/100</div>
            <p className="mt-1 text-sm text-slate-600">{lead.scoreRationale}</p>
          </div>
        ) : (
          <button
            onClick={handleScore}
            disabled={busy === 'score'}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy === 'score' ? 'Scoring...' : 'Score with Claude'}
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleDraft('sms')}
          disabled={busy === 'draft-sms' || !lead.phone}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          title={!lead.phone ? 'Lead has no phone number' : ''}
        >
          {busy === 'draft-sms' ? 'Drafting...' : 'Draft SMS'}
        </button>
        <button
          onClick={() => handleDraft('email')}
          disabled={busy === 'draft-email' || !lead.email}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          title={!lead.email ? 'Lead has no email address' : ''}
        >
          {busy === 'draft-email' ? 'Drafting...' : 'Draft Email'}
        </button>
      </div>

      <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Outreach</div>
      <OutreachList outreach={outreach} onSent={handleOutreachUpdate} />

      {error && <div className="mt-3 rounded bg-rose-50 p-2 text-sm text-rose-700">{error}</div>}
    </div>
  );
}
