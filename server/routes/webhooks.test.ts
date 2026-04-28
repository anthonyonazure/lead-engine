import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { db } from '../db.js';

beforeEach(() => {
  db.prepare('DELETE FROM outreach').run();
  db.prepare('DELETE FROM leads').run();
});

describe('POST /api/webhooks/website-form', () => {
  it('creates a lead from form submission', async () => {
    const res = await request(app).post('/api/webhooks/website-form').send({
      name: 'Form User',
      email: 'f@example.com',
      jobType: 'kitchen remodel',
      notes: 'Interested in pricing',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();

    const leads = db.prepare('SELECT * FROM leads WHERE id = ?').all(res.body.id);
    expect(leads).toHaveLength(1);
  });

  it('rejects without name', async () => {
    const res = await request(app)
      .post('/api/webhooks/website-form')
      .send({ email: 'x@example.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/webhooks/missed-call', () => {
  it('creates a lead and queues text-back', async () => {
    const res = await request(app)
      .post('/api/webhooks/missed-call')
      .send({ fromNumber: '+15551234567', callDuration: 22 });
    expect(res.status).toBe(201);
    expect(res.body.textBack).toBe('simulated');

    const outreach = db
      .prepare('SELECT * FROM outreach WHERE lead_id = ?')
      .all(res.body.id) as Array<{ channel: string; status: string }>;
    expect(outreach).toHaveLength(1);
    expect(outreach[0].channel).toBe('sms');
    expect(outreach[0].status).toBe('simulated');
  });

  it('rejects without fromNumber', async () => {
    const res = await request(app)
      .post('/api/webhooks/missed-call')
      .send({ callDuration: 30 });
    expect(res.status).toBe(400);
  });
});
