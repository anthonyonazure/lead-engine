# lead-engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933)](https://nodejs.org)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Express%20%2B%20SQLite-blue)]()
[![Built with Claude](https://img.shields.io/badge/built%20with-Claude-cc785c)](https://anthropic.com)

**AI-driven lead management for small businesses. Capture → qualify → score → outreach → track. Not a chatbot.**

Most "lead automation" gigs land in one of two ditches: a pile of SaaS subscriptions (Zapier + HubSpot + Twilio + ConvertKit + a dashboard tool) that breaks on the first vendor change, or a custom monolith only its author can maintain. This is the middle path — a single small codebase that does the actual jobs, runs in 60 seconds, and is simple enough to hand off.

![lead-engine dashboard](docs/assets/dashboard.png)

## What's in the demo

- **Lead capture API** — webhooks for website forms and missed-call text-back
- **AI qualification** — Claude scores fit, urgency, reachability, signal quality with structured output
- **Outreach drafting** — personalized SMS + email per lead, in the voice of an owner-operator (no template smell)
- **Pipeline dashboard** — stage board with drill-in, all AI suggestions are editable before they send
- **Audit trail** — every Anthropic call logged with input tokens, output tokens, cache reads, latency, and computed cost in USD

## Stack

- **Frontend** — Vite + React 18 + TypeScript + Tailwind
- **Backend** — Node 20 + Express + better-sqlite3
- **AI** — Anthropic Claude (Haiku for scoring, Sonnet for drafting) with prompt caching and tool-use forcing
- **Storage** — SQLite (single file, no setup) — swap for Postgres in production with one ALTER per table

## Quickstart

```bash
pnpm install
cp .env.example .env  # add ANTHROPIC_API_KEY
pnpm seed             # loads 5 sample leads (qualified, tire-kicker, missed call, urgent, spam)
pnpm dev              # starts API on :3001 and web on :5173
```

Open http://localhost:5173.

## Production AI patterns demonstrated

- **Prompt caching** — system prompts marked `cache_control: ephemeral`. ~10× cost reduction on repeat calls within the 5-minute window.
- **Structured output via tool use** — every AI op defines an Anthropic tool with a strict input schema. No JSON parsing failures, ever.
- **Cost & latency logging** — every call writes to `ai_calls` with token counts, model, latency, and cost. Non-optional for production: needed to debug regressions, bill clients, choose models.
- **Model tiering** — Haiku for scoring (cheap, deterministic enough for a numeric output), Sonnet for drafting (worth the cost for tone). Both env-configurable.
- **Human-in-loop UI** — every AI suggestion is reviewed before it sends. Claude drafts, the user approves.

Detailed architecture and what's stubbed for production: [`docs/architecture.md`](docs/architecture.md)

## Project layout

```
lead-engine/
├── client/           # Vite + React dashboard
│   ├── src/components/   # PipelineBoard, LeadDetail
│   └── src/lib/          # API client
├── server/           # Express API + Claude integration
│   ├── routes/           # /api/leads, /api/ai, /api/webhooks
│   ├── services/         # claude.ts, score.ts, outreach.ts
│   └── prompts/          # System prompts (markdown — non-engineers can edit)
├── data/             # SQLite db + seed script
└── docs/
    ├── architecture.md
    └── assets/dashboard.png
```

## Why these choices for a portfolio piece

Small businesses don't want six SaaS subscriptions. They want one system that works, that they can afford, that doesn't break on Tuesday because Zapier changed an API. This demo shows you can deliver that — single repo, single command to run, no SaaS dependencies (other than Anthropic), and prompts living in plain markdown so the owner can edit them without a developer.

## Status

Scaffold. The pipeline runs end-to-end with seeded data. Outbound SMS/email currently log to console — wire Twilio/Postmark when needed (the call site is one function in `services/outreach.ts`). Production deployment guide in `docs/architecture.md`.

## License

MIT
