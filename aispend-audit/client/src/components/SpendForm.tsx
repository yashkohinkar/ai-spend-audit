import { usePersistentState } from "@/hooks/use-persistent-state";
import { TOOLS, USE_CASES } from "@/lib/tools";
import { monthlyForPlan } from "@shared/pricing";
import { apiRequest } from "@/lib/queryClient";
import type { UseCase, AuditInput } from "@shared/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface ToolEntry {
  uid: string; // local row id
  toolId: string;
  planId: string;
  monthlySpend: string;
  seats: string;
}

interface FormState {
  teamSize: string;
  useCase: UseCase;
  entries: ToolEntry[];
}

const STORAGE_KEY = "aispend:form:v2";

const initialTeamSize = 5;
const empty: FormState = {
  teamSize: String(initialTeamSize),
  useCase: "mixed",
  entries: [
    // Cursor Pro, 5 seats → $100/mo total (20 × 5). Spend is the TOTAL, not per-seat.
    { uid: "r1", toolId: "cursor", planId: "pro", monthlySpend: String(20 * initialTeamSize), seats: String(initialTeamSize) },
  ],
};

let uidCounter = 100;
const nextUid = () => `r${uidCounter++}`;

export function SpendForm({ onAudited }: { onAudited: (shareId: string) => void }) {
  const [form, setForm] = usePersistentState<FormState>(STORAGE_KEY, empty);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const addEntry = () => {
    const firstUnused = TOOLS.find((t) => !form.entries.some((e) => e.toolId === t.id));
    const tool = firstUnused ?? TOOLS[0];
    const firstPaid = tool.plans.find((p) => p.price > 0) ?? tool.plans[0];
    const seats = Number(form.teamSize) || 1;
    setForm((f) => ({
      ...f,
      entries: [
        ...f.entries,
        {
          uid: nextUid(),
          toolId: tool.id,
          planId: firstPaid?.id ?? "",
          monthlySpend: String(monthlyForPlan(firstPaid, seats)),
          seats: String(seats),
        },
      ],
    }));
  };

  const removeEntry = (uid: string) =>
    setForm((f) => ({ ...f, entries: f.entries.filter((e) => e.uid !== uid) }));

  const updateEntry = (uid: string, patch: Partial<ToolEntry>) =>
    setForm((f) => ({
      ...f,
      entries: f.entries.map((e) => (e.uid === uid ? { ...e, ...patch } : e)),
    }));

  const onToolChange = (uid: string, toolId: string) => {
    const tool = TOOLS.find((t) => t.id === toolId);
    const firstPaid = tool?.plans.find((p) => p.price > 0) ?? tool?.plans[0];
    // find this row's current seats to seed the total spend
    const row = form.entries.find((e) => e.uid === uid);
    const seats = Number(row?.seats) || 1;
    updateEntry(uid, {
      toolId,
      planId: firstPaid?.id ?? "",
      monthlySpend: String(monthlyForPlan(firstPaid, seats)),
    });
  };

  // When the plan changes, re-seed the total spend from plan × current seats so
  // the default number always matches the engine's own pricing. The user can still
  // override it with their real bill.
  const onPlanChange = (uid: string, planId: string) => {
    const row = form.entries.find((e) => e.uid === uid);
    const tool = TOOLS.find((t) => t.id === row?.toolId);
    const plan = tool?.plans.find((p) => p.id === planId);
    const seats = Number(row?.seats) || 1;
    updateEntry(uid, { planId, monthlySpend: String(monthlyForPlan(plan, seats)) });
  };

  const submit = async () => {
    if (form.entries.length === 0) {
      toast({ title: "Add at least one tool", description: "Pick an AI tool you pay for to audit.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const input: AuditInput = {
        teamSize: Number(form.teamSize) || 1,
        useCase: form.useCase,
        tools: form.entries.map((e) => ({
          toolId: e.toolId,
          planId: e.planId,
          monthlySpend: Number(e.monthlySpend) || 0,
          seats: Number(e.seats) || 1,
        })),
      };
      const res = await apiRequest("POST", "/api/audit", input);
      const data = await res.json();
      // Cache the result locally so the results page renders instantly.
      try {
        localStorage.setItem(`audit:${data.shareId}`, JSON.stringify(data.result));
      } catch {
        /* ignore */
      }
      onAudited(data.shareId);
    } catch (e) {
      toast({ title: "Something went wrong", description: String(e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Your AI stack</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add every AI tool your team pays for. We audit each one against current pricing.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team context */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="teamSize">Team size</Label>
            <Input
              id="teamSize"
              type="number"
              min={1}
              value={form.teamSize}
              onChange={(e) => setForm((f) => ({ ...f, teamSize: e.target.value }))}
              data-testid="input-team-size"
            />
          </div>
          <div className="space-y-2">
            <Label>Primary use case</Label>
            <Select
              value={form.useCase}
              onValueChange={(v) => setForm((f) => ({ ...f, useCase: v as UseCase }))}
            >
              <SelectTrigger data-testid="select-use-case">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USE_CASES.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.label} — {u.hint}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tool entries */}
        <div className="space-y-3">
          {form.entries.map((e, i) => {
            const tool = TOOLS.find((t) => t.id === e.toolId);
            return (
              <div
                key={e.uid}
                className="grid grid-cols-1 gap-3 rounded-lg border border-border/60 p-3 sm:grid-cols-[1.4fr_1.2fr_1fr_0.8fr_auto]"
                data-testid={`row-tool-${i}`}
              >
                <Select value={e.toolId} onValueChange={(v) => onToolChange(e.uid, v)}>
                  <SelectTrigger data-testid={`select-tool-${i}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOOLS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={e.planId}
                  onValueChange={(v) => onPlanChange(e.uid, v)}
                  disabled={!tool}
                >
                  <SelectTrigger data-testid={`select-plan-${i}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tool?.plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.price > 0 ? ` · $${p.price}${p.billing === "per_seat" ? "/seat" : ""}` : p.billing === "usage" ? " · usage" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Spend $/mo (total)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={e.monthlySpend}
                    onChange={(ev) => updateEntry(e.uid, { monthlySpend: ev.target.value })}
                    data-testid={`input-spend-${i}`}
                  />
                  <p className="text-[11px] text-muted-foreground/80">Total for this tool, all seats.</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Seats</Label>
                  <Input
                    type="number"
                    min={1}
                    value={e.seats}
                    onChange={(ev) => updateEntry(e.uid, { seats: ev.target.value })}
                    data-testid={`input-seats-${i}`}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(e.uid)}
                  aria-label="Remove tool"
                  className="self-end"
                  data-testid={`button-remove-${i}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <Button variant="outline" onClick={addEntry} data-testid="button-add-tool">
          <Plus className="mr-2 h-4 w-4" /> Add another tool
        </Button>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Est. current spend:{" "}
            <span className="font-semibold text-foreground">
              ${form.entries.reduce((s, e) => s + (Number(e.monthlySpend) || 0), 0)}/mo
            </span>
          </p>
          <Button onClick={submit} disabled={submitting} size="lg" data-testid="button-audit">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Auditing…
              </>
            ) : (
              "Audit my spend →"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
