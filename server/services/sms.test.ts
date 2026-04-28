import { describe, it, expect, beforeEach } from 'vitest';
import { sendSms } from './sms.js';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_FROM_NUMBER;
  process.env.TWILIO_ALLOWED_COUNTRIES = '+1';
});

describe('sendSms', () => {
  it('returns simulated when Twilio is not configured (allowed destination)', async () => {
    const result = await sendSms('+15551234567', 'Test message');
    expect(result.status).toBe('simulated');
  });

  it('blocks destinations outside TWILIO_ALLOWED_COUNTRIES even in simulation', async () => {
    const result = await sendSms('+447911123456', 'Test'); // UK number
    expect(result.status).toBe('blocked');
  });

  it('blocks malformed phone numbers', async () => {
    const result = await sendSms('not-a-phone', 'Test');
    expect(result.status).toBe('blocked');
  });

  it('respects multi-country allowlist', async () => {
    process.env.TWILIO_ALLOWED_COUNTRIES = '+1,+44';
    const us = await sendSms('+15551234567', 'Test');
    const uk = await sendSms('+447911123456', 'Test');
    expect(us.status).toBe('simulated');
    expect(uk.status).toBe('simulated');
  });

  it('returns simulated when account sid is set but from number is missing', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC_test';
    process.env.TWILIO_AUTH_TOKEN = 'token';
    const result = await sendSms('+15551234567', 'Test');
    expect(result.status).toBe('simulated');
  });
});
