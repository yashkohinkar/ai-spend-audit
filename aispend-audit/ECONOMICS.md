# ECONOMICS.md

If Techvruk deployed SpendScope tomorrow, here's the unit economics. Inputs are rough — the brief says approximate numbers beat no numbers. I've flagged every assumption.

## What a converted lead is worth to Techvruk

Techvruk is an AI-infrastructure company; the audit exists to surface high-AI-spend teams and route the >$500/mo-savings cases into a paid consultation (and downstream, credits/infra spend). Worked value per converted lead:

- Average audited team spends **$2,400/mo** on AI tools (~$29k/yr). High-savings cases average **$650/mo** identified savings.
- A Techvruk consultation that captures ~60% of identified savings = **~$390/mo** value to the customer, or **~$4,680/yr**.
- Techvruk's take (consulting + reselling credits/infra at ~15% margin on the captured spend) ≈ **$4,680 × 15% ≈ $700/yr gross** per converted lead, plus the option value of the account (infrastructure upsell later).

**Conservative converted-lead value: $700 gross ARR in year 1, with upside to $2k+ if the account moves credits/infra through Techvruk.** I'll use **$1,000** as the planning value.

## CAC at each channel (from GTM.md)

| Channel | Cost | Conversions to a *captured lead* | Implied CAC/lead |
| --- | --- | --- | --- |
| HN "Show HN" launch | $0 (time only) | ~8 leads from ~150 audits | ~$0 (sweat) |
| Lenny's/Reforge Slack | $0 | ~6 leads | ~$0 |
| Personalized founder DMs (5 min each) | ~$8 labor/DM at $100/hr | ~8 leads from 50 DMs (16% reply, 100% lead) | ~$50 |
| Organic share-loop | $0 | ~10 leads | ~$0 |

Blended CAC/lead across the mix ≈ **$15–25** (dominated by the DM labor; the rest is sweat equity). No paid spend.

## The conversion funnel that makes this profitable

```
audits run → shareable links → leads captured → consultation booked → converted customer
```

Working the rates that must hold for the math to work (with my planning value of $1,000/converted customer):

| Step | Rate | Notes |
| --- | --- | --- |
| Audit run → shareable link created | 20% | "this is worth saving/sharing" |
| Shareable link → lead captured (email) | 10% | email-after-value gate |
| Lead captured → consultation booked | 8% | only the >$500/mo cases are surfaced the consultation CTA |
| Consultation booked → converted customer | 25% | Techvruk closes 1 in 4 |

So per **1,000 audits run**: 200 shares → 20 leads → ~1.6 consultations → ~0.4 converted customers → **~$400 gross ARR**.

For the tool to be **profitable at this stage**, the converted-customer value needs to cover CAC. With CAC ≈ $20/lead and 20 leads producing 0.4 customers ($1,000 each = $400), the payback is **~2 months once a customer converts**, and the front-loaded audit volume is effectively free (sweat + $0 hosting on Render free tier + ~$0.002/audit in Anthropic summary cost, skipped 70% of the time via fallback).

**The number that has to be true:** `lead-captured → consultation-booked ≥ 5%` AND `consultation → converted ≥ 20%`. If consultation booking drops below 5% of leads, the funnel loses money on the DM labor and we either raise the savings threshold for the CTA or move to a lower-touch credit-resale path.

## What has to be true for $1M ARR in 18 months

$1M ARR at ~$1,000/converted-customer (blended; some accounts pay more via credits) = **~1,000 converted customers**, or ~**55/month** by month 18. Back-solving with the funnel above (1,000 audits → 0.4 customers), that needs **~140,000 audits/month** at month 18 — unrealistic off organic alone.

The path to $1M ARR is **not** linear audit volume; it's the **share-loop compounding + a B2B team-tier**:

- Months 1–6: organic HN/Slack/DMs → ~3,000 audits/mo, ~30 customers/mo → **~$360k ARR run-rate** (some annual prepay).
- Months 7–12: the share-loop + a "team benchmark" enterprise tier ($200/mo for org-wide audits + SSO) adds **~50 B2B seats/mo × $2,400/yr = $120k ARR/mo** added.
- Months 13–18: Techvruk credits/infra resale on the customer base converts the audit lead into recurring infra revenue — the audit becomes the top of funnel for a **$1M+ infra ARR** book, not a standalone product.

**The honest read:** SpendScope as a standalone tool is a ~$200–400k/yr lead-gen asset. It hits $1M ARR only as the acquisition wedge for Techvruk's core infra business — which is exactly why Techvruk would launch it. The math works if consultation-to-converted ≥ 20% and the share-loop's viral coefficient stays ≥ 0.3.

## Spreadsheet view (month-1 steady state, post-launch)

```
Audits run/month ............... 3,000
Shareable links/month .......... 600   (20%)
Leads captured/month ........... 60    (10% of shares)
Consultations booked/month ..... 3     (5% of leads)
Converted customers/month ....... 0.75  (25% of consults)
Gross ARR added/month .......... $750  (0.75 × $1,000)
Hosting + AI cost/month ........ ~$20  (Render free + Anthropic)
Labor (DMs) .................... ~$1,200 (150 DMs × $8)
Net month-1 .................... -$470 (intentional: building the share-loop)
```

Month 1 is intentionally negative — the share-loop and HN referral compounding are what flip it positive by month 3–4. That's the bet.
