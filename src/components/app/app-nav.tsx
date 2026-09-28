"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, CreditCard, FileText, LayoutDashboard, Mail, Menu, Sparkles, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

function LinkedInGlyph({ className }: { className?: string }) {
  return <span className={cn("grid size-4 place-items-center rounded-[4px] border border-current text-[8px] font-bold leading-none", className)}>in</span>;
}

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tailor", label: "Tailor for a Job", icon: Sparkles },
  { href: "/resumes", label: "My Resumes", icon: FileText },
  { href: "/applications", label: "Job Tracker", icon: Briefcase },
  { href: "/cover-letter", label: "Cover Letters", icon: Mail },
  { href: "/linkedin", label: "LinkedIn Optimizer", icon: LinkedInGlyph },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              active ? "bg-card font-medium text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ footer }: { footer: React.ReactNode }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-muted/30 px-3 py-4 lg:flex">
      <div className="px-2 pb-6">
        <Logo href="/dashboard" />
      </div>
      <NavLinks />
      <div className="mt-auto">{footer}</div>
    </aside>
  );
}

export function MobileNav({ footer }: { footer: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="lg:hidden">
      <div className="flex h-14 items-center justify-between border-b bg-background px-4">
        <Logo href="/dashboard" />
        <button onClick={() => setOpen(true)} className="rounded-md p-2" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-72 flex-col bg-background p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Logo href="/dashboard" />
              <button onClick={() => setOpen(false)} className="rounded-md p-1.5" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto">{footer}</div>
          </div>
        </div>
      )}
    </div>
  );
}
