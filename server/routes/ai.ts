import { Router } from 'express';
import { db, rowToLead, type LeadRow } from '../db.js';
import { scoreLead } from '../services/score.js';
import { draftOutreach } from '../services/outreach.js';

export const aiRouter = Router();

aiRouter.post('/score/:id', async (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id) as LeadRow | undefined;
    if (!row) {
      res.status(404).json({ error: 'lead not found' });
      return;
    }
    const lead = rowToLead(row);
    const result = await scoreLead(lead.id, {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      jobType: lead.jobType,
      location: lead.location,
      notes: lead.notes,
    });

    const newStage = result.recommendStage ?? (lead.stage === 'new' ? 'qualified' : lead.stage);
    db.prepare(
      'UPDATE leads SET score = ?, score_rationale = ?, stage = ? WHERE id = ?'
    ).run(result.score, result.rationale, newStage, lead.id);

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead.id) as LeadRow;
    res.json(rowToLead(updated));
  } catch (err) {
    next(err);
  }
});

aiRouter.post('/draft/:id', async (req, res, next) => {
  try {
    const channel = (req.query.channel === 'email' ? 'email' : 'sms') as 'sms' | 'email';
    const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id) as LeadRow | undefined;
    if (!row) {
      res.status(404).json({ error: 'lead not found' });
      return;
    }
    const lead = rowToLead(row);
    const draft = await draftOutreach(lead.id, {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      jobType: lead.jobType,
      location: lead.location,
      notes: lead.notes,
    }, channel);

    db.prepare(
      'INSERT INTO outreach (lead_id, channel, subject, body) VALUES (?, ?, ?, ?)'
    ).run(lead.id, channel, draft.subject ?? null, draft.body);

    res.json(draft);
  } catch (err) {
    next(err);
  }
});
