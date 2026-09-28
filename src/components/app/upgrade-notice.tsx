import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, planPrice, type PlanId } from "@/config/pricing";

export function UpgradeNotice({ plan, title, body }: { plan: PlanId; title: string; body: string }) {
  const p = PLANS[plan];
  return (
    <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Lock className="size-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
      <Button className="mt-6" variant="dark" asChild>
        <Link href="/settings/billing">
          Upgrade to {p.name} — {planPrice(p)}/month
        </Link>
      </Button>
    </div>
  );
}
