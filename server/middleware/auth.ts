import type { Request, Response, NextFunction } from 'express';
import { isDemoMode } from '../lib/demo.js';

const PUBLIC_PATHS = new Set(['/api/health', '/api/admin/reset']);
const PUBLIC_PREFIXES = ['/api/webhooks/'];

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  if (PUBLIC_PATHS.has(req.path)) return next();
  if (PUBLIC_PREFIXES.some((p) => req.path.startsWith(p))) return next();
  if (isDemoMode()) return next();

  const expected = process.env.LEAD_ENGINE_API_KEY;
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      res.status(503).json({ error: 'auth not configured' });
      return;
    }
    return next();
  }

  const presented = req.header('x-api-key') ?? '';
  if (!constantTimeEquals(presented, expected)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
