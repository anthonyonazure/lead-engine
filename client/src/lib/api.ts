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
  id: number;
  channel: 'sms' | 'email';
  subject?: string;
  body: string;
  rationale: string;
}

export interface Outreach {
  id: number;
  leadId: string;
  channel: 'sms' | 'email';
  subject: string | null;
  body: string;
  rationale: string | null;
  status: 'draft' | 'sent' | 'simulated' | 'error';
  providerId: string | null;
  error: string | null;
  sentAt: string | null;
  createdAt: string;
}

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${init?.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

export const listLeads = () => request<Lead[]>('/leads');

export const scoreLead = (id: string) =>
  request<Lead>(`/ai/score/${id}`, { method: 'POST' });

export const draftOutreach = (id: string, channel: 'sms' | 'email') =>
  request<OutreachDraft>(`/ai/draft/${id}?channel=${channel}`, { method: 'POST' });

export const updateStage = (id: string, stage: Lead['stage']) =>
  request<Lead>(`/leads/${id}/stage`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ stage }),
  });

export const listOutreach = (leadId: string) =>
  request<Outreach[]>(`/outreach/lead/${leadId}`);

export const sendOutreach = (id: number) =>
  request<Outreach>(`/outreach/${id}/send`, { method: 'POST' });

export const updateOutreach = (id: number, body: { subject?: string; body?: string }) =>
  request<Outreach>(`/outreach/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
