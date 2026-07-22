import { useLocation } from "wouter";
import { SpendForm } from "@/components/SpendForm";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant audit",
    body: "Enter your stack. Get a per-tool breakdown of overspending in seconds — no login.",
  },
  {
    icon: BarChart3,
    title: "Defensible numbers",
    body: "Every recommendation traces to current official vendor pricing. A finance lead would agree.",
  },
  {
    icon: ShieldCheck,
    title: "Email after value",
    body: "See your savings first. We only ask for your email to save the report — never before.",
  },
];

export default function Home() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-bold tracking-tight">SpendScope</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById("audit")?.scrollIntoView({ behavior: "smooth" })}
        >
          How it works
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20">
        {/* Hero */}
        <section className="py-10 text-center sm:py-16">
          <span className="inline-flex items-center rounded-full border border-border/60 bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm dark:bg-slate-900">
            Free · No login · 60 seconds
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Find out where your team is{" "}
            <span className="text-primary">overspending on AI tools</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Most startups pay for AI tools they don't fully use. Enter your stack —
            we'll show the downgrades, switches, and overlaps that save real money.
          </p>
        </section>

        {/* Form */}
        <section id="audit" className="mx-auto max-w-2xl">
          <SpendForm onAudited={(shareId) => navigate(`/audit/${shareId}`)} />
        </section>

        {/* Features */}
        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border/60 bg-white p-5 dark:bg-slate-900">
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <footer className="mt-20 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
          Built for the Techvruk web dev assessment. Pricing verified weekly in PRICING_DATA.md.
        </footer>
      </main>
    </div>
  );
}
