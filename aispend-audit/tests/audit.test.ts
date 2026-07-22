import { describe, it, expect } from "vitest";
import { audit } from "../shared/audit";
import type { AuditInput, ToolEntry } from "../shared/audit";

const entry = (toolId: string, planId: string, monthlySpend: number, seats = 1): ToolEntry => ({
  toolId,
  planId,
  monthlySpend,
  seats,
});

const run = (tools: ToolEntry[], useCase: AuditInput["useCase"] = "coding", teamSize = 5): ReturnType<typeof audit> =>
  audit({ teamSize, useCase, tools });

describe("audit engine — consolidation", () => {
  it("flags a separate Copilot seat as redundant when Cursor is already in the stack", () => {
    const result = run([entry("cursor", "pro", 20), entry("copilot", "business", 19)]);
    const copilot = result.tools.find((t) => t.toolId === "copilot")!;
    expect(copilot.category).toBe("consolidate");
    expect(copilot.newMonthly).toBe(0);
    expect(copilot.monthlySavings).toBe(19);
  });

  it("drops the weaker chat subscription when two premium chat AIs overlap", () => {
    // coding use case → keep Claude, drop ChatGPT Plus
    const result = run(
      [entry("chatgpt", "plus", 20), entry("claude", "pro", 20)],
      "coding"
    );
    const dropped = result.tools.find((t) => t.toolId === "chatgpt")!;
    expect(dropped.category).toBe("consolidate");
    expect(dropped.monthlySavings).toBe(20);
    const kept = result.tools.find((t) => t.toolId === "claude")!;
    expect(kept.category).toBe("optimal");
  });
});

describe("audit engine — plan right-sizing", () => {
  it("downgrades Claude Team to Pro for a small team", () => {
    const result = run([entry("claude", "team", 25)]);
    const r = result.tools[0];
    expect(r.category).toBe("downgrade");
    expect(r.newMonthly).toBe(20); // Pro 20 × 1 seat
    expect(r.monthlySavings).toBe(5);
  });

  it("does NOT recommend a downgrade when the same plan fits a larger team", () => {
    const result = run([entry("claude", "team", 90, 3)]); // 3 seats — within threshold
    const r = result.tools[0];
    expect(r.category).not.toBe("downgrade");
  });

  it("downgrades Gemini Ultra to Pro regardless of seats", () => {
    const result = run([entry("gemini", "ultra", 200)], "mixed");
    const r = result.tools[0];
    expect(r.category).toBe("downgrade");
    expect(r.monthlySavings).toBe(180.01);
  });

  it("accounts for Windsurf Teams' $80 base when downgrading to Pro", () => {
    // 1 seat, no user-reported spend → engine derives Teams total = $80 base + $40 = $120.
    const result = run([entry("windsurf", "teams", 0, 1)], "coding");
    const r = result.tools[0];
    expect(r.category).toBe("downgrade");
    expect(r.currentMonthly).toBe(120); // 80 + 40×1
    expect(r.newMonthly).toBe(20);      // Pro 20 × 1
    expect(r.monthlySavings).toBe(100);
  });
});

describe("audit engine — alternative tool", () => {
  it("switches Cursor Pro to GitHub Copilot Individual for pure coding", () => {
    const result = run([entry("cursor", "pro", 100, 5)], "coding"); // 5 seats × Pro $20 = $100
    const r = result.tools[0];
    expect(r.category).toBe("alternative");
    expect(r.newMonthly).toBe(50); // Copilot Individual $10 × 5
    expect(r.monthlySavings).toBe(50);
  });

  it("does NOT offer the cheaper alternative for a non-coding use case", () => {
    const result = run([entry("cursor", "pro", 100, 5)], "mixed");
    const r = result.tools[0];
    expect(r.category).toBe("optimal");
  });
});

describe("audit engine — totals & tiers", () => {
  it("classifies >$500/mo savings as the high tier", () => {
    const result = run([entry("gemini", "ultra", 600, 3)]); // 3 seats × Ultra → Pro
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
    expect(result.tier).toBe("high");
    expect(result.totalAnnualSavings).toBeCloseTo(result.totalMonthlySavings * 12, 1);
  });

  it("is honest and reports optimal/low savings when the stack already fits", () => {
    const result = run([entry("cursor", "hobby", 0), entry("copilot", "free", 0)], "coding");
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.tier).toBe("optimal");
    expect(result.tools.every((t) => t.category === "optimal")).toBe(true);
  });
});

describe("audit engine — credits (API volume discount)", () => {
  it("estimates a volume discount for high API spend but not for low spend", () => {
    const high = run([entry("openai_api", "gpt_4o", 400)], "mixed");
    const highRec = high.tools[0];
    expect(highRec.category).toBe("credits");
    expect(highRec.monthlySavings).toBeCloseTo(48, 0); // 12% of 400

    const low = run([entry("openai_api", "gpt_4o", 40)], "mixed");
    expect(low.tools[0].category).toBe("optimal");
  });
});
