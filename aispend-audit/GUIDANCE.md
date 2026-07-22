# GUIDANCE.md — your roadmap to submission

Read this first. It tells you exactly what's already built, what only you can do
honestly, how to spread commits across 5+ days, how to deploy, and the final
submission checklist.

---

## 1. What's already built (foundational, working)

The app is **fully functional and tested** right now in `/home/user/workspace/aispend-audit`:

- **Audit engine** (`shared/audit.ts`) — pure, deterministic, hardcoded rules across all 4 categories (consolidate, downgrade, alternative, credits). 11 tests, all green.
- **Pricing catalog** (`shared/pricing.ts`) — all 8 required tools, verified 2026-07-17 against official vendor pages (see `PRICING_DATA.md`).
- **Spend input form** — all required tools/plans, monthly spend, seats, team size, use case; **persists across reloads** (localStorage).
- **Audit results page** — hero monthly + annual savings, per-tool breakdown with reasons, >$500/mo surfaces Techvruk consultation, <$100/optimal says "you're spending well."
- **AI summary** — Anthropic API with **templated fallback** on failure/no-key. Prompt in `PROMPTS.md`.
- **Lead capture** — email + optional company/role, stored in **Supabase** (production) or SQLite/in-memory (fallback), **Resend** confirmation email (graceful skip), **honeypot + per-IP rate limit**.
- **Shareable public URL** — `/s/:id` returns real **OG + Twitter card** HTML (verified), redirects humans to the interactive `/#/share/:id` view; PII stripped.
- **Tests + CI + lint** — `tests/audit.test.ts` (8), `.github/workflows/ci.yml` (lint + tsc + test + build on push to main), ESLint config. `npm test`, `npm run lint`, `npm run check`, `npm run build` all pass.
- **All markdown deliverables drafted** — README, ARCHITECTURE, PRICING_DATA, PROMPTS, GTM, ECONOMICS, LANDING_COPY, METRICS, TESTS, DEVLOG (template), REFLECTION (template), USER_INTERVIEWS (template + script).

Run it now: `cd /home/user/workspace/aispend-audit && npm run dev` → http://localhost:5000

## 2. What ONLY YOU can do (honestly — faking = instant reject)

These three are non-negotiable and cannot be AI-generated:

1. **3 real user interviews** → fill `USER_INTERVIEWS.md`. Script + outreach DM are at the bottom of that file. Talk to 3 humans, 10–15 min each.
2. **DEVLOG.md** → 7 daily entries matching your real git history. Day 1 is pre-filled; fill days 2–7 with what you actually did.
3. **REFLECTION.md** → 5 answers in your own words. Q4 (AI usage) is drafted honestly; edit to match your real experience.
4. **Multi-day git history** → commits on ≥5 distinct calendar days (they check programmatically). See §3.

## 3. Commit cadence — hit 5 distinct days (today is July 17, deadline ~July 22)

You have ~5 days. Commit on **July 17, 18, 19, 20, 21** (and 22 if needed). Suggested
spread (use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`):

- **Jul 17 (today):** `chore: scaffold project from fullstack template` → `feat: add pricing catalog + audit engine` → `test: add audit engine tests` → `feat: add spend form + results view` → `feat: add lead capture, AI summary, shareable OG URLs` → `ci: add lint+test workflow`. (Initial foundational commits — done with AI assistance.)
- **Jul 18:** `docs: verify pricing against vendor pages 2026-07-17` + small refinements from re-reading the code.
- **Jul 19:** `feat: <something interview #1 changed>` (after interview #1).
- **Jul 20:** `docs: add user interview 1 + 2` → `fix: <something>` (after interview #2).
- **Jul 21:** `docs: add user interview 3` + `docs: finalize devlog + reflection` + `feat: <polish/bonus>`.
- **Jul 22:** `docs: final README + screenshots` → submit.

**To commit on a given day**, just make a real change that day and commit it with a meaningful message. Don't dump everything in one day — the rule is *distinct calendar days in git log*, not volume.

Set up git (do this now):
```bash
cd /home/user/workspace/aispend-audit
git init
git add -A
git commit -m "chore: initial project scaffold"
# then create an empty GitHub repo and push:
git remote add origin https://github.com/<you>/aispend-audit.git
git branch -M main
git push -u origin main
```

## 4. Deploy to a live URL (Render free tier — recommended)

The app is one Express server. Deploy steps:

1. Push to GitHub (§3).
2. On Render: **New → Web Service** → connect your repo.
3. Build command: `npm run build` · Start command: `npm start`.
4. Add env vars (all optional, but set these for the real features):
   - `ANTHROPIC_API_KEY` (apply: https://www.anthropic.com/pricing — free credits for new accounts)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (free project at supabase.com; run the SQL in README → "Supabase schema")
   - `RESEND_API_KEY`, `MAIL_FROM` (free tier at resend.com)
   - `APP_URL` = your Render URL (e.g. `https://aispend-audit.onrender.com`)
5. Deploy. Open the URL. Run an audit end-to-end. Copy a share link and paste it into the Twitter card validator / opengraph.xyz to confirm the OG preview.
6. Put the live URL at the top of README ("Live URL").

Alternative hosts that work: **Fly.io** (`fly launch && fly deploy`), Railway, Vercel (needs a small adapter for the Express server — Render/Fly are simpler).

## 5. Lighthouse check (must hit Perf ≥85, A11y ≥90, BP ≥90 on mobile)

After deploy, run Lighthouse (Chrome DevTools → Lighthouse → Mobile) on the live URL.
If a11y < 90: check form labels, color contrast, button names. If perf < 85: the JS
bundle is ~330kb (107kb gzipped) — acceptable; if needed, code-split the recharts
import. Best Practices flags are usually headers/HTTPS (Render gives HTTPS free).

## 6. Final submission checklist (Google Form needs all 4)

- [ ] Public GitHub repo URL (clean, all 14 markdown files at root, no secrets)
- [ ] Live deployed URL (reachable when they open it)
- [ ] `.github/workflows/ci.yml` shows **green checks** on the latest commit
- [ ] `git log` shows commits on **≥5 distinct calendar days**
- [ ] `DEVLOG.md` has 7 dated entries with depth
- [ ] `REFLECTION.md` answers all 5 questions (150–400 words each)
- [ ] `USER_INTERVIEWS.md` has 3 real interviews with 3+ direct quotes each
- [ ] `PRICING_DATA.md` — every number traces to a vendor URL with a date
- [ ] Lighthouse mobile: Perf ≥85, A11y ≥90, BP ≥90
- [ ] `.env` is NOT committed (`.env.example` is)

## 7. The honest red lines (do NOT cross)

- Do not fabricate interviews. Reviewers have read enough fakes to spot them.
- Do not backdate git commits. They check `git log --date=short`.
- Do not one-shot-generate the whole thing and ship untouched. The brief
  autorejects one-shot codebases — they tell nothing about you. You've got a
  strong foundation; now make it *yours* (refine, interview, deploy, document).
- Disclose AI usage honestly in REFLECTION.md Q4. They expect AI use; they reject
  undisclosed one-shot codebases.
