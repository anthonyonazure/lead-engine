# Architecture

## Why this shape

Most "lead automation" gigs land in one of two ditches:

1. **No-code spaghetti.** Six SaaS subscriptions (Zapier + Airtable + HubSpot + Twilio + ConvertKit + a dashboard tool), $400/mo recurring, breaks when one vendor changes their API, the owner can't fix it.
2. **Custom monolith.** One developer builds a giant CRM from scratch, then leaves. The owner is now the proud owner of an unmaintainable system.

This scaffold targets the middle: a single small codebase that does the actual jobs (capture, qualify, draft, track) without ceremony, and is simple enough to hand off.

## Layers

```
┌─────────────────────────────────────┐
│  React dashboard                     │  human review of every AI output
├─────────────────────────────────────┤
│  Express API                         │  REST: leads, AI ops, webhooks
├─────────────────────────────────────┤
│  Service layer (claude.ts, score.ts, │  prompt loading, tool-use schemas,
│  outreach.ts)                        │  cost & latency logging
├─────────────────────────────────────┤
│  SQLite (leads, ai_calls, outreach)  │  one file, WAL mode, FK enforced
└─────────────────────────────────────┘
```

## AI patterns used

### Prompt caching
Every system prompt is loaded once and marked `cache_control: ephemeral`. Subsequent calls within the 5-minute window pay ~10% the input cost on cached tokens. For a small business processing 50 leads/day, this is the difference between $20/mo and $2/mo on Anthropic.

### Structured output via tool use
Both `score-lead` and `draft-outreach` define an Anthropic tool with a strict input schema. The model can only emit valid records — no parsing failures, no "I asked for JSON and got a paragraph." The `tool_choice: { type: 'tool', name: ... }` parameter forces the call.

### Cost & latency logging
Every Anthropic call writes a row to `ai_calls` with token counts, model, latency, and computed cost in USD. This is non-optional in production: you need it to debug regressions, bill clients, and choose models. The `PRICING_PER_MTOK` table in `services/claude.ts` should be updated when pricing changes.

### Model tiering
Scoring runs on Haiku (cheap, fast, deterministic enough for a numeric score). Drafting runs on Sonnet (worth the cost for tone). Both are configurable via env vars — swap in a different provider by changing `services/claude.ts`.

## What's stubbed

- **SMS sending.** Webhooks accept missed-call payloads but the text-back currently logs to console. Wire Twilio in `routes/webhooks.ts` and `services/outreach.ts`.
- **Email sending.** Drafts are stored in the `outreach` table with `sent_at = NULL`. Add a sender (Postmark, Resend, SES) and a "Send" button in the UI.
- **Calendar integration.** No Google Cal / Calendly today. The "propose a time" prompt rule assumes the operator hand-picks; productionize by exposing free/busy.
- **Multi-tenant.** Single business per deployment. For a productized service ("ChiroGrow", "HVACFlow"), add a `tenant_id` column and scope queries.

## Deployment notes

- **Local / single-business.** `pnpm build` produces `dist/server/` and `client/dist/`. Run `node dist/server/index.js` behind nginx. SQLite file lives wherever `LEAD_ENGINE_DB` points.
- **Multiple small businesses.** Containerize, give each tenant their own SQLite + their own Anthropic key. Keep one shared frontend.
- **Higher scale.** Swap SQLite for Postgres (the schema is straightforward — one ALTER per table to add `tenant_id`). Move AI calls to a job queue if you start exceeding 10 RPS to Anthropic.

## What I'd add for a real client

1. Inbound email parsing (Postmark inbound webhook → lead row).
2. Two-way SMS thread view (Twilio webhooks → outreach table → UI).
3. Calendar tool — Claude proposes specific times from real free/busy.
4. Re-engagement sequences — scheduled re-touches on stale leads, with the AI checking for "anything new since last contact."
5. Duplicate detection — fuzzy match on phone/email at intake.
6. Owner-only audit view — "show me what the AI sent on my behalf this week."
