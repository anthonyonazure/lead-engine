import { Router } from 'express';
import { db, rowToLead, type LeadRow } from '../db.js';
import { randomUUID } from 'node:crypto';
import {
  sanitizeText,
  MAX_NOTES_BYTES,
  MAX_NAME_BYTES,
  MAX_GENERIC_BYTES,
} from '../lib/sanitize-input.js';

export const leadsRouter = Router();

leadsRouter.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all() as LeadRow[];
  res.json(rows.map(rowToLead));
});

leadsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id) as LeadRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json(rowToLead(row));
});

leadsRouter.post('/', (req, res) => {
  const body = req.body ?? {};
  const name = sanitizeText(body.name, MAX_NAME_BYTES);
  const source = sanitizeText(body.source, MAX_GENERIC_BYTES);
  if (!name || !source) {
    res.status(400).json({ error: 'name and source required' });
    return;
  }
  const id = randomUUID();
  db.prepare(
    `INSERT INTO leads (id, name, email, phone, source, job_type, location, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    name,
    sanitizeText(body.email, MAX_GENERIC_BYTES),
    sanitizeText(body.phone, MAX_GENERIC_BYTES),
    source,
    sanitizeText(body.jobType, MAX_GENERIC_BYTES),
    sanitizeText(body.location, MAX_GENERIC_BYTES),
    sanitizeText(body.notes, MAX_NOTES_BYTES)
  );
  const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(id) as LeadRow;
  res.status(201).json(rowToLead(row));
});

leadsRouter.patch('/:id/stage', (req, res) => {
  const { stage } = req.body ?? {};
  const allowed = ['new', 'qualified', 'engaged', 'won', 'lost'];
  if (!allowed.includes(stage)) {
    res.status(400).json({ error: 'invalid stage' });
    return;
  }
  db.prepare('UPDATE leads SET stage = ? WHERE id = ?').run(stage, req.params.id);
  const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id) as LeadRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json(rowToLead(row));
});
