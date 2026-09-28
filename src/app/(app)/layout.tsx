import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { MobileNav, Sidebar } from "@/components/app/app-nav";
import { UserMenu } from "@/components/app/user-menu";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const footer = <UserMenu name={user.name} email={user.email} />;
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
