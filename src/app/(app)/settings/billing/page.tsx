import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { DEFAULT_CURRENCY, PLANS, type Currency } from "@/config/pricing";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { CheckoutButton, ManageBillingButton } from "@/components/career/billing-actions";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const user = await requireUser();
  const repo = getRepository();
  const sub = await repo.getSubscription(user.id);
  const { success } = await searchParams;
  const currency: Currency = sub.currency === "USD" ? "USD" : DEFAULT_CURRENCY;
  const plan = PLANS[sub.plan];
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
  const [analysesUsed, resumes] = await Promise.all([repo.countUsageSince(user.id, "job_analysis", monthStart), repo.countResumes(user.id)]);
  const lim = (n: number) => (Number.isFinite(n) ? n : "Unlimited");

  return (
    <PageContainer>
      <PageHeader title="Billing" description="Manage your plan and usage." className="mb-8" actions={sub.stripeCustomerId ? <ManageBillingButton /> : undefined} />
      {success && <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Payment received — your plan will update in a few seconds.</div>}
      <Card className="mb-10 grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground">Current plan</div>
          <div className="mt-1 flex items-center gap-2 text-xl font-semibold">
            {plan.name} <Badge variant={sub.plan === "free" ? "muted" : "success"} className="capitalize">{sub.status === "none" ? "free" : sub.status}</Badge>
          </div>
          {sub.currentPeriodEnd && <div className="mt-1 text-xs text-muted-foreground">Renews {formatDate(sub.currentPeriodEnd)}</div>}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Job analyses this month</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            {analysesUsed} <span className="text-sm font-normal text-muted-foreground">/ {lim(plan.limits.jobAnalysesPerMonth)}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Resumes</div>
          <div className="mt-1 text-xl font-semibold tabular-nums">
            {resumes} <span className="text-sm font-normal text-muted-foreground">/ {lim(plan.limits.resumes)}</span>
          </div>
        </div>
      </Card>
      <PricingCards currency={currency} currentPlan={sub.plan} renderCta={(id) => <CheckoutButton plan={id} currency={currency} current={sub.plan} label={PLANS[id].cta} featured={PLANS[id].featured} />} />
    </PageContainer>
  );
}
