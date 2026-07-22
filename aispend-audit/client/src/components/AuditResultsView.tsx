import { useEffect, useState } from "react";
import type { AuditResult, ToolRecommendation } from "@shared/audit";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LeadForm } from "./LeadForm";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  CalendarClock,
} from "lucide-react";

const CATEGORY_LABEL: Record<ToolRecommendation["category"], string> = {
  consolidate: "Consolidate",
  downgrade: "Right-size plan",
  alternative: "Switch tool",
  credits: "Volume discount",
  optimal: "Already optimal",
};

const CATEGORY_TONE: Record<ToolRecommendation["category"], string> = {
  consolidate: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  downgrade: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  alternative: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  credits: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200",
  optimal: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export function AuditResultsView({
  result,
  shareId,
  useCase,
  teamSize,
  isPublic = false,
}: {
  result: AuditResult;
  shareId: string;
  useCase?: string;
  teamSize?: number;
  isPublic?: boolean;
}) {
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiRequest("POST", "/api/summary", { result, useCase, teamSize });
        const data = await res.json();
        if (active) setSummary(data.summary);
      } catch {
        /* fallback already handled server-side */
      } finally {
        if (active) setSummaryLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [result, useCase, teamSize]);

  const shareUrl = `${window.location.origin}/s/${shareId}`;
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const isOptimal = result.tier === "optimal" || result.totalMonthlySavings <= 0;
  const isHigh = result.tier === "high";

  return (
    <div className="space-y-6">
      {/* HERO */}
      <Card
        className={`overflow-hidden border-0 ${
          isOptimal
            ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white"
            : "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
        }`}
        data-testid="hero-savings"
      >
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-white/70">
                {isOptimal ? "Audit complete" : "Potential savings"}
              </p>
              {isOptimal ? (
                <p className="mt-1 text-3xl font-bold sm:text-4xl">You're spending well.</p>
              ) : (
                <p className="mt-1 text-4xl font-bold sm:text-5xl">
                  ${result.totalMonthlySavings.toLocaleString()}
                  <span className="text-xl font-medium text-white/70">/mo</span>
                </p>
              )}
              {!isOptimal && (
                <p className="mt-2 text-lg text-white/80">
                  ${result.totalAnnualSavings.toLocaleString()} per year — found across {result.tools.filter((t) => t.monthlySavings > 0).length} of {result.tools.length} tools.
                </p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs uppercase tracking-wide text-white/60">Current spend</p>
              <p className="text-2xl font-semibold">${result.totalCurrentMonthly.toLocaleString()}/mo</p>
              <p className="text-xs text-white/60">
                After fixes: ${result.totalNewMonthly.toLocaleString()}/mo
              </p>
            </div>
          </div>

          {isHigh && (
            <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">
                Your savings are significant — a Techvruk specialist can help you capture all of it.
              </p>
              <p className="mt-1 text-sm text-white/80">
                Book a free 20-minute consultation and we'll map the exact switchover.
              </p>
              <a
                href="mailto:hello@techvruk.com?subject=AI%20Spend%20Audit%20Consultation"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white/90"
                data-testid="link-consultation"
              >
                <CalendarClock className="h-4 w-4" /> Book a Techvruk consultation
              </a>
            </div>
          )}
          {isOptimal && (
            <p className="mt-4 text-sm text-white/80">
              Your plan choices match your team size and use case — no overspending detected. Still want a heads-up when new optimizations apply to your stack? Drop your email below.
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI SUMMARY */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Personalized summary</CardTitle>
          <Badge variant="secondary" className="ml-auto text-[10px]">AI-generated</Badge>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
          )}
        </CardContent>
      </Card>

      {/* PER-TOOL BREAKDOWN */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Per-tool breakdown</h2>
        <div className="space-y-3">
          {result.tools.map((t, i) => (
            <Card key={`${t.toolId}-${i}`} className="border-border/60">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{t.toolName}</span>
                    <span className="text-sm text-muted-foreground">{t.planName}</span>
                    <Badge className={CATEGORY_TONE[t.category]} variant="secondary">
                      {CATEGORY_LABEL[t.category]}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.reason}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t.recommendedAction}
                    {t.monthlySavings > 0 && (
                      <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">
                        → save ${t.monthlySavings}/mo
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="font-semibold">${t.currentMonthly}/mo</p>
                  </div>
                  {t.monthlySavings > 0 ? (
                    <>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">After</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${t.newMonthly}/mo
                        </p>
                      </div>
                    </>
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SHARE + LEAD CAPTURE */}
      {!isPublic && (
        <>
          <Separator />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Share your audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  A public link with your savings numbers — no email or company shown.
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 truncate rounded-md border border-border/60 bg-muted px-3 py-2 text-xs">
                    {shareUrl}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyShare} data-testid="button-copy-share">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isOptimal ? "Notify me on new optimizations" : "Save this report"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeadForm shareId={shareId} result={result} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {isPublic && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Find overspending in your own stack</p>
              <p className="text-sm text-muted-foreground">
                Free, no login. See where you could save in 60 seconds.
              </p>
            </div>
            <Button asChild>
              <a href="/#/">Audit my AI spend →</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
