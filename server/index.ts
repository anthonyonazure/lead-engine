import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { leadsRouter } from './routes/leads.js';
import { aiRouter } from './routes/ai.js';
import { webhooksRouter } from './routes/webhooks.js';
import { outreachRouter } from './routes/outreach.js';
import { requireApiKey } from './middleware/auth.js';
import { aiLimiter, sendLimiter, webhookLimiter } from './middleware/rate-limit.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());

const allowedOrigins = (process.env.LEAD_ENGINE_WEB_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`origin ${origin} not allowed`));
    },
  })
);

app.use(express.json({ limit: '16kb' }));

app.use(requireApiKey);

app.use('/api/webhooks', webhookLimiter, webhooksRouter);
app.use('/api/ai', aiLimiter, aiRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/outreach', sendLimiter, outreachRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err);
  const message = process.env.NODE_ENV === 'production' ? 'internal error' : err.message;
  res.status(500).json({ error: message });
});

const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('server/index.ts');
if (isMain) {
  const port = Number(process.env.LEAD_ENGINE_PORT ?? 3001);
  app.listen(port, () => {
    console.log(`[lead-engine] api listening on http://localhost:${port}`);
  });
}
