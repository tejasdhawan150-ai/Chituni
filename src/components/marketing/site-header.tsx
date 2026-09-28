"use client";
import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/templates", label: "Templates" },
  { href: "/mba-resume-builder", label: "For MBAs" },
  { href: "/ats-resume-checker", label: "ATS Checker" },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 w-full transition-all", scrolled ? "border-b bg-background/80 backdrop-blur-xl" : "bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="dark" size="sm" asChild>
            <Link href="/signup">Build My Resume</Link>
          </Button>
        </div>
        <button className="rounded-md p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-background px-5 pb-5 md:hidden">
          <nav className="flex flex-col py-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-2.5 text-[15px]">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button variant="dark" className="flex-1" asChild>
              <Link href="/signup">Build My Resume</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
