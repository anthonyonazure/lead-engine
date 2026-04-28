import rateLimit from 'express-rate-limit';

const STANDARD_OPTS = { standardHeaders: true, legacyHeaders: false } as const;

export const aiLimiter = rateLimit({
  ...STANDARD_OPTS,
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: { error: 'rate limit exceeded for AI endpoints' },
});

export const sendLimiter = rateLimit({
  ...STANDARD_OPTS,
  windowMs: 60 * 60 * 1000,
  limit: 60,
  message: { error: 'rate limit exceeded for outreach send' },
});

export const webhookLimiter = rateLimit({
  ...STANDARD_OPTS,
  windowMs: 60 * 1000,
  limit: 30,
  message: { error: 'rate limit exceeded for webhooks' },
});
