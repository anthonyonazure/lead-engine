import twilio from 'twilio';
import type { Request, Response, NextFunction } from 'express';

export function requireTwilioSignature(req: Request, res: Response, next: NextFunction) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    if (process.env.NODE_ENV === 'production') {
      res.status(503).json({ error: 'twilio webhook verification not configured' });
      return;
    }
    return next();
  }

  const signature = req.header('x-twilio-signature');
  if (!signature) {
    res.status(403).json({ error: 'missing twilio signature' });
    return;
  }

  const proto = req.header('x-forwarded-proto') ?? req.protocol;
  const url = `${proto}://${req.get('host')}${req.originalUrl}`;
  const params = (req.body as Record<string, unknown>) ?? {};

  const ok = twilio.validateRequest(authToken, signature, url, params as Record<string, string>);
  if (!ok) {
    res.status(403).json({ error: 'invalid twilio signature' });
    return;
  }

  next();
}
