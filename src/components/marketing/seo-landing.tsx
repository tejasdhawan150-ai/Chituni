import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqSection } from "./faq";
import { JsonLd, breadcrumbJsonLd } from "./json-ld";
import { seoLabel, type SeoPage } from "@/lib/seo/pages";
import { siteConfig } from "@/config/site";
import { HeroDemo } from "./hero-demo";

export function SeoLanding({ page, crumbs }: { page: SeoPage; crumbs: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteConfig.url, crumbs)} />
      <section className="relative overflow-hidden">
        <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto max-w-4xl px-5 pb-12 pt-16 text-center sm:pt-20">
          <nav aria-label="Breadcrumb" className="mb-6 flex justify-center gap-1.5 text-xs text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={c.path} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {i < crumbs.length - 1 ? (
                  <Link href={c.path} className="hover:text-foreground">
                    {c.name}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.name}</span>
                )}
              </span>
            ))}
          </nav>
          <p className="text-sm font-medium capitalize text-primary">{page.eyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{page.h1}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">{page.intro}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="xl" variant="dark" asChild>
              <Link href="/signup">
                Build My Resume — Free <ArrowRight />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/signup?next=/tailor">Tailor My Resume</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {page.benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold">{b.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {(page.keywords || page.sampleBullets) && (
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-2">
          {page.keywords && (
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold">Keywords recruiters screen for</h2>
              <p className="mt-1 text-sm text-muted-foreground">Include these only where they truthfully describe your experience.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {page.keywords.map((k) => (
                  <span key={k} className="rounded-md bg-accent px-2.5 py-1 text-sm text-accent-foreground">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {page.sampleBullets && (
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="font-semibold">Example achievement bullets</h2>
              <p className="mt-1 text-sm text-muted-foreground">Patterns to adapt with your own real results.</p>
              <ul className="mt-4 space-y-3">
                {page.sampleBullets.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight">See it tailor a resume in seconds</h2>
        <HeroDemo />
      </section>

      <FaqSection faqs={page.faqs} />

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-sm font-medium text-muted-foreground">Related</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {page.related.map((r) => (
            <Link key={r} href={r} className="rounded-full border bg-card px-3.5 py-1.5 text-sm transition hover:border-foreground/30">
              {seoLabel(r)}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
