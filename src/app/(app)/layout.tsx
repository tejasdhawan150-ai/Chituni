import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { MobileNav, Sidebar } from "@/components/app/app-nav";
import { UserMenu } from "@/components/app/user-menu";
import { PLANS } from "@/config/pricing";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const sub = await getRepository().getSubscription(user.id);
  const footer = (
    <div className="space-y-3">
      {sub.plan === "free" && (
        <div className="rounded-xl border bg-card p-3">
          <p className="text-sm font-medium">Upgrade to Pro</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Unlimited tailoring, all templates & DOCX export.</p>
          <Link href="/settings/billing" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
            See plans →
          </Link>
        </div>
      )}
      <UserMenu name={user.name} email={user.email} plan={PLANS[sub.plan].name} />
    </div>
  );
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar footer={footer} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav footer={footer} />
        {user.isDemo && (
          <div className="border-b bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
            Demo mode — sample data in memory. Configure Supabase in <code className="font-mono">.env.local</code> to enable real accounts.
          </div>
        )}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
