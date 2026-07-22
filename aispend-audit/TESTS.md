# TESTS.md

Automated tests live in [`tests/audit.test.ts`](tests/audit.test.ts) and cover the audit engine — the core logic where correctness matters most. Framework: **Vitest**.

## How to run

```bash
npm test          # one-shot
npm run test:watch # watch mode
```

CI (`.github/workflows/ci.yml`) runs `npm run check` (tsc) → `npm run lint` (eslint) → `npm test` → `npm run build` on every push to `main`.

## What each test covers

| # | File | Covers | Asserts |
| --- | --- | --- | --- |
| 1 | `tests/audit.test.ts` → "flags a separate Copilot seat as redundant when Cursor is already in the stack" | Consolidation rule (a): Cursor + Copilot overlap | Copilot marked `consolidate`, new monthly spend $0, savings $19 |
| 2 | `tests/audit.test.ts` → "drops the weaker chat subscription when two premium chat AIs overlap" | Consolidation rule (c): two paid chat AIs | ChatGPT dropped (`consolidate`, saves $20), Claude kept (`optimal`) |
| 3 | `tests/audit.test.ts` → "downgrades Claude Team to Pro for a small team" | Plan right-sizing: Team overkill at ≤2 seats | `downgrade`, new $20, saves $5 |
| 4 | `tests/audit.test.ts` → "does NOT recommend a downgrade when the same plan fits a larger team" | Right-sizing threshold boundary (3 seats) | category ≠ `downgrade` |
| 5 | `tests/audit.test.ts` → "downgrades Gemini Ultra to Pro regardless of seats" | Premium-tier downgrade | `downgrade`, saves $180.01 |
| 6 | `tests/audit.test.ts` → "classifies >$500/mo savings as the high tier" | Tier classification + annual math | savings > $500, tier `high`, annual ≈ monthly × 12 |
| 7 | `tests/audit.test.ts` → "is honest and reports optimal/low savings when the stack already fits" | Honesty: never manufactures savings | $0 savings, tier `optimal`, all tools `optimal` |
| 8 | `tests/audit.test.ts` → "estimates a volume discount for high API spend but not for low spend" | Credits rule: API volume discount at >$100 | high spend → `credits` ~12%; low spend → `optimal` |
| 9 | `tests/audit.test.ts` → "switches Cursor Pro to GitHub Copilot Individual for pure coding" | Alternative rule: cheaper comparable tool | `alternative`, new $50, saves $50 |
| 10 | `tests/audit.test.ts` → "does NOT offer the cheaper alternative for a non-coding use case" | Alternative guard: only fires for coding | non-coding → `optimal` (no manufactured swap) |
| 11 | `tests/audit.test.ts` → "accounts for Windsurf Teams' $80 base when downgrading to Pro" | basePrice math: $80 base + $40/seat | current $120 → new $20, saves $100 |

## Why these

The brief asks for "≥5 tests covering the audit engine specifically. They must actually run. We will run them." These 11 cover all four recommendation categories (consolidate, downgrade, alternative, credits), the tier thresholds, the honesty guard, and the annual-savings derivation. They run in <1s with no external dependencies.

The audit engine (`shared/audit.ts`) is deliberately pure and dependency-free precisely so it can be tested like this — no DB, no network, no mocks.
