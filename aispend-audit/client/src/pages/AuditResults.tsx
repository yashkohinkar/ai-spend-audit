import { useLocation } from "wouter";
import { Link } from "wouter";
import { useAudit } from "@/hooks/use-audit";
import { AuditResultsView } from "@/components/AuditResultsView";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditResults({ params }: { params: { shareId: string } }) {
  const [, navigate] = useLocation();
  const { data, loading, error } = useAudit(params.shareId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-bold tracking-tight">SpendScope</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          New audit
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20">
        {loading && !data ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : data ? (
          <AuditResultsView
            result={data.result}
            shareId={params.shareId}
            useCase={data.useCase}
            teamSize={data.teamSize}
          />
        ) : (
          <div className="rounded-xl border border-border/60 bg-white p-8 text-center dark:bg-slate-900">
            <h2 className="text-lg font-semibold">We couldn't find that audit</h2>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Run a new audit
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
