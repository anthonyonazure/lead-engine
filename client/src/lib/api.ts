export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  jobType: string | null;
  location: string | null;
  notes: string | null;
  stage: 'new' | 'qualified' | 'engaged' | 'won' | 'lost';
  score: number | null;
  scoreRationale: string | null;
  createdAt: string;
}

export interface OutreachDraft {
  channel: 'sms' | 'email';
  subject?: string;
  body: string;
  rationale: string;
}

const BASE = '/api';

export async function listLeads(): Promise<Lead[]> {
  const res = await fetch(`${BASE}/leads`);
  if (!res.ok) throw new Error(`listLeads failed: ${res.status}`);
  return res.json();
}

export async function scoreLead(id: string): Promise<Lead> {
  const res = await fetch(`${BASE}/ai/score/${id}`, { method: 'POST' });
  if (!res.ok) throw new Error(`scoreLead failed: ${res.status}`);
  return res.json();
}

export async function draftOutreach(id: string, channel: 'sms' | 'email'): Promise<OutreachDraft> {
  const res = await fetch(`${BASE}/ai/draft/${id}?channel=${channel}`, { method: 'POST' });
  if (!res.ok) throw new Error(`draftOutreach failed: ${res.status}`);
  return res.json();
}

export async function updateStage(id: string, stage: Lead['stage']): Promise<Lead> {
  const res = await fetch(`${BASE}/leads/${id}/stage`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error(`updateStage failed: ${res.status}`);
  return res.json();
}
