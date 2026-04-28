# lead-engine

AI-driven lead management for small businesses. Capture → qualify → score → outreach → track. Not a chatbot.

## What it is

A reference implementation of the lead pipeline that small services businesses (HVAC, med spa, photographer, contractor) actually need. Built to demonstrate full-stack AI integration — Claude does the research, scoring, and personalization; the rest of the system makes it operational.

## What's in the demo

- **Lead capture API** — webhook for website forms, manual entry, missed-call text-back stub
- **AI qualification** — Claude scores incoming leads on fit (location, job type, urgency) and produces a structured `LeadScore` with rationale
- **Outreach drafting** — Claude drafts SMS + email follow-up using the lead's specific context, not a template
- **Pipeline dashboard** — React + Tailwind board showing leads by stage, with drill-in
- **Audit trail** — every AI call logged with input, output, model, latency, cost — so you can debug and bill clients honestly

## Stack

- **Frontend**: Vite + React 18 + TypeScript + Tailwind
- **Backend**: Node 20 + Express + better-sqlite3
- **AI**: Anthropic Claude (Sonnet for drafting, Haiku for scoring) with prompt caching
- **Storage**: SQLite (one file, no setup) — swap for Postgres in production

## Why these choices for a portfolio piece

Small businesses don't want HubSpot + Zapier + Make + n8n + 6 SaaS subscriptions. They want one system that works. This demo shows you can deliver that.

- Single repo, single command to run, no SaaS dependencies (other than Anthropic).
- Database is a file. New buyer can clone and run in 60 seconds.
- AI calls are isolated in `server/services/claude.ts` — easy to swap providers or models.
- All AI prompts live in `server/prompts/` as markdown — non-engineers can edit them.

## Quickstart

```bash
pnpm install
cp .env.example .env  # add ANTHROPIC_API_KEY
pnpm seed             # loads sample leads
pnpm dev              # starts API on :3001 and web on :5173
```

Open http://localhost:5173.

## Project layout

```
lead-engine/
├── client/           # Vite + React dashboard
├── server/           # Express API + Claude integration
│   ├── routes/       # /api/leads, /api/ai, /api/webhooks
│   ├── services/     # claude.ts, score.ts, outreach.ts
│   └── prompts/      # System prompts (markdown, edit freely)
├── data/             # SQLite db + seed script
└── docs/
    └── architecture.md
```

## What this scaffold demonstrates

1. **Production AI patterns** — prompt caching, structured output via tool use, cost & latency tracking, retries with backoff, deterministic prompt versioning.
2. **Real business modeling** — leads have actual lifecycle stages, source attribution, and an audit log. Not toy data.
3. **Human-in-loop UI** — every AI suggestion is editable before it sends. Claude drafts, the user approves.

## Status

Scaffold. The pipeline runs end-to-end with seeded data. Outbound SMS/email are stubbed (logs to console) — wire Twilio/Postmark when needed. Production deployment guide in `docs/`.

## License

MIT
