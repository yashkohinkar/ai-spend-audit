/**
 * Open Graph / Twitter card HTML for shareable audit URLs.
 *
 * Crawlers (Twitter, Slack, LinkedIn, iMessage) do NOT execute the SPA's JS, so
 * the /s/:shareId route returns this pre-rendered HTML with populated meta tags.
 * A human who clicks through is bounced into the app at /#/share/:id to see the
 * interactive results.
 */
import { PRICING } from "@shared/pricing";
import type { AuditResult } from "@shared/audit";

interface SharePayload {
  shareId: string;
  result: AuditResult;
  useCase: string;
  teamSize: number;
}

interface BuildArgs {
  found: boolean;
  shareId: string;
  payload?: SharePayload;
}

const APP_URL = process.env.APP_URL || "";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function articleFor(n: number): string {
  // "an" before vowel-sounding numbers (8, 11, 18, 80–89, 800–…)
  const s = String(n);
  return /^(8|11|18|8\d|800)/.test(s) ? "An" : "A";
}

function toolNames(result: AuditResult): string {
  const names = result.tools.map((t) => {
    const tool = PRICING[t.toolId as keyof typeof PRICING];
    return tool?.name ?? t.toolId;
  });
  if (names.length <= 2) return names.join(" + ");
  return `${names.slice(0, 2).join(" + ")} +${names.length - 2} more`;
}

export function buildShareHtml({ found, shareId, payload }: BuildArgs): string {
  const url = `${APP_URL}/s/${shareId}`;

  let description: string;
  let ogTitle: string;
  if (found && payload) {
    const r = payload.result;
    if (r.totalMonthlySavings > 0) {
      ogTitle = `Saving $${r.totalMonthlySavings}/mo on AI tools`;
      description = `${articleFor(payload.teamSize)} ${payload.teamSize}-person team using ${toolNames(r)} could save $${r.totalMonthlySavings}/mo ($${r.totalAnnualSavings}/yr). See the full breakdown.`;
    } else {
      ogTitle = `This AI stack is already well-fit`;
      description = `${articleFor(payload.teamSize)} ${payload.teamSize}-person team's ${toolNames(r)} stack checked out clean — no overspend found. See the audit.`;
    }
  } else {
    ogTitle = "AI Spend Audit";
    description = "Find out where you're overspending on AI tools — free, no login.";
  }

  const appUrl = `${APP_URL}/#/share/${shareId}`;
  const ogImage = APP_URL ? `${APP_URL}/og.png` : "/og.png";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(url)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="AI Spend Audit" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="SpendScope — find the AI tools you pay for and don't use" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <meta name="twitter:image:alt" content="SpendScope — AI Spend Audit" />

  <meta http-equiv="refresh" content="0; url=${escapeHtml(appUrl)}" />
  <style>
    body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#e2e8f0}
    a{color:#2dd4bf;font-size:18px}
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(ogTitle)}</h1>
    <p>${escapeHtml(description)}</p>
    <p><a href="${escapeHtml(appUrl)}">Open the full audit →</a></p>
  </main>
</body>
</html>`;
}
