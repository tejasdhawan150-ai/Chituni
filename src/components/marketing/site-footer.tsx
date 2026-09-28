import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { INTENT_PAGES, ROLE_PAGES } from "@/lib/seo/pages";
import { MBA_GUIDES } from "@/config/mba";

export function SiteFooter() {
  const cols = [
    {
      title: "Product",
      links: [
        { href: "/#how-it-works", label: "How it works" },
        { href: "/templates", label: "Resume templates" },
        { href: "/pricing", label: "Pricing" },
        { href: "/ats-resume-checker", label: "ATS resume checker" },
        { href: "/signup", label: "Get started" },
      ],
    },
    { title: "Resume builders", links: ROLE_PAGES.map((p) => ({ href: p.path, label: p.h1.replace("Resume builder for ", "For ") })) },
    { title: "MBA guides", links: MBA_GUIDES.map((g) => ({ href: `/mba-resume/${g.slug}`, label: `${g.name} MBA resume` })) },
    { title: "Tools", links: INTENT_PAGES.map((p) => ({ href: p.path, label: p.eyebrow.replace(/^./, (c) => c.toUpperCase()) })) },
  ];
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.tagline}</p>
            <p className="max-w-xs text-xs text-muted-foreground">ATS scores are internal matching estimates, not a guarantee of passing any employer&apos;s system.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-3 text-sm font-medium">{c.title}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
