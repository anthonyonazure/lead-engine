import twilio from 'twilio';

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  client = twilio(sid, token);
  return client;
}

const PHONE_RE = /^\+\d{8,15}$/;

function isAllowedDestination(to: string): boolean {
  if (!PHONE_RE.test(to)) return false;
  const allowed = (process.env.TWILIO_ALLOWED_COUNTRIES ?? '+1')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return allowed.some((p) => to.startsWith(p));
}

export interface SendSmsResult {
  status: 'sent' | 'simulated' | 'error' | 'blocked';
  providerId?: string;
  error?: string;
}

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  if (!isAllowedDestination(to)) {
    console.warn(`[sms:blocked] destination ${to} not in TWILIO_ALLOWED_COUNTRIES`);
    return { status: 'blocked', error: 'destination not in allowed countries' };
  }

  const from = process.env.TWILIO_FROM_NUMBER;
  const c = getClient();

  if (!c || !from) {
    console.log(`[sms:simulated] to=${to} body="${body.slice(0, 60)}..."`);
    return { status: 'simulated' };
  }

  try {
    const msg = await c.messages.create({ to, from, body });
    return { status: 'sent', providerId: msg.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[sms:error]', message);
    return { status: 'error', error: message };
  }
}
