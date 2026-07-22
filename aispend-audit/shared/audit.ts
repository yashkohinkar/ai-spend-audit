/**
 * AUDIT ENGINE
 * ------------
 * Pure, deterministic, dependency-free TypeScript. No AI, no I/O.
 *
 * Design principle (from the brief): "For the audit math itself, hardcoded rules
 * are correct — knowing when not to use AI is part of the test." Every
 * recommendation must be defensible to a finance person: a clear action, a number,
 * and a one-sentence reason grounded in the PRICING catalog.
 *
 * Rules run in priority order, one primary recommendation per tool entry:
 *   1. consolidate  — overlapping paid tools (keep one, drop the rest)
 *   2. downgrade    — plan is overkill for the team size
 *   3. alternative   — a cheaper comparable tool fits the use case
 *   4. credits       — high API spend qualifies for volume/committed-use discount
 *   5. optimal       — nothing to change (honest; never manufacture savings)
 */

import { PRICING, monthlyForPlan, type Plan, type Tool } from "./pricing";

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolEntry {
  toolId: string;
  planId: string;
  monthlySpend: number; // user-reported USD/month for this tool
  seats: number;
}

export interface AuditInput {
  teamSize: number;
  useCase: UseCase;
  tools: ToolEntry[];
}

export type RecCategory =
  | "consolidate"
  | "downgrade"
  | "alternative"
  | "credits"
  | "optimal";

export interface ToolRecommendation {
  toolId: string;
  toolName: string;
  planName: string;
  seats: number;
  currentMonthly: number;
  recommendedAction: string;
  newMonthly: number;
  monthlySavings: number;
  category: RecCategory;
  reason: string;
}

export type AuditTier = "high" | "medium" | "low" | "optimal";

export interface AuditResult {
  tools: ToolRecommendation[];
  totalCurrentMonthly: number;
  totalNewMonthly: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  tier: AuditTier;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Canonical current monthly spend for an entry: trust the user's reported spend,
 * fall back to the catalog's plan total (price × seats + any base) for per-seat plans. */
function currentMonthly(entry: ToolEntry, plan: Plan | undefined): number {
  if (entry.monthlySpend && entry.monthlySpend > 0) return entry.monthlySpend;
  return monthlyForPlan(plan, entry.seats);
}

function hasTool(tools: ToolEntry[], toolId: string): boolean {
  return tools.some((t) => t.toolId === toolId);
}

/** The set of paid (not free, not usage) chat subscriptions a team holds. */
const CHAT_TOOL_IDS = ["chatgpt", "claude", "gemini"];
const isPaidChat = (entry: ToolEntry): boolean => {
  const tool = PRICING[entry.toolId as keyof typeof PRICING];
  if (!tool || !CHAT_TOOL_IDS.includes(entry.toolId)) return false;
  const plan = tool.plans.find((p) => p.id === entry.planId);
  return !!plan && plan.billing === "per_seat" && plan.price > 0;
};

/** Which chat tool best fits the team's primary use case. */
function bestChatForUseCase(useCase: UseCase): string {
  if (useCase === "coding" || useCase === "research") return "claude";
  if (useCase === "writing" || useCase === "data") return "chatgpt";
  return "claude"; // mixed — Claude is a strong general default
}

function buildOptimal(entry: ToolEntry, tool: Tool, plan: Plan | undefined): ToolRecommendation {
  const cm = currentMonthly(entry, plan);
  return {
    toolId: entry.toolId,
    toolName: tool.name,
    planName: plan?.name ?? entry.planId,
    seats: entry.seats,
    currentMonthly: cm,
    recommendedAction: "Keep current plan",
    newMonthly: cm,
    monthlySavings: 0,
    category: "optimal",
    reason:
      plan && plan.price === 0
        ? "You're already on the free tier — no spend to optimize here."
        : "Your plan fits your team size and use case; no change recommended.",
  };
}

export function audit(input: AuditInput): AuditResult {
  const { useCase, tools } = input;

  // ---- Phase 1: consolidation decisions (which overlapping tools to drop) ----
  const dropSet = new Set<string>(); // toolId to drop entirely
  const reasons: Record<string, string> = {};

  // (a) Editor + assistant overlap: Cursor already ships inline completions, so a
  // separate Copilot seat duplicates that capability.
  if (hasTool(tools, "cursor") && hasTool(tools, "copilot")) {
    dropSet.add("copilot");
    reasons.copilot =
      "If the same users are running Cursor and Copilot, Cursor's editor already includes AI autocomplete and chat — a separate Copilot seat likely duplicates that capability.";
  }

  // (b) Multiple editors: keep one, drop the other.
  if (hasTool(tools, "cursor") && hasTool(tools, "windsurf")) {
    // Keep the one the user already pays more for / is on a paid plan; drop windsurf by default.
    dropSet.add("windsurf");
    reasons.windsurf =
      "You run two AI code editors; consolidating to one removes a redundant seat.";
  }

  // (c) Multiple premium chat subscriptions: keep the one matching the use case.
  const paidChats = tools.filter(isPaidChat);
  if (paidChats.length >= 2) {
    const keepId = bestChatForUseCase(useCase);
    for (const c of paidChats) {
      if (c.toolId !== keepId) {
        dropSet.add(c.toolId);
        reasons[c.toolId] =
          `You hold ${paidChats.length} premium chat subscriptions; one (${PRICING[keepId as keyof typeof PRICING].name}) covers your ${useCase} workflow. Dropping the others removes redundant spend.`;
      }
    }
  }

  // ---- Phase 2: per-tool recommendations ----
  const recs: ToolRecommendation[] = tools.map((entry) => {
    const tool = PRICING[entry.toolId as keyof typeof PRICING];
    const plan = tool?.plans.find((p) => p.id === entry.planId);
    if (!tool || !plan) {
      return {
        toolId: entry.toolId,
        toolName: entry.toolId,
        planName: entry.planId,
        seats: entry.seats,
        currentMonthly: entry.monthlySpend,
        recommendedAction: "Review manually",
        newMonthly: entry.monthlySpend,
        monthlySavings: 0,
        category: "optimal",
        reason: "Unrecognized tool/plan — verify pricing in PRICING_DATA.md.",
      };
    }

    const cm = currentMonthly(entry, plan);
    const seats = Math.max(entry.seats, 1);

    // (1) Consolidation — drop entirely (only when it actually removes spend)
    if (dropSet.has(entry.toolId) && cm > 0) {
      return {
        toolId: entry.toolId,
        toolName: tool.name,
        planName: plan.name,
        seats: entry.seats,
        currentMonthly: cm,
        recommendedAction: `Drop ${tool.name} ${plan.name}`,
        newMonthly: 0,
        monthlySavings: cm,
        category: "consolidate",
        reason: reasons[entry.toolId] ?? "Overlapping tool — consolidate to remove redundant spend.",
      };
    }

    // (2) Downgrade — plan is overkill for the team size
    const downgrade = downgradeRecommendation(entry, tool, plan, cm, seats, useCase);
    if (downgrade) return downgrade;

    // (3) Alternative — cheaper comparable tool for the use case
    const alt = alternativeRecommendation(entry, tool, plan, cm, seats, useCase);
    if (alt) return alt;

    // (4) Credits — high API spend qualifies for volume discount
    const credits = creditsRecommendation(entry, tool, plan, cm);
    if (credits) return credits;

    // (5) Optimal — honest, no manufactured savings
    return buildOptimal(entry, tool, plan);
  });

  const totalCurrentMonthly = round2(recs.reduce((s, r) => s + r.currentMonthly, 0));
  const totalNewMonthly = round2(recs.reduce((s, r) => s + r.newMonthly, 0));
  const totalMonthlySavings = round2(totalCurrentMonthly - totalNewMonthly);
  const totalAnnualSavings = round2(totalMonthlySavings * 12);

  // Tier thresholds from the brief: >$500/mo = high (surface Techvruk),
  // <$100/mo or already-optimal = be honest.
  let tier: AuditTier = "low";
  if (totalMonthlySavings <= 0) tier = "optimal";
  else if (totalMonthlySavings > 500) tier = "high";
  else if (totalMonthlySavings >= 100) tier = "medium";
  else tier = "low";

  return {
    tools: recs,
    totalCurrentMonthly,
    totalNewMonthly,
    totalMonthlySavings,
    totalAnnualSavings,
    tier,
  };
}

function downgradeRecommendation(
  entry: ToolEntry,
  tool: Tool,
  plan: Plan,
  cm: number,
  seats: number,
  _useCase: UseCase
): ToolRecommendation | null {
  // Only right-size per-seat (retail) plans.
  if (plan.billing !== "per_seat" || plan.price === 0) return null;

  const mk = (
    targetPlanId: string,
    reason: string
  ): ToolRecommendation | null => {
    const target = tool.plans.find((p) => p.id === targetPlanId);
    if (!target || target.price >= plan.price) return null;
    const newMonthly = monthlyForPlan(target, seats);
    const savings = round2(cm - newMonthly);
    if (savings <= 0) return null;
    return {
      toolId: entry.toolId,
      toolName: tool.name,
      planName: plan.name,
      seats: entry.seats,
      currentMonthly: cm,
      recommendedAction: `Downgrade ${tool.name} ${plan.name} → ${target.name}`,
      newMonthly,
      monthlySavings: savings,
      category: "downgrade",
      reason,
    };
  };

  switch (entry.toolId) {
    case "cursor":
      if (plan.id === "business" && seats <= 5) {
        return mk(
          "pro",
          `Cursor Business ($40/seat) adds SSO/admin controls you likely don't need at ${seats} seat${seats === 1 ? "" : "s"}; Pro ($20) covers the same AI features.`
        );
      }
      if (plan.id === "enterprise") {
        // Custom-priced — can't compute a number, just flag.
        return null;
      }
      break;
    case "copilot":
      if (plan.id === "business" && seats <= 2) {
        return mk(
          "individual",
          `Copilot Business ($19/seat) is built for centralized org billing; at ${seats} seat${seats === 1 ? "" : "s"} Individual ($10) is the same completions without the overhead.`
        );
      }
      if (plan.id === "enterprise" && seats <= 5) {
        return mk(
          "business",
          `Copilot Enterprise ($39) adds knowledge-base search you likely aren't using at ${seats} seats; Business ($19) keeps org controls.`
        );
      }
      break;
    case "claude":
      if (plan.id === "team" && seats <= 2) {
        return mk(
          "pro",
          `Claude Team ($25/seat) adds an admin console and higher limits; for ${seats} seat${seats === 1 ? "" : "s"} without org admin needs, Pro ($20) gives the same model access.`
        );
      }
      if (plan.id === "max" && seats <= 2) {
        return mk(
          "pro",
          `Claude Max ($100/seat) is tuned for extreme usage; unless you're hitting Pro limits daily, Pro ($20) covers typical ${_useCase} work.`
        );
      }
      break;
    case "chatgpt":
      if (plan.id === "team" && seats <= 2) {
        return mk(
          "plus",
          `ChatGPT Team ($25/seat) raises message limits and adds a shared workspace; at ${seats} seat${seats === 1 ? "" : "s"} Plus ($20) usually suffices.`
        );
      }
      if (plan.id === "pro" && seats <= 2) {
        return mk(
          "plus",
          `ChatGPT Pro ($200) is for the highest-volume users; at ${seats} seat${seats === 1 ? "" : "s"} Plus ($20) covers standard ${_useCase} use unless you're rate-limited daily.`
        );
      }
      break;
    case "gemini":
      if (plan.id === "ultra") {
        return mk(
          "pro",
          `Gemini Ultra ($200) is rarely cost-justified outside heavy multimodal workloads; Pro ($19.99) covers the same model family for most teams.`
        );
      }
      break;
    case "windsurf":
      if (plan.id === "teams" && seats <= 3) {
        return mk(
          "pro",
          `Windsurf Teams ($80/mo base + $40/dev seat) adds admin/centralized billing; at ${seats} seat${seats === 1 ? "" : "s"} Pro ($20) gives the same editor capability.`
        );
      }
      break;
  }
  return null;
}

function alternativeRecommendation(
  entry: ToolEntry,
  tool: Tool,
  plan: Plan,
  cm: number,
  seats: number,
  useCase: UseCase
): ToolRecommendation | null {
  if (plan.billing !== "per_seat" || plan.price === 0) return null;

  // Cursor Pro → GitHub Copilot Individual is a cheaper code assistant for pure
  // coding (Copilot lacks Cursor's agent editor, hence the capability caveat).
  if (entry.toolId === "cursor" && plan.id === "pro" && useCase === "coding") {
    const copilot = PRICING.copilot.plans.find((p) => p.id === "individual");
    if (copilot && copilot.price < plan.price) {
      const newMonthly = monthlyForPlan(copilot, seats);
      const savings = round2(cm - newMonthly);
      if (savings > 0) {
        return {
          toolId: entry.toolId,
          toolName: tool.name,
          planName: plan.name,
          seats: entry.seats,
          currentMonthly: cm,
          recommendedAction: `Switch Cursor Pro → GitHub Copilot Individual`,
          newMonthly,
          monthlySavings: savings,
          category: "alternative",
          reason: `If you mainly need inline autocomplete, GitHub Copilot Individual ($${copilot.price}/seat) covers it for half of Cursor Pro's $${plan.price}/seat. Keep Cursor only if you depend on its agentic editing.`,
        };
      }
    }
  }
  return null;
}

function creditsRecommendation(
  entry: ToolEntry,
  tool: Tool,
  plan: Plan,
  cm: number
): ToolRecommendation | null {
  // High API-direct spend qualifies for committed-use / volume discounts
  // (Anthropic and OpenAI both publish volume-based pricing tiers).
  if (plan.billing !== "usage") return null;
  if (cm < 100) return null; // not enough volume to justify a discount conversation

  const discountRate = 0.12; // conservative committed-use discount estimate
  const savings = round2(cm * discountRate);
  return {
    toolId: entry.toolId,
    toolName: tool.name,
    planName: plan.name,
    seats: entry.seats,
    currentMonthly: cm,
    recommendedAction: `Move ${tool.name} to committed-use / volume pricing`,
    newMonthly: round2(cm - savings),
    monthlySavings: savings,
    category: "credits",
    reason: `At $${Math.round(cm)}/mo in API spend you cross into volume-discount territory; modeling a conservative 12% potential saving from batch/flex/committed-use routes (Anthropic Batch API and Gemini Flex are ~50% off; OpenAI offers committed-use incentives). Estimate — confirm with the vendor before acting.`,
  };
}
