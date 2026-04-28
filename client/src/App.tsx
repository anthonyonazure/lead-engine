import { useEffect, useState } from 'react';
import { Lead, listLeads } from './lib/api';
import { PipelineBoard } from './components/PipelineBoard';
import { LeadDetail } from './components/LeadDetail';

export function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listLeads()
      .then((data) => {
        setLeads(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelected(updated);
  };

  const isDemo = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_LEAD_ENGINE_DEMO_MODE === 'true';

  const handleResetDemo = async () => {
    if (!confirm('Reset all demo data?')) return;
    await fetch('/api/admin/reset', { method: 'POST' });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            lead-engine
            {isDemo && (
              <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Demo Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">
            AI lead pipeline · {isDemo ? 'outbound sends are simulated' : 'demo'}
          </p>
        </div>
        {isDemo && (
          <button
            onClick={handleResetDemo}
            className="rounded border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-50"
          >
            Reset demo data
          </button>
        )}
      </header>
      <main className="space-y-4 p-6">
        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <>
            <PipelineBoard
              leads={leads}
              onSelect={setSelected}
              selectedId={selected?.id ?? null}
            />
            {selected && <LeadDetail lead={selected} onUpdate={handleUpdate} />}
          </>
        )}
      </main>
    </div>
  );
}
