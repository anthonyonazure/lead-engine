import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

const ORIGINAL_KEY = process.env.LEAD_ENGINE_API_KEY;

describe('requireApiKey middleware', () => {
  beforeEach(() => {
    process.env.LEAD_ENGINE_API_KEY = 'test-secret-key';
  });
  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.LEAD_ENGINE_API_KEY;
    else process.env.LEAD_ENGINE_API_KEY = ORIGINAL_KEY;
  });

  it('rejects /api/leads without key', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(401);
  });

  it('accepts /api/leads with correct key', async () => {
    const res = await request(app).get('/api/leads').set('x-api-key', 'test-secret-key');
    expect(res.status).toBe(200);
  });

  it('rejects /api/leads with wrong key', async () => {
    const res = await request(app).get('/api/leads').set('x-api-key', 'wrong');
    expect(res.status).toBe(401);
  });

  it('allows /api/health without key', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('allows /api/webhooks/* without key (they have their own validation)', async () => {
    const res = await request(app)
      .post('/api/webhooks/website-form')
      .send({ name: 'Test' });
    expect(res.status).not.toBe(401);
  });
});
