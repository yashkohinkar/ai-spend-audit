import { TOOLS } from "@shared/pricing";
import type { Tool } from "@shared/pricing";
import type { UseCase } from "@shared/audit";

export const USE_CASES: { id: UseCase; label: string; hint: string }[] = [
  { id: "coding", label: "Coding", hint: "Mostly writing/reviewing code" },
  { id: "writing", label: "Writing", hint: "Docs, marketing, content" },
  { id: "data", label: "Data", hint: "Analysis, spreadsheets, SQL" },
  { id: "research", label: "Research", hint: "Lookups, synthesis, summarizing" },
  { id: "mixed", label: "Mixed", hint: "A bit of everything" },
];

export { TOOLS };
export type { Tool };
