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

export interface SendSmsResult {
  status: 'sent' | 'simulated' | 'error';
  providerId?: string;
  error?: string;
}

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
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
