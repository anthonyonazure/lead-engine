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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <h1 className="text-lg font-semibold text-slate-800">lead-engine</h1>
        <p className="text-xs text-slate-500">AI lead pipeline · demo</p>
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
