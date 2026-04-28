import { useState } from 'react';
import { Lead, OutreachDraft, draftOutreach, scoreLead, updateStage } from '../lib/api';

interface Props {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}

export function LeadDetail({ lead, onUpdate }: Props) {
  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setDraft(await draftOutreach(lead.id, channel));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleStageChange = async (stage: Lead['stage']) => {
    const updated = await updateStage(lead.id, stage);
    onUpdate(updated);
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
          disabled={busy === 'draft-sms'}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === 'draft-sms' ? 'Drafting...' : 'Draft SMS'}
        </button>
        <button
          onClick={() => handleDraft('email')}
          disabled={busy === 'draft-email'}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === 'draft-email' ? 'Drafting...' : 'Draft Email'}
        </button>
      </div>

      {draft && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3">
          <div className="mb-1 text-xs font-semibold uppercase text-blue-700">
            Draft {draft.channel}
          </div>
          {draft.subject && (
            <div className="mb-2 text-sm font-medium text-slate-800">Subject: {draft.subject}</div>
          )}
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{draft.body}</pre>
          <div className="mt-2 text-xs text-slate-500">{draft.rationale}</div>
        </div>
      )}

      {error && <div className="mt-3 rounded bg-rose-50 p-2 text-sm text-rose-700">{error}</div>}
    </div>
  );
}
