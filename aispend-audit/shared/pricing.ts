/**
 * PRICING CATALOG
 * ----------------
 * Single source of truth for every price the audit engine reasons about.
 * Every number here MUST trace to an official vendor pricing page URL listed in
 * PRICING_DATA.md (with the date it was verified).
 *
 * Do NOT put price numbers anywhere else in the codebase — import from here so the
 * PRICING_DATA.md audit stays one-to-one with the engine.
 *
 * Pricing is volatile. Update this file + PRICING_DATA.md together before each
 * submission. Prices are USD.
 */

export type BillingModel = "per_seat" | "flat" | "usage";

export interface Plan {
  id: string;          // stable identifier used in logic/tests
  name: string;        // human label
  price: number;      // USD per seat per month (per_seat), or per month (flat), or 0 (usage)
  billing: BillingModel;
  /** Flat monthly base fee added once on top of per-seat price (e.g. Windsurf Teams: $80 base + $40/seat). */
  basePrice?: number;
  /** Per 1M tokens input/output, in USD, for usage-priced plans. */
  inputPer1M?: number;
  outputPer1M?: number;
}

export interface Tool {
  id: string;
  vendor: string;
  name: string;
  category:
    | "code_editor"
    | "code_assistant"
    | "chat_pro"
    | "api_direct";
  /** Canonical use cases this tool is strong at. */
  strengths: string[]; // coding | writing | data | research | mixed
  plans: Plan[];
  /** Official pricing page URL (also in PRICING_DATA.md). */
  pricingUrl: string;
}

export const PRICING = {
  cursor: {
    id: "cursor",
    vendor: "Anysphere",
    name: "Cursor",
    category: "code_editor",
    strengths: ["coding", "mixed"],
    pricingUrl: "https://cursor.com/pricing",
    plans: [
      { id: "hobby", name: "Hobby", price: 0, billing: "flat" },
      { id: "pro", name: "Pro", price: 20, billing: "per_seat" },
      { id: "business", name: "Business", price: 40, billing: "per_seat" },
      { id: "enterprise", name: "Enterprise", price: 0, billing: "flat" }, // custom
    ],
  },
  copilot: {
    id: "copilot",
    vendor: "GitHub (Microsoft)",
    name: "GitHub Copilot",
    category: "code_assistant",
    strengths: ["coding", "mixed"],
    pricingUrl: "https://docs.github.com/en/copilot/about-github-copilot/subscription-plans-for-github-copilot",
    plans: [
      { id: "free", name: "Free", price: 0, billing: "flat" },
      { id: "individual", name: "Individual", price: 10, billing: "per_seat" },
      { id: "business", name: "Business", price: 19, billing: "per_seat" },
      { id: "enterprise", name: "Enterprise", price: 39, billing: "per_seat" },
    ],
  },
  claude: {
    id: "claude",
    vendor: "Anthropic",
    name: "Claude",
    category: "chat_pro",
    strengths: ["coding", "writing", "research", "mixed"],
    pricingUrl: "https://claude.com/pricing",
    plans: [
      { id: "free", name: "Free", price: 0, billing: "flat" },
      { id: "pro", name: "Pro", price: 20, billing: "per_seat" },
      { id: "max", name: "Max (5x)", price: 100, billing: "per_seat" },
      { id: "team", name: "Team", price: 25, billing: "per_seat" },
      { id: "enterprise", name: "Enterprise", price: 0, billing: "flat" }, // custom
    ],
  },
  chatgpt: {
    id: "chatgpt",
    vendor: "OpenAI",
    name: "ChatGPT",
    category: "chat_pro",
    strengths: ["coding", "writing", "data", "research", "mixed"],
    pricingUrl: "https://openai.com/chatgpt/pricing/",
    plans: [
      { id: "free", name: "Free", price: 0, billing: "flat" },
      { id: "plus", name: "Plus", price: 20, billing: "per_seat" },
      { id: "pro", name: "Pro", price: 200, billing: "per_seat" },
      { id: "team", name: "Business", price: 25, billing: "per_seat" },
      { id: "enterprise", name: "Enterprise", price: 0, billing: "flat" }, // custom
    ],
  },
  anthropic_api: {
    id: "anthropic_api",
    vendor: "Anthropic",
    name: "Anthropic API (direct)",
    category: "api_direct",
    strengths: ["coding", "writing", "research", "data", "mixed"],
    pricingUrl: "https://www.anthropic.com/pricing#api",
    plans: [
      // Usage-priced. The "price" field stays 0; engine estimates from seats/monthly spend.
      {
        id: "claude_sonnet",
        name: "Claude Sonnet 4.5 (API)",
        price: 0,
        billing: "usage",
        inputPer1M: 3,
        outputPer1M: 15,
      },
      {
        id: "claude_opus",
        name: "Claude Opus 4.1 (API)",
        price: 0,
        billing: "usage",
        inputPer1M: 15,
        outputPer1M: 75,
      },
      {
        id: "claude_haiku",
        name: "Claude Haiku 4.5 (API)",
        price: 0,
        billing: "usage",
        inputPer1M: 1,
        outputPer1M: 5,
      },
    ],
  },
  openai_api: {
    id: "openai_api",
    vendor: "OpenAI",
    name: "OpenAI API (direct)",
    category: "api_direct",
    strengths: ["coding", "writing", "research", "data", "mixed"],
    pricingUrl: "https://platform.openai.com/docs/pricing",
    plans: [
      // GPT-4.1 is intentionally omitted: as of 2026-07-17 the official OpenAI
      // pricing page did not surface a standalone GPT-4.1 text-generation price
      // row (only gpt-4.1-mini appeared in a web-search billing note). Per the
      // brief's "every number must trace to a source" rule, an unverified price
      // is not included. See PRICING_DATA.md.
      {
        id: "gpt_4o",
        name: "GPT-4o (API)",
        price: 0,
        billing: "usage",
        inputPer1M: 2.5,
        outputPer1M: 10,
      },
      {
        id: "o3",
        name: "o3 (API)",
        price: 0,
        billing: "usage",
        inputPer1M: 5,
        outputPer1M: 20,
      },
    ],
  },
  gemini: {
    id: "gemini",
    vendor: "Google",
    name: "Gemini",
    category: "chat_pro",
    strengths: ["coding", "writing", "data", "research", "mixed"],
    pricingUrl: "https://gemini.google/subscriptions/",
    plans: [
      { id: "free", name: "Free", price: 0, billing: "flat" },
      { id: "pro", name: "Pro", price: 19.99, billing: "per_seat" },
      { id: "ultra", name: "Ultra", price: 200, billing: "per_seat" },
      {
        id: "api_pro",
        name: "Gemini 2.5 Pro (API)",
        price: 0,
        billing: "usage",
        inputPer1M: 1.25,
        outputPer1M: 10,
      },
    ],
  },
  windsurf: {
    id: "windsurf",
    vendor: "Codeium",
    name: "Windsurf",
    category: "code_editor",
    strengths: ["coding", "mixed"],
    pricingUrl: "https://windsurf.com/pricing",
    plans: [
      { id: "free", name: "Free", price: 0, billing: "flat" },
      { id: "pro", name: "Pro", price: 20, billing: "per_seat" },
      // Windsurf Teams = $80/mo flat base + $40 per developer seat (official: windsurf.com/pricing).
      { id: "teams", name: "Teams", price: 40, billing: "per_seat", basePrice: 80 },
    ],
  },
} as const satisfies Record<string, Tool>;

export type ToolId = keyof typeof PRICING;

export const TOOLS: Tool[] = Object.values(PRICING);

export function getTool(id: string): Tool | undefined {
  return PRICING[id as ToolId];
}

export function getPlan(toolId: string, planId: string): Plan | undefined {
  return getTool(toolId)?.plans.find((p) => p.id === planId);
}

/** Total monthly $ for a plan at a given seat count — the single source of truth used by
 * both the audit engine and the spend form so they always agree. Usage plans return 0
 * (the user enters their actual API bill). Per-seat plans add any flat basePrice once. */
export function monthlyForPlan(plan: Plan | undefined, seats: number): number {
  if (!plan) return 0;
  if (plan.billing === "usage") return 0;
  if (plan.billing === "per_seat") {
    const seatCount = Math.max(seats, 1);
    return round2((plan.basePrice ?? 0) + plan.price * seatCount);
  }
  return plan.price; // flat
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
