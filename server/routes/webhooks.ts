import { Router } from 'express';
import { db } from '../db.js';
import { randomUUID } from 'node:crypto';

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

webhooksRouter.post('/missed-call', (req, res) => {
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
  console.log(`[missed-call] would send text-back to ${fromNumber} — TODO: wire Twilio`);
  res.status(201).json({ id, status: 'received', textBackQueued: true });
});
