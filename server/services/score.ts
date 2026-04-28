import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { anthropic, logCall } from './claude.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedPrompt: string | null = null;
async function getSystemPrompt(): Promise<string> {
  if (cachedPrompt) return cachedPrompt;
  cachedPrompt = await readFile(resolve(__dirname, '..', 'prompts', 'score-lead.md'), 'utf8');
  return cachedPrompt;
}

const SCORE_TOOL: Anthropic.Tool = {
  name: 'record_score',
  description: 'Record the lead score and rationale.',
  input_schema: {
    type: 'object',
    properties: {
      score: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
        description: 'Total score, sum of the four factors.',
      },
      rationale: {
        type: 'string',
        description: 'One paragraph (50-80 words) covering fit, urgency, reachability, signal quality.',
      },
      recommendStage: {
        type: 'string',
        enum: ['qualified', 'lost'],
        description: 'Optional: recommend a stage transition. Use "lost" only for spam or clearly off-target.',
      },
    },
    required: ['score', 'rationale'],
  },
};

export interface LeadInput {
  name: string;
  jobType: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  notes: string | null;
}

export interface ScoreResult {
  score: number;
  rationale: string;
  recommendStage?: 'qualified' | 'lost';
}

export async function scoreLead(leadId: string, lead: LeadInput): Promise<ScoreResult> {
  const systemPrompt = await getSystemPrompt();
  const model = process.env.LEAD_ENGINE_SCORE_MODEL ?? 'claude-haiku-4-5-20251001';

  const start = Date.now();
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    tools: [SCORE_TOOL],
    tool_choice: { type: 'tool', name: 'record_score' },
    messages: [
      {
        role: 'user',
        content: `Score this lead:
Name: ${lead.name}
Source: ${lead.source}
Job type: ${lead.jobType ?? 'not specified'}
Location: ${lead.location ?? 'not specified'}
Email: ${lead.email ?? 'none'}
Phone: ${lead.phone ?? 'none'}
Notes: ${lead.notes ?? 'none'}`,
      },
    ],
  });

  const latencyMs = Date.now() - start;
  logCall({
    leadId,
    operation: 'score',
    model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
    latencyMs,
  });

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === 'record_score'
  );
  if (!toolUse) throw new Error('No record_score tool use in response');
  return toolUse.input as ScoreResult;
}
