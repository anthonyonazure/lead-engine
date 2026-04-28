# Changelog

All notable changes to lead-engine are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] — 2026-04-28

### Security
- **Shared X-API-Key middleware.** All non-webhook routes require the header. Constant-time comparison. Returns 503 in production when `LEAD_ENGINE_API_KEY` is unset, rather than opening up.
- **Rate limits.** 30/hr on `/api/ai/*`, 60/hr on `/api/outreach/*/send`, 30/min on `/api/webhooks/*`. Closes the cost-amplification attack surface.
- **Twilio HMAC verification** on `/api/webhooks/missed-call` when `TWILIO_AUTH_TOKEN` is set.
- **E.164 phone validation + country allowlist** (`TWILIO_ALLOWED_COUNTRIES`, default `+1`) on every outbound SMS — blocks SMS-pumping attacks even in simulation mode.
- **Input sanitization** at every public boundary: `lead.notes` capped at 4 KB, name at 200 B, generic fields at 500 B, control chars stripped before persistence and before flowing into LLM prompts.
- **Prompt-injection delimiters.** Submitter-controlled lead fields wrapped in `<<UNTRUSTED>>...<</UNTRUSTED>>`; system prompts explicitly tell the model to treat that content as data.
- **Body limit** reduced from 256 KB to 16 KB.
- **`helmet()`** for standard security headers; `x-powered-by` disabled.
- **CORS allowlist** via `LEAD_ENGINE_WEB_ORIGIN` (comma-separated). No reflective `*`.
- Production error responses are generic (`'internal error'`); full traces logged server-side only.

### Added
- 15 new tests covering the auth middleware, country allowlist, sanitization, and graceful degradation. 31 tests total.
- `client/src/lib/api.ts` sends `VITE_LEAD_ENGINE_API_KEY` on every request.

## [0.2.0] — 2026-04-28

### Added
- **Twilio SMS** integration in `services/sms.ts` with graceful simulation fallback when credentials aren't set.
- **Postmark email** integration in `services/email.ts` with graceful simulation fallback.
- `routes/outreach.ts` — `GET /lead/:leadId`, `POST /:id/send`, `PATCH /:id` for editable drafts.
- `OutreachList` component with status badges (draft / sent / simulated / error) and per-row Send buttons.
- Missed-call webhook now auto-fires Twilio text-back; outreach record persisted with status, provider ID, and timestamp.
- Auto-transition lead `qualified → engaged` when first outreach is sent.
- Schema migration in `db.ts` adds `status`, `provider_id`, `error`, `rationale` columns to existing `outreach` tables idempotently.
- 16 unit tests via vitest + supertest covering routes, webhooks, and SMS/email simulation.
- GitHub Actions CI: typecheck + tests + production build.

### Changed
- Bumped `@anthropic-ai/sdk` to `^0.91`.

## [0.1.0] — 2026-04-27

### Added
- Initial release. Single-codebase AI lead pipeline for small services businesses.
- Vite + React 18 + Tailwind dashboard; Express + better-sqlite3 backend.
- Anthropic Claude integration: Haiku for scoring, Sonnet for drafting; prompt caching and tool-use forcing.
- Five seeded sample leads covering qualified/tire-kicker/missed-call/urgent/spam distribution.
- Per-call AI cost & latency logging in the `ai_calls` table.
