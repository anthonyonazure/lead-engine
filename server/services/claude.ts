import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn('[claude] ANTHROPIC_API_KEY not set — AI endpoints will fail');
}

export const anthropic = new Anthropic({ apiKey: apiKey ?? 'missing' });

const PRICING_PER_MTOK: Record<string, { input: number; output: number; cacheRead: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15, cacheRead: 0.3 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4, cacheRead: 0.08 },
};

export interface CallMetrics {
  leadId?: string;
  operation: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  latencyMs: number;
}

export function logCall(m: CallMetrics) {
  const pricing = PRICING_PER_MTOK[m.model] ?? { input: 0, output: 0, cacheRead: 0 };
  const cost =
    (m.inputTokens / 1_000_000) * pricing.input +
    (m.outputTokens / 1_000_000) * pricing.output +
    (m.cacheReadTokens / 1_000_000) * pricing.cacheRead;

  db.prepare(
    `INSERT INTO ai_calls (lead_id, operation, model, input_tokens, output_tokens, cache_read_tokens, latency_ms, cost_usd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    m.leadId ?? null,
    m.operation,
    m.model,
    m.inputTokens,
    m.outputTokens,
    m.cacheReadTokens,
    m.latencyMs,
    cost
  );
}
