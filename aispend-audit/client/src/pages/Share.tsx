import { Link } from "wouter";
import { useAudit } from "@/hooks/use-audit";
import { AuditResultsView } from "@/components/AuditResultsView";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/skeleton";

export default function Share({ params }: { params: { shareId: string } }) {
  const { data, loading, error } = useAudit(params.shareId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-bold tracking-tight">SpendScope</span>
        </Link>
        <span className="text-xs text-muted-foreground">Public audit</span>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-20">
        {loading && !data ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : data ? (
          <AuditResultsView
            result={data.result}
            shareId={params.shareId}
            useCase={data.useCase}
            teamSize={data.teamSize}
            isPublic
          />
        ) : (
          <div className="rounded-xl border border-border/60 bg-white p-8 text-center dark:bg-slate-900">
            <h2 className="text-lg font-semibold">This audit isn't available</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error ?? "It may have expired."}
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Run your own audit →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
