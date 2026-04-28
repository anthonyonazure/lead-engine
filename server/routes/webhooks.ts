import { Router } from 'express';
import { db } from '../db.js';
import { randomUUID } from 'node:crypto';
import { sendSms } from '../services/sms.js';

export const webhooksRouter = Router();

webhooksRouter.post('/website-form', (req, res) => {
  const { name, email, phone, jobType, location, notes } = req.body ?? {};
  if (!name) {
    res.status(400).json({ error: 'name required' });
    return;
  }
  const id = randomUUID();
  db.prepare(
    `INSERT INTO leads (id, name, email, phone, source, job_type, location, notes)
     VALUES (?, ?, ?, ?, 'website-form', ?, ?, ?)`
  ).run(id, name, email ?? null, phone ?? null, jobType ?? null, location ?? null, notes ?? null);
  res.status(201).json({ id, status: 'received' });
});

webhooksRouter.post('/missed-call', async (req, res, next) => {
  try {
    const { fromNumber, callDuration } = req.body ?? {};
    if (!fromNumber) {
      res.status(400).json({ error: 'fromNumber required' });
      return;
    }

    const id = randomUUID();
    db.prepare(
      `INSERT INTO leads (id, name, phone, source, notes)
       VALUES (?, ?, ?, 'missed-call', ?)`
    ).run(id, `Caller ${fromNumber.slice(-4)}`, fromNumber, `Missed call, duration ${callDuration ?? 'unknown'}s`);

    const businessName = process.env.BUSINESS_NAME ?? 'our business';
    const textBackBody = `Hi — sorry I missed your call to ${businessName}. What can I help you with? Reply here and I'll get back to you shortly.`;
    const smsResult = await sendSms(fromNumber, textBackBody);

    db.prepare(
      `INSERT INTO outreach (lead_id, channel, body, status, provider_id, error, sent_at)
       VALUES (?, 'sms', ?, ?, ?, ?, ?)`
    ).run(
      id,
      textBackBody,
      smsResult.status,
      smsResult.providerId ?? null,
      smsResult.error ?? null,
      smsResult.status === 'sent' || smsResult.status === 'simulated' ? new Date().toISOString() : null
    );

    res.status(201).json({ id, status: 'received', textBack: smsResult.status });
  } catch (err) {
    next(err);
  }
});
