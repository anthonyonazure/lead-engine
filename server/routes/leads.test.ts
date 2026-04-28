import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { db } from '../db.js';

beforeEach(() => {
  db.prepare('DELETE FROM outreach').run();
  db.prepare('DELETE FROM leads').run();
});

describe('GET /api/leads', () => {
  it('returns empty array when no leads', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns inserted lead', async () => {
    db.prepare(
      `INSERT INTO leads (id, name, source) VALUES ('test-1', 'Test User', 'website-form')`
    ).run();
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test User');
    expect(res.body[0].stage).toBe('new');
  });
});

describe('POST /api/leads', () => {
  it('creates a lead', async () => {
    const res = await request(app)
      .post('/api/leads')
      .send({ name: 'New Lead', source: 'manual', email: 'x@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Lead');
    expect(res.body.id).toBeTruthy();
  });

  it('rejects without name', async () => {
    const res = await request(app).post('/api/leads').send({ source: 'manual' });
    expect(res.status).toBe(400);
  });

  it('rejects without source', async () => {
    const res = await request(app).post('/api/leads').send({ name: 'X' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/leads/:id/stage', () => {
  it('updates stage', async () => {
    db.prepare(
      `INSERT INTO leads (id, name, source) VALUES ('s-1', 'X', 'website-form')`
    ).run();
    const res = await request(app)
      .patch('/api/leads/s-1/stage')
      .send({ stage: 'qualified' });
    expect(res.status).toBe(200);
    expect(res.body.stage).toBe('qualified');
  });

  it('rejects invalid stage', async () => {
    db.prepare(
      `INSERT INTO leads (id, name, source) VALUES ('s-2', 'X', 'website-form')`
    ).run();
    const res = await request(app)
      .patch('/api/leads/s-2/stage')
      .send({ stage: 'made-up' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing lead', async () => {
    const res = await request(app)
      .patch('/api/leads/missing/stage')
      .send({ stage: 'qualified' });
    expect(res.status).toBe(404);
  });
});
