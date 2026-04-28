import { Router } from 'express';
import { db, rowToLead, type LeadRow } from '../db.js';
import { randomUUID } from 'node:crypto';

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
  const id = randomUUID();
  const { name, email, phone, source, jobType, location, notes } = req.body ?? {};
  if (!name || !source) {
    res.status(400).json({ error: 'name and source required' });
    return;
  }
  db.prepare(
    `INSERT INTO leads (id, name, email, phone, source, job_type, location, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, name, email ?? null, phone ?? null, source, jobType ?? null, location ?? null, notes ?? null);
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
