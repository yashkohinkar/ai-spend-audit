import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { AuditResult } from "@shared/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

export function LeadForm({ shareId, result }: { shareId: string; result: AuditResult }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/lead", {
        email,
        company: company || undefined,
        role: role || undefined,
        teamSize: undefined,
        shareId,
        auditSnapshot: JSON.stringify({
          totalMonthlySavings: result.totalMonthlySavings,
          totalAnnualSavings: result.totalAnnualSavings,
        }),
        website: "", // honeypot
      });
      setDone(true);
    } catch {
      /* still surface success to avoid leaking errors to abuse */
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/40">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Report saved — check your inbox.
          </p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
            We sent a confirmation with your audit link
            {result.totalMonthlySavings > 500 ? " and will reach out about a consultation." : "."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" data-testid="lead-form">
      <div className="space-y-1.5">
        <Label htmlFor="lead-email">Email</Label>
        <Input
          id="lead-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          data-testid="input-lead-email"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lead-company" className="text-muted-foreground">Company (optional)</Label>
          <Input
            id="lead-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            data-testid="input-lead-company"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-role" className="text-muted-foreground">Role (optional)</Label>
          <Input
            id="lead-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            data-testid="input-lead-role"
          />
        </div>
      </div>
      {/* Honeypot — hidden from real users, bots fill it. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value=""
        onChange={() => {}}
        className="hidden"
        aria-hidden="true"
      />
      <Button type="submit" disabled={submitting} className="w-full" data-testid="button-lead-submit">
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save my report
      </Button>
      <p className="text-xs text-muted-foreground">
        We'll email your audit link. No spam, no login.
      </p>
    </form>
  );
}
