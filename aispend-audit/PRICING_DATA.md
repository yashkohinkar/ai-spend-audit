# PRICING_DATA.md

Every price the audit engine reasons about is defined in [`shared/pricing.ts`](shared/pricing.ts) and traced here to an official vendor pricing page. Verified **2026-07-17**. Prices are USD.

> Pricing changes weekly. Before each submission, re-verify each URL and update `shared/pricing.ts` + this file together. The `verified` date below is when each row was last confirmed against the live official page.

## Cursor
- Hobby: $0/user/month — https://cursor.com/pricing — verified 2026-07-17
- Pro: $20/user/month (monthly); $16/month on annual billing — https://cursor.com/pricing — verified 2026-07-17
- Business (current page labels this "Teams"): $40/user/month (monthly); $32/user/month annual — https://cursor.com/pricing — verified 2026-07-17
- Enterprise: Custom / contact sales (no fixed public price) — https://cursor.com/pricing — verified 2026-07-17

> Note: Cursor's page now groups paid individual options under "Individual" with Pro/Pro+/Ultra choices and labels the team tier "Teams" (formerly Business). The engine keeps the `business` id for stability and maps it to the $40 Teams tier.

## GitHub Copilot
- Free: $0 — https://docs.github.com/en/copilot/about-github-copilot/subscription-plans-for-github-copilot — verified 2026-07-17
- Individual (Copilot Pro): $10/month — https://docs.github.com/en/copilot/about-github-copilot/subscription-plans-for-github-copilot — verified 2026-07-17
- Business: $19/user/month per granted seat — https://docs.github.com/en/copilot/about-github-copilot/subscription-plans-for-github-copilot — verified 2026-07-17
- Enterprise: $39/user/month per granted seat — https://docs.github.com/en/copilot/about-github-copilot/subscription-plans-for-github-copilot — verified 2026-07-17

## Claude (Anthropic consumer)
- Free: $0/user/month — https://claude.com/pricing — verified 2026-07-17
- Pro: $20/user/month billed monthly ($17/month annual) — https://claude.com/pricing — verified 2026-07-17
- Max: from $100/user/month (5x usage vs Pro); the official page did not publish a separate 20x price at verification time — https://claude.com/pricing — verified 2026-07-17
- Team: Standard seat $25/seat/month billed monthly ($20/seat annual); Premium seat $125/seat/month — https://claude.com/pricing — verified 2026-07-17
- Enterprise: $20/seat/month + API-rate usage for self-serve; sales-assisted is contact-sales — https://claude.com/pricing — verified 2026-07-17

## ChatGPT (OpenAI consumer)
- Free: $0 — https://openai.com/chatgpt/pricing/ — verified 2026-07-17
- Plus: $20/user/month billed monthly — https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus — verified 2026-07-17
- Pro: $200/user/month — https://openai.com/chatgpt/pricing/ — verified 2026-07-17
- Business (formerly "Team", renamed 2025-08-29): $25/user/month monthly ($20/month annual); minimum 2 seats — https://help.openai.com/en/articles/8792828-what-is-chatgpt-business — verified 2026-07-17
- Enterprise: Custom / contact sales — https://openai.com/business/pricing/ — verified 2026-07-17

## Anthropic API (direct)
- Claude Sonnet 4.5: input $3 / 1M tokens; output $15 / 1M tokens — https://www.anthropic.com/pricing — verified 2026-07-17
- Claude Opus 4.1: input $15 / 1M tokens; output $75 / 1M tokens — https://www.anthropic.com/pricing — verified 2026-07-17
- Claude Haiku 4.5: input $1 / 1M tokens; output $5 / 1M tokens — https://www.anthropic.com/pricing — verified 2026-07-17
- Volume/credits: Batch API saves 50%; tiered incentives exist on committed spend — https://www.anthropic.com/pricing — verified 2026-07-17

## OpenAI API (direct)
- GPT-4o: $2.50 / 1M input; $10 / 1M output (standard rate; the current platform pricing page reorganized and only surfaces gpt-4o-transcribe at the same $2.50/$10 figures) — https://platform.openai.com/docs/pricing — verified 2026-07-17
- o3: input $5 / 1M tokens; output $20 / 1M tokens — https://platform.openai.com/docs/pricing — verified 2026-07-17
- Volume/credits: Batch API offers lower pricing on listed models; regional data-residency uplift is 10% — https://platform.openai.com/docs/pricing — verified 2026-07-17

> Honesty note: at verification time OpenAI's pricing page did not surface GPT-4.1 as a standalone text-generation price row (only gpt-4.1-mini appeared in a web-search billing note). The engine therefore uses GPT-4o and o3 as the two representative OpenAI API plans; both rates are cited from the official page above.

## Gemini (Google)
- Free: $0 — https://gemini.google/subscriptions/ — verified 2026-07-17
- Google AI Pro: $19.99/month — https://gemini.google/subscriptions/ — verified 2026-07-17
- Google AI Ultra: starts at $99.99/month (5x Pro usage) or $199.99/month (20x Pro usage); engine uses the $200 20x tier — https://gemini.google/subscriptions/ — verified 2026-07-17
- API — Gemini 2.5 Pro (Standard): input $1.25 / 1M tokens (≤200k context); output $10 / 1M tokens — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-07-17
- Volume/credits: Batch/Flex pricing cuts 2.5 Pro input to $0.625/1M and output to $5/1M; Ultra subs include Google Flow Credits — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-07-17

## Windsurf (Codeium / Devin)
- Free: $0/month — https://windsurf.com/pricing — verified 2026-07-17
- Pro: $20/month — https://windsurf.com/pricing — verified 2026-07-17
- Teams: $80/month flat team base + $40/month per full developer seat — https://windsurf.com/pricing — verified 2026-07-17
- Enterprise: contact sales — https://windsurf.com/pricing — verified 2026-07-17

> Note: windsurf.com/pricing now redirects to devin.ai/pricing and the page is titled "Devin Plans and Pricing." Windsurf Pro is now $20 (same as Cursor Pro), so the engine no longer treats Windsurf as a cheaper Cursor alternative — it instead surfaces GitHub Copilot Individual ($10) as the cheaper code-assistant swap, with an explicit capability caveat.

## Verification process
1. Open each URL above in an incognito window.
2. Confirm the price matches what the engine uses in `shared/pricing.ts`.
3. Update the `verified` date and commit with `docs: re-verify pricing YYYY-MM-DD`.
