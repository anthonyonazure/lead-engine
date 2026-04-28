import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { leadsRouter } from './routes/leads.js';
import { aiRouter } from './routes/ai.js';
import { webhooksRouter } from './routes/webhooks.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.use('/api/leads', leadsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/webhooks', webhooksRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ error: err.message });
});

const port = Number(process.env.LEAD_ENGINE_PORT ?? 3001);
app.listen(port, () => {
  console.log(`[lead-engine] api listening on http://localhost:${port}`);
});
