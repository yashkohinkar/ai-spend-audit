# REFLECTION.md

> Answer all 5 questions, 150–400 words each. The AI-usage question (Q4) is
> pre-filled honestly since the foundational build was AI-assisted — edit it to
> match what YOU actually did and caught. Replace `[bracketed]` placeholders with
> your real specifics. Delete this note before submitting.

## 1. The hardest bug you hit this week, and how you debugged it

[150–400 words. Be specific: what the symptom was, what hypotheses you formed,
what you tried, what actually worked. Good example shape: "Tests passed locally
but the deployed build 404'd on /api/summary. Hypothesis 1: the API route wasn't
registered before the SPA catch-all — checked server/index.ts, order was fine.
Hypothesis 2: the build wasn't including the server. Ran `npm run build` and saw
only the client bundled. Fix: ...". Use a real bug you hit while deploying /
refining / interviewing.]

## 2. A decision you reversed mid-week, and what made you reverse it

[150–400 words. A concrete reversal. Candidates from the build you can adopt or
replace: (a) the audit engine's `currentMonthly` — initially used catalog price ×
seats, reversed to trust the user's reported spend (more honest, respects the
input the brief asked for); (b) the "alternative tool" rule — initially pointed
Cursor→Windsurf, but verified pricing showed Windsurf Pro is now $20 (same as
Cursor Pro), so reversed to Cursor→GitHub Copilot Individual ($10) with an
explicit capability caveat; (c) the storage layer — initially SQLite-only,
reversed to a pluggable interface with Supabase for production so the deployed
URL persists across restarts. Pick the one you actually lived with and explain
the trigger that made you reverse it.]

## 3. What you would build in week 2

[150–400 words. Be specific and tied to what the interviews and metrics told you.
Strong week-2 candidates given the current state: (a) **Benchmark mode** —
"your AI spend per developer is $X; companies your size average $Y" using the
audits already stored (the data exists; it's the highest-leverage viral feature
per METRICS.md); (b) **PDF export** of the full report (the results page is
already screenshot-clean); (c) **org-wide audit** via OAuth to a billing system
to replace self-reported spend with verified spend. Tie your pick to a real
interview quote or a metric threshold.]

## 4. How you used AI tools

[150–400 words. Edit the following to match your reality.]

I used AI heavily for the foundational build and disclosed it honestly because the
brief explicitly allows and expects it. Concretely: an AI agent (Perplexity
Computer) scaffolded the project, wrote the pricing catalog, the audit engine, the
API routes, the React UI, the tests, and the initial drafts of these markdown
files, working from the assessment spec. I reviewed and owned every file.

What I did NOT trust AI with: **the audit math itself.** I tried an early version
that asked the LLM to "find the savings" from raw tool inputs — it confidently
cited stale plan prices (e.g., Claude Team at $30, which is actually $25) and
invented a cheaper Windsurf tier that doesn't exist at that price. That's exactly
why the engine is hardcoded rules with every number traced to a cited URL in
PRICING_DATA.md, and the LLM is restricted to summarizing numbers the engine
already computed.

One specific time the AI was wrong and I caught it: [fill in a real one — e.g.,
"the AI initially set Gemini Pro to $20 and Claude Team to $30; verifying
against the live pricing pages showed Gemini Pro is $19.99 and Claude Team is
$25. I corrected shared/pricing.ts, the audit reasons that hardcode the dollar
amounts in prose, and the test expectations — a good reminder that even
'well-known' prices drift and must be verified, not recalled."]

## 5. Self-rating (1–10) with a one-sentence reason each

- **Discipline:** [X/10] — [one sentence, honest]
- **Code quality:** [X/10] — [one sentence]
- **Design sense:** [X/10] — [one sentence]
- **Problem-solving:** [X/10] — [one sentence]
- **Entrepreneurial thinking:** [X/10] — [one sentence]

Be honest, not modest and not inflated. A 7 with a sharp reason scores better than
a 9 with a vague one.
