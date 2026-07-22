# DEVLOG.md

> The most important file the reviewers read. One entry per day for 7 days. They
> cross-check this against `git log` — backdating is obvious. **Be honest.** A real
> "Hours: 0, took the day off" beats a fake entry every time.
>
> This file is pre-filled with Day 1 (the foundational build, done with AI assistance
> — disclosed in REFLECTION.md). Days 2–7 are templates for YOU to fill with your
> real work. Replace every `[bracketed]` placeholder. Delete this note before
> submitting.

## Day 1 — 2026-07-17
**Hours worked:** 6
**What I did:** Scaffolded the app from an Express + Vite + React + TS + Tailwind + shadcn template; built the pricing catalog (`shared/pricing.ts`) and the pure audit engine (`shared/audit.ts`) with hardcoded, defensible rules across all four recommendation categories (consolidate, downgrade, alternative, credits); wrote 11 Vitest tests covering the engine (all green); wired the API routes (`/api/audit`, `/api/summary`, `/api/lead`, `/api/audits/:id`, `/s/:id` OG HTML); built the spend input form with localStorage persistence, the results page (hero savings + per-tool breakdown + AI summary + lead gate), and the public share page; added Resend email + Supabase storage with graceful SQLite/in-memory fallbacks; set up CI (`ci.yml`), ESLint, and Vitest. Researched and verified all 8 tools' pricing against official vendor pages.
**What I learned:** Knowing when NOT to use AI is the whole game — the audit math must be hardcoded rules (LLMs hallucinate plan prices), but the personalized summary is a great AI use because the numbers are passed in. Graceful fallbacks (Supabase→SQLite→memory, Anthropic→template) are what let a reviewer open the deployed URL and never see a broken state.
**Blockers / what I'm stuck on:** Need to actually conduct the 3 user interviews (non-negotiable, can't fake). Need to deploy to a live URL (Render free tier) and verify Lighthouse scores ≥85/90/90.
**Plan for tomorrow:** Deploy to Render; run Lighthouse and fix any a11y/perf gaps; start the first user interview; begin refining the audit rules based on what the interview surfaces.

## Day 2 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:** [What you actually did — deploy, interview #1, specific code changes with file names]
**What I learned:** [Something specific and true]
**Blockers / what I'm stuck on:** [Real blocker, or "none"]
**Plan for tomorrow:** [Concrete next step]

## Day 3 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:** ...
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...

## Day 4 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:** ... (interview #2 lives here, ideally)
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...

## Day 5 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:** ... (interview #3 here)
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...

## Day 6 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:** ...
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** ...

## Day 7 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:** [Final polish, screenshots refreshed, submission checklist run]
**What I learned:** ...
**Blockers / what I'm stuck on:** ...
**Plan for tomorrow:** Submit.

---

### Reminder: the 5-distinct-commit-days rule
They run `git log --pretty=format:"%ad" --date=short | sort -u | wc -l` and reject if <5.
Commit on at least 5 different calendar days across the 7-day window. See GUIDANCE.md
for the recommended commit cadence. Don't squash everything into one day.
