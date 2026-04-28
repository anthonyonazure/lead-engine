import { Router, urlencoded } from 'express';
import { db } from '../db.js';
import { randomUUID } from 'node:crypto';
import { sendSms } from '../services/sms.js';
import { requireTwilioSignature } from '../middleware/twilio-signature.js';
import {
  sanitizeText,
  MAX_NOTES_BYTES,
  MAX_NAME_BYTES,
  MAX_GENERIC_BYTES,
} from '../lib/sanitize-input.js';

export const webhooksRouter = Router();

const PHONE_RE = /^\+\d{8,15}$/;

webhooksRouter.post('/website-form', (req, res) => {
  const body = req.body ?? {};
  const name = sanitizeText(body.name, MAX_NAME_BYTES);
  if (!name) {
    res.status(400).json({ error: 'name required' });
    return;
  }
  const id = randomUUID();
  db.prepare(
    `INSERT INTO leads (id, name, email, phone, source, job_type, location, notes)
     VALUES (?, ?, ?, ?, 'website-form', ?, ?, ?)`
  ).run(
    id,
    name,
    sanitizeText(body.email, MAX_GENERIC_BYTES),
    sanitizeText(body.phone, MAX_GENERIC_BYTES),
    sanitizeText(body.jobType, MAX_GENERIC_BYTES),
    sanitizeText(body.location, MAX_GENERIC_BYTES),
    sanitizeText(body.notes, MAX_NOTES_BYTES)
  );
  res.status(201).json({ id, status: 'received' });
});

webhooksRouter.post(
  '/missed-call',
  urlencoded({ extended: false, limit: '4kb' }),
  requireTwilioSignature,
  async (req, res, next) => {
    try {
      const fromNumber = sanitizeText(req.body?.fromNumber ?? req.body?.From, 32);
      if (!fromNumber || !PHONE_RE.test(fromNumber)) {
        res.status(400).json({ error: 'fromNumber required (E.164 format)' });
        return;
      }

      const allowed = (process.env.TWILIO_ALLOWED_COUNTRIES ?? '+1')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      if (!allowed.some((p) => fromNumber.startsWith(p))) {
        res.status(403).json({ error: 'caller country not allowlisted' });
        return;
      }

      const callDuration = sanitizeText(req.body?.callDuration ?? req.body?.CallDuration, 16);

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
  }
);
