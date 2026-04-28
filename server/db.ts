import Database from 'better-sqlite3';
import { resolve } from 'node:path';

const dbPath = resolve(process.env.LEAD_ENGINE_DB ?? './data/leads.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT NOT NULL,
    job_type TEXT,
    location TEXT,
    notes TEXT,
    stage TEXT NOT NULL DEFAULT 'new',
    score INTEGER,
    score_rationale TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT,
    operation TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cache_read_tokens INTEGER,
    latency_ms INTEGER,
    cost_usd REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS outreach (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
  );
`);

export interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  job_type: string | null;
  location: string | null;
  notes: string | null;
  stage: string;
  score: number | null;
  score_rationale: string | null;
  created_at: string;
}

export function rowToLead(row: LeadRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    jobType: row.job_type,
    location: row.location,
    notes: row.notes,
    stage: row.stage,
    score: row.score,
    scoreRationale: row.score_rationale,
    createdAt: row.created_at,
  };
}
