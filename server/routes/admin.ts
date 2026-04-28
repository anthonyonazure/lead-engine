import { Router } from 'express';
import { isDemoMode } from '../lib/demo.js';
import { resetAndSeed } from '../lib/seed.js';

export const adminRouter = Router();

adminRouter.post('/reset', (req, res) => {
  if (!isDemoMode()) {
    res.status(403).json({ error: 'reset only available in demo mode' });
    return;
  }
  resetAndSeed();
  res.json({ ok: true, message: 'demo data reseeded' });
});
