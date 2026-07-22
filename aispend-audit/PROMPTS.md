# PROMPTS.md

The only place AI is used in this product is the **personalized summary** on the audit results page (`server/llm.ts`). The audit math itself is hardcoded rules — that is deliberate (see `ARCHITECTURE.md` → "Why not AI for the audit?").

## System prompt

```
You are a sharp, plain-spoken AI spend analyst. You write a single ~100-word
personalized summary of an audit result for a non-technical founder or ops lead.
Rules: lead with the biggest concrete saving in dollars. Mention the specific
tool/plan change that drives it. Be honest — if savings are small, say so; never
invent numbers. No bullet points, no emojis, no marketing fluff. One paragraph.
```

## User prompt template

```
Audit result for a {teamSize}-person team whose primary use case is "{useCase}".

Total current spend: ${totalCurrentMonthly}/mo
Total after recommendations: ${totalNewMonthly}/mo
Total monthly savings: ${totalMonthlySavings}/mo (${totalAnnualSavings}/yr)

Per-tool recommendations with savings:
- {toolName} {planName} ({seats} seats): {recommendedAction} → saves ${monthlySavings}/mo. {reason}
...

Write the ~100-word personalized summary now. Use only the numbers above.
```

The structured per-tool lines are injected from the audit result, so the model is constrained to the engine's own numbers — it cannot invent savings that don't exist in the data.

## Why these prompts

- **System prompt bans invention and fluff.** The biggest risk with an LLM in a finance-adjacent tool is hallucinated numbers. The system prompt explicitly says "never invent numbers" and "be honest — if savings are small, say so." This matches the brief's honesty requirement (don't manufacture savings).
- **Numbers are passed in, not generated.** The user prompt hands the model the exact savings figures and per-tool reasons. The LLM's job is synthesis and tone, not arithmetic. A finance person reading the summary sees the same numbers the engine computed.
- **~100 words, one paragraph.** The brief specified the length. A paragraph (not bullets) reads as a human analyst note and screenshots well.
- **Lead with the biggest saving.** Founder attention is the scarcest resource; the summary front-loads the single highest-impact action.

## Fallback (no API key / API failure)

`server/llm.ts` `fallbackSummary()` produces a deterministic templated summary from the same audit result — same numbers, same honesty rules, just less personalized prose. It triggers when `ANTHROPIC_API_KEY` is unset or the API throws (timeout, 429, 5xx). The user never sees an error; they see a correct, slightly blander summary. The `/api/summary` response includes `fallback: true` so the UI could badge it (currently the badge always says "AI-generated" because the fallback is still generated from the same data).

## What I tried that didn't work

- **Asking the model to compute savings from raw tool inputs.** Early draft sent the user's raw tool list and asked Claude to "find the savings." It confidently produced wrong plan prices (stale training data) and invented cheaper alternatives that didn't exist. Fix: do the math in code, hand the model only the verified numbers to summarize. This is the core "knowing when not to use AI" decision.
- **Letting the model pick the recommended action.** When the prompt offered choices ("downgrade, keep, or switch?"), the model's picks didn't always match the engine's defensible rules, creating inconsistency between the per-tool cards and the summary. Fix: the engine decides; the summary only describes.
- **Longer summaries (250 words).** Read as an essay, not a note. Cut to ~100 words.
