import { describe, it, expect, beforeEach } from 'vitest';
import { sendEmail } from './email.js';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.POSTMARK_SERVER_TOKEN;
  delete process.env.POSTMARK_FROM_ADDRESS;
});

describe('sendEmail', () => {
  it('returns simulated when Postmark is not configured', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Body',
    });
    expect(result.status).toBe('simulated');
  });

  it('returns simulated when token set but from address missing', async () => {
    process.env.POSTMARK_SERVER_TOKEN = 'token';
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Body',
    });
    expect(result.status).toBe('simulated');
  });
});
