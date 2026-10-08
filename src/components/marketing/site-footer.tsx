import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";
import { ROLE_PAGES } from "@/lib/seo/pages";
import { MBA_GUIDES } from "@/config/mba";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Logo />
          <p className="text-sm text-muted-foreground">{siteConfig.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {ROLE_PAGES.map((p) => (
            <Link key={p.path} href={p.path} className="hover:text-foreground">
              {p.h1}
            </Link>
          ))}
          {MBA_GUIDES.map((g) => (
            <Link key={g.slug} href={`/mba-resume/${g.slug}`} className="hover:text-foreground">
              {g.name} MBA resume
            </Link>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Free to use.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
