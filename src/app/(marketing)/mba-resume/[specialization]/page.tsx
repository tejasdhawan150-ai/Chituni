import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Lightbulb } from "lucide-react";
import { MBA_GUIDES, getGuide } from "@/config/mba";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/marketing/faq";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { siteConfig } from "@/config/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return MBA_GUIDES.map((g) => ({ specialization: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ specialization: string }> }): Promise<Metadata> {
  const g = getGuide((await params).specialization);
  if (!g) return {};
  const title = `${g.name} MBA Resume — Keywords, Examples & Template | DreamJobResume`;
  const description = `How to write an MBA ${g.name} resume: the keywords recruiters screen for (${g.keywords.slice(0, 4).join(", ")}), example bullets and tips. Tailor yours to any job description.`;
  return { title: { absolute: title }, description, alternates: { canonical: `/mba-resume/${g.slug}` } };
}

export default async function MbaGuidePage({ params }: { params: Promise<{ specialization: string }> }) {
  const g = getGuide((await params).specialization);
  if (!g) notFound();
  const faqs = [
    {
      q: `What should an MBA ${g.name} resume highlight?`,
      a: `Recruiters for ${g.roles.slice(0, 3).join(", ")} roles look for ${g.keywords.slice(0, 5).join(", ")}. Show these through real, outcome-focused achievements.`,
    },
    { q: `Which tools should a ${g.name} MBA list?`, a: `Commonly requested tools include ${g.tools.join(", ")}. List only those you've actually used.` },
    {
      q: "Will DreamJobResume add these keywords automatically?",
      a: "Only where your experience already supports them. Missing keywords are shown as suggestions for you to decide on — we never add skills you don't have.",
    },
  ];
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteConfig.url, [
          { name: "Home", path: "/" },
          { name: "MBA resume builder", path: "/mba-resume-builder" },
          { name: `${g.name} MBA resume`, path: `/mba-resume/${g.slug}` },
        ])}
      />
      <section className="mx-auto max-w-4xl px-5 pb-10 pt-16 text-center sm:pt-20">
        <p className="text-sm font-medium text-primary">MBA resume guide</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">How to write a {g.name} MBA resume</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Keywords, example bullets and tips for {g.roles.slice(0, 3).join(", ")} and similar roles — then tailor your resume to each job description in minutes.
        </p>
        <Button size="xl" variant="dark" className="mt-8" asChild>
          <Link href="/signup">
            Build My {g.name} Resume <ArrowRight />
          </Link>
        </Button>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Target roles</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {g.roles.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Keywords to show (truthfully)</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {g.keywords.map((k) => (
              <span key={k} className="rounded-md bg-accent px-2.5 py-1 text-sm text-accent-foreground">
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Tools recruiters ask for</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {g.tools.map((k) => (
              <span key={k} className="rounded-md border px-2.5 py-1 text-sm">
                {k}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Lightbulb className="size-4 text-amber-500" /> Tips
          </h2>
          <ul className="mt-4 space-y-3">
            {g.tips.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Example bullets</h2>
          <p className="mt-1 text-sm text-muted-foreground">Adapt the pattern — use your own real numbers.</p>
          <ul className="mt-4 space-y-3">
            {g.sampleBullets.map((b) => (
              <li key={b} className="rounded-lg bg-muted/50 p-3 text-sm">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FaqSection faqs={faqs} />

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-sm font-medium text-muted-foreground">Other MBA specializations</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MBA_GUIDES.filter((x) => x.slug !== g.slug).map((x) => (
            <Link key={x.slug} href={`/mba-resume/${x.slug}`} className="rounded-full border bg-card px-3.5 py-1.5 text-sm hover:border-foreground/30">
              {x.name} MBA resume
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
