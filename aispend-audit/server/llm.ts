/**
 * AI-generated personalized summary.
 *
 * Uses the Anthropic API (Claude) when ANTHROPIC_API_KEY is set; otherwise falls
 * back to a deterministic templated summary so the feature always works.
 *
 * Full prompt + rationale live in PROMPTS.md.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult } from "@shared/audit";

const SYSTEM_PROMPT = `You are a sharp, plain-spoken AI spend analyst. You write a single ~100-word
personalized summary of an audit result for a non-technical founder or ops lead.
Rules: lead with the biggest concrete saving in dollars. Mention the specific
tool/plan change that drives it. Be honest — if savings are small, say so; never
invent numbers. No bullet points, no emojis, no marketing fluff. One paragraph.`;

function buildUserPrompt(result: AuditResult, useCase: string, teamSize: number): string {
  const lines = result.tools
    .filter((t) => t.monthlySavings > 0)
    .map(
      (t) =>
        `- ${t.toolName} ${t.planName} (${t.seats} seat${t.seats === 1 ? "" : "s"}): ${t.recommendedAction} → saves $${t.monthlySavings}/mo. ${t.reason}`
    )
    .join("\n");

  return `Audit result for a ${teamSize}-person team whose primary use case is "${useCase}".

Total current spend: $${result.totalCurrentMonthly}/mo
Total after recommendations: $${result.totalNewMonthly}/mo
Total monthly savings: $${result.totalMonthlySavings}/mo ($${result.totalAnnualSavings}/yr)

Per-tool recommendations with savings:
${lines || "- (none — the stack is already well-fit)"}

Write the ~100-word personalized summary now. Use only the numbers above.`;
}

function fallbackSummary(result: AuditResult, useCase: string, teamSize: number): string {
  const top = [...result.tools].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  if (result.totalMonthlySavings <= 0) {
    return `Your ${teamSize}-person team's "${useCase}" AI stack is well-fit for its size — we found no plan downgrades or redundant tools worth acting on. Total spend stays at $${result.totalCurrentMonthly}/mo. Re-run this audit when you add seats or tools; new vendor pricing and alternatives appear weekly.`;
  }
  const topClause = top
    ? ` The single biggest win is ${top.recommendedAction.toLowerCase()} ($${top.monthlySavings}/mo).`
    : "";
  return `Your ${teamSize}-person team can save $${result.totalMonthlySavings}/mo ($${result.totalAnnualSavings}/yr) on "${useCase}" AI tools, mostly through plan right-sizing and removing overlapping seats.${topClause} Re-run this audit whenever you add seats or a new tool — vendor pricing and cheaper alternatives shift constantly.`;
}

export async function generateSummary(
  result: AuditResult,
  useCase: string,
  teamSize: number
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackSummary(result, useCase, teamSize);
  }
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 220,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(result, useCase, teamSize) }],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return text || fallbackSummary(result, useCase, teamSize);
  } catch (e) {
    console.warn("[summary] Anthropic call failed, using fallback:", e);
    return fallbackSummary(result, useCase, teamSize);
  }
}
