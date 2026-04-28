import { ServerClient } from 'postmark';

let client: ServerClient | null = null;

function getClient() {
  if (client) return client;
  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) return null;
  client = new ServerClient(token);
  return client;
}

export interface SendEmailResult {
  status: 'sent' | 'simulated' | 'error';
  providerId?: string;
  error?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const from = process.env.POSTMARK_FROM_ADDRESS;
  const c = getClient();

  if (!c || !from) {
    console.log(`[email:simulated] to=${input.to} subject="${input.subject}"`);
    return { status: 'simulated' };
  }

  try {
    const result = await c.sendEmail({
      From: from,
      To: input.to,
      Subject: input.subject,
      TextBody: input.body,
      ReplyTo: input.replyTo ?? process.env.POSTMARK_REPLY_TO,
      MessageStream: 'outbound',
    });
    return { status: 'sent', providerId: result.MessageID };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[email:error]', message);
    return { status: 'error', error: message };
  }
}
