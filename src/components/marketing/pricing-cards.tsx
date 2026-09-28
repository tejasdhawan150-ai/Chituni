import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_LIST, planPrice, DEFAULT_CURRENCY, type Currency, type PlanId } from "@/config/pricing";
import { cn } from "@/lib/utils";

export function PricingCards({ currency = DEFAULT_CURRENCY, currentPlan, renderCta }: { currency?: Currency; currentPlan?: PlanId; renderCta?: (planId: PlanId) => React.ReactNode }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {PLAN_LIST.map((p) => {
        const price = planPrice(p, currency);
        return (
          <div key={p.id} className={cn("relative flex flex-col rounded-2xl border bg-card p-7", p.featured && "border-foreground/80 shadow-[0_20px_60px_-24px_rgba(30,27,75,0.35)]")}>
            {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-foreground px-3 py-0.5 text-xs font-medium text-background">Most popular</span>}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-semibold tracking-tight">{price}</span>
              {p.id !== "free" && <span className="text-sm text-muted-foreground">/month</span>}
            </div>
            <ul className="mt-6 flex-1 space-y-2.5">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {renderCta ? (
                renderCta(p.id)
              ) : (
                <Button className="w-full" size="lg" variant={p.featured ? "dark" : "outline"} asChild disabled={currentPlan === p.id}>
                  <Link href={p.id === "free" ? "/signup" : `/signup?plan=${p.id}`}>{p.cta}</Link>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
