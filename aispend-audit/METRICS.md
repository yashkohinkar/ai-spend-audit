# METRICS.md

## North Star metric

**Shareable-audit-links created per week.**

Not "audits run" — a curious HN click that bounces runs an audit but creates zero value. A *shareable link* means someone found enough savings to want to save or show the result. It's the one number that proves the product delivered value *and* seeded the viral loop. For a free, no-login, B2B lead-gen tool used a few times a year, this is the right grain: it captures both value-delivered and distribution in a single counter. (DAU would be nonsensical here — nobody audits their AI spend daily.)

## Three input metrics that drive the North Star

1. **Audit-completion rate** (audit-result rendered ÷ form-started). If this is low, the form is too heavy or the value isn't surfacing — no completed audit means nothing to share.
2. **Savings-shown → share-link conversion** (share-link created ÷ audits showing >$100/mo savings). The share CTA only appears once value is shown; this measures whether the result page *motivates* sharing. The single biggest lever on the North Star.
3. **Share-link view → new-audit conversion** (new audits attributed to a share-link referrer ÷ share-link views). The viral coefficient's engine. If this is <5%, the OG preview or the share-page CTA is broken and the loop won't compound.

## What I'd instrument first

In priority order, all event-based (PostHog or a lightweight `POST /api/event`):

1. `form_started`, `tool_added`, `audit_submitted` (funnel for input metric #1).
2. `audit_result_viewed` with `tier` (high/medium/low/optimal) and `total_monthly_savings` as properties — the basis for input #2.
3. `share_link_created` (the North Star itself) + `share_link_viewed` (referrer captured) for input #3.
4. `lead_captured` with `savings_bucket` — the revenue-adjacent counter, tracked but not optimized until the top-of-funnel works.

I'd instrument these four events on day one and nothing else. Resist the urge to track every click — the noise hides the signal at this stage.

## What number triggers a pivot decision

**If, after 2 weeks of real traffic (>500 audits run), share-link creation is <5% of completed audits, the product is a tool, not a loop.** That's the pivot trigger: either the result page isn't motivating shares (fix the share incentive — e.g., add a "vs. companies your size" benchmark to make it brag-worthy), or there's no viral mechanic here and SpendScope should be repositioned as a pure lead-capture form for Techvruk consultations rather than a shareable consumer-ish tool. Concretely: **<5% share conversion for two consecutive weeks = run the benchmark-mode experiment; if that doesn't lift it above 8%, pivot to lead-gen-only** and stop investing in the share/OG infrastructure.
