import { Router } from 'express';
import { db, type LeadRow } from '../db.js';
import { sendSms } from '../services/sms.js';
import { sendEmail } from '../services/email.js';

export const outreachRouter = Router();

interface OutreachRow {
  id: number;
  lead_id: string;
  channel: 'sms' | 'email';
  subject: string | null;
  body: string;
  rationale: string | null;
  status: 'draft' | 'sent' | 'simulated' | 'error';
  provider_id: string | null;
  error: string | null;
  sent_at: string | null;
  created_at: string;
}

function rowToOutreach(row: OutreachRow) {
  return {
    id: row.id,
    leadId: row.lead_id,
    channel: row.channel,
    subject: row.subject,
    body: row.body,
    rationale: row.rationale,
    status: row.status,
    providerId: row.provider_id,
    error: row.error,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

outreachRouter.get('/lead/:leadId', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM outreach WHERE lead_id = ? ORDER BY created_at DESC')
    .all(req.params.leadId) as OutreachRow[];
  res.json(rows.map(rowToOutreach));
});

outreachRouter.post('/:id/send', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM outreach WHERE id = ?').get(id) as OutreachRow | undefined;
    if (!row) {
      res.status(404).json({ error: 'outreach not found' });
      return;
    }
    if (row.status === 'sent') {
      res.status(409).json({ error: 'already sent' });
      return;
    }

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(row.lead_id) as LeadRow | undefined;
    if (!lead) {
      res.status(404).json({ error: 'lead not found' });
      return;
    }

    let result;
    if (row.channel === 'sms') {
      if (!lead.phone) {
        res.status(400).json({ error: 'lead has no phone number' });
        return;
      }
      result = await sendSms(lead.phone, row.body);
    } else {
      if (!lead.email) {
        res.status(400).json({ error: 'lead has no email address' });
        return;
      }
      result = await sendEmail({
        to: lead.email,
        subject: row.subject ?? '',
        body: row.body,
      });
    }

    const sentAt = result.status === 'sent' || result.status === 'simulated' ? new Date().toISOString() : null;
    db.prepare(
      'UPDATE outreach SET status = ?, provider_id = ?, error = ?, sent_at = ? WHERE id = ?'
    ).run(result.status, result.providerId ?? null, result.error ?? null, sentAt, id);

    if ((result.status === 'sent' || result.status === 'simulated') && lead.stage === 'qualified') {
      db.prepare('UPDATE leads SET stage = ? WHERE id = ?').run('engaged', lead.id);
    }

    const updated = db.prepare('SELECT * FROM outreach WHERE id = ?').get(id) as OutreachRow;
    res.json(rowToOutreach(updated));
  } catch (err) {
    next(err);
  }
});

outreachRouter.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { subject, body } = req.body ?? {};
  const row = db.prepare('SELECT * FROM outreach WHERE id = ?').get(id) as OutreachRow | undefined;
  if (!row) {
    res.status(404).json({ error: 'outreach not found' });
    return;
  }
  if (row.status === 'sent') {
    res.status(409).json({ error: 'cannot edit sent outreach' });
    return;
  }
  db.prepare('UPDATE outreach SET subject = ?, body = ? WHERE id = ?').run(
    subject ?? row.subject,
    body ?? row.body,
    id
  );
  const updated = db.prepare('SELECT * FROM outreach WHERE id = ?').get(id) as OutreachRow;
  res.json(rowToOutreach(updated));
});
