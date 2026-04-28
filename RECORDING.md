# Recording the demo Loom

Target: 90-second screencast embedded in the README near the top.

## Setup

1. Deploy via Render: `render.yaml` is in the repo root. Connect the repo, click deploy. Set `ANTHROPIC_API_KEY` in the Render env var dashboard. (If you skip Anthropic, the AI buttons will fail; recommend setting it for the recording.)
2. Open the deployed URL — header should show "Demo Mode" badge.
3. Open Loom, 1080p, mic on.

## Script

**[0-10s] What this is.** Demo URL loaded, pipeline board visible.

> "This is lead-engine. It's a single-codebase AI lead pipeline for small services businesses — capture, qualify, score, draft, send — without the six-SaaS-subscription tax. Vite, Express, SQLite, Claude, Twilio, Postmark."

**[10-30s] Score a lead.** Click "Marisol Vega" in the New column. Click "Score with Claude."

> "Marisol's a kitchen remodel inquiry from a website form. Score with Claude — Haiku does the scoring because it's structured and cheap. Eighty-two out of a hundred. The rationale lays out fit, urgency, reachability, signal quality. Four sentences, not a paragraph of fluff."

**[30-55s] Draft outreach.** Click "Draft Email."

> "Now let's draft a first-touch email. Sonnet for this — worth the cost for tone. Notice the draft references her actual project — 200 sqft kitchen, 60-day timeline, $40k budget — not a generic 'saw your inquiry.' If the lead had said nothing specific, the prompt is instructed to admit that and write a deliberately generic email rather than invent a reference."

**[55-75s] Send + outreach history.** Click Send. Show the status changing to "simulated."

> "I send it. Status flips to 'simulated' because Twilio isn't configured for the demo — in production this is a real send through Twilio or Postmark, with the provider ID and timestamp logged. The lead also auto-moves to Engaged. Every AI call writes to an `ai_calls` table with token counts, latency, and computed cost in USD. You can debug regressions and bill clients honestly."

**[75-90s] Close.** Briefly show repo or click into a tire-kicker lead and score that.

> "It's all on GitHub — 31 tests, CI green, security audit applied. If you're looking to build something like this for your business or your clients, that's what I do."

## After recording

1. Trim front and back silence.
2. Set thumbnail to a moment that shows the Score with Claude rationale rendered.
3. Copy the share URL.
4. Update README — replace `Watch the 90s walkthrough →` with the real Loom URL.
5. Optionally upload the Loom thumbnail PNG to `docs/assets/loom-thumb.png` and link it.
