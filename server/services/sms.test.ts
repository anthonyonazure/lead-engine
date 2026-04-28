import { describe, it, expect, beforeEach } from 'vitest';
import { sendSms } from './sms.js';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_FROM_NUMBER;
});

describe('sendSms', () => {
  it('returns simulated when Twilio is not configured', async () => {
    const result = await sendSms('+15551234567', 'Test message');
    expect(result.status).toBe('simulated');
    expect(result.providerId).toBeUndefined();
  });

  it('returns simulated when account sid is set but from number is missing', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC_test';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    const result = await sendSms('+15551234567', 'Test');
    expect(result.status).toBe('simulated');
  });
});
