import { Lead } from '../lib/api';

const STAGES: { key: Lead['stage']; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: 'bg-slate-100 border-slate-300' },
  { key: 'qualified', label: 'Qualified', color: 'bg-blue-50 border-blue-300' },
  { key: 'engaged', label: 'Engaged', color: 'bg-amber-50 border-amber-300' },
  { key: 'won', label: 'Won', color: 'bg-emerald-50 border-emerald-300' },
  { key: 'lost', label: 'Lost', color: 'bg-rose-50 border-rose-300' },
];

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
  selectedId: string | null;
}

export function PipelineBoard({ leads, onSelect, selectedId }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {STAGES.map((stage) => {
        const inStage = leads.filter((l) => l.stage === stage.key);
        return (
          <div key={stage.key} className={`rounded-lg border p-3 ${stage.color}`}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{stage.label}</h3>
              <span className="text-xs text-slate-500">{inStage.length}</span>
            </div>
            <div className="space-y-2">
              {inStage.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => onSelect(lead)}
                  className={`w-full rounded border bg-white p-2 text-left text-sm shadow-sm transition hover:shadow ${
                    selectedId === lead.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-slate-800">{lead.name}</div>
                  <div className="text-xs text-slate-500">{lead.jobType ?? '—'}</div>
                  {lead.score !== null && (
                    <div className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                      score: {lead.score}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
