import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, ClipboardPaste, FileText, Layers, Mail, ShieldCheck, Sparkles, Target, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqSection } from "@/components/marketing/faq";
import { JsonLd } from "@/components/marketing/json-ld";
import { TemplateThumb } from "@/components/resume/template-thumb";
import { getTemplate } from "@/lib/resume/templates";
import { DEMO_PROFILE } from "@/lib/demo/samples";
import { profileToContent } from "@/lib/resume/schema";
import { MBA_GUIDES } from "@/config/mba";
import { siteConfig } from "@/config/site";
import { PLANS } from "@/config/pricing";

const STEPS = [
  { icon: ClipboardPaste, title: "Paste the job description", body: "Copy any job from LinkedIn, Indeed, Naukri or a careers page and paste it in." },
  { icon: Sparkles, title: "AI analyzes the role", body: "We extract the title, seniority, required skills, keywords and responsibilities." },
  { icon: FileText, title: "Get a tailored resume", body: "Your real experience is rewritten and reordered for the role. You approve every change." },
  { icon: Target, title: "Check your ATS match", body: "See your match score before and after, plus the exact keywords you're missing." },
];

const FEATURES = [
  { icon: BarChart3, title: "ATS compatibility score", body: "Keywords, experience relevance, skills, formatting and education — scored separately so you know what to fix." },
  { icon: ShieldCheck, title: "Never fabricates", body: "Guardrails reject any suggestion that invents jobs, titles, degrees, skills or metrics. Your story, told better." },
  { icon: Layers, title: "13 ATS-safe templates", body: "Executive, Consulting, Finance, Modern, Minimal and ATS styles. Switch anytime without losing content." },
  { icon: Briefcase, title: "Application tracker", body: "Track Saved → Applied → Interview → Offer and link the exact resume you sent to each company." },
  { icon: Mail, title: "Cover letters", body: "Generate a tailored cover letter from the same job description — grounded only in your real experience." },
  { icon: UserRound, title: "LinkedIn optimization", body: "Paste your headline and About section and get a keyword-rich rewrite recruiters can find." },
];

const HOME_FAQS = [
  {
    q: "How is DreamJobResume different from a resume template site?",
    a: "Template sites give you a blank layout. DreamJobResume starts from the job: it analyzes the job description, compares it to your profile, and tailors your resume for that specific role — with an ATS match score before and after.",
  },
  {
    q: "Will the AI make up experience to match the job?",
    a: "No — and this is a hard rule. The AI can only rephrase and reorder facts from your profile. If the job requires a skill you don't have, we show it as 'Missing skill — consider adding this only if you genuinely have experience with it.'",
  },
  {
    q: "Is the ATS score a guarantee?",
    a: "No. It is DreamJobResume's internal matching estimate. It's a useful guide to alignment, but no tool can guarantee how a particular employer's ATS will rank your resume.",
  },
  {
    q: "Can I paste a LinkedIn job URL instead of the description?",
    a: "For now, please copy and paste the job description text. We don't scrape LinkedIn or other job boards without authorization — pasting keeps you in control and works with any site.",
  },
  {
    q: "I already have a resume. Do I need to start over?",
    a: "No. Upload your PDF or DOCX and we'll extract your experience, education and skills into your profile for you to review.",
  },
  {
    q: "Is it only for MBA graduates?",
    a: "It's built with MBA candidates in mind, but works for anyone with 0–7 years of experience applying to business roles: consulting, finance, marketing, HR, operations, product, sales and analytics.",
  },
];

export default function HomePage() {
  const preview = profileToContent(DEMO_PROFILE);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: siteConfig.name,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: siteConfig.description,
          url: siteConfig.url,
          offers: Object.values(PLANS).map((p) => ({ "@type": "Offer", name: p.name, price: (p.monthly.INR ?? 0) / 100, priceCurrency: "INR" })),
        }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10" />
        <div className="pointer-events-none absolute left-1/2 top-[-12rem] -z-10 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.85_0.08_268/0.45),transparent)]" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Link href="/mba-resume-builder" className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground">
              <span className="rounded-full bg-accent px-1.5 py-px font-medium text-accent-foreground">New</span>
              Built for MBA graduates & early-career professionals
              <ArrowRight className="size-3" />
            </Link>
            <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
              Your Resume Should
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">Match the Job.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
              Paste any job description and DreamJobResume analyzes the role, identifies the skills employers are looking for, and creates an ATS-friendly resume tailored to that position.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="xl" variant="dark" asChild>
                <Link href="/signup">
                  Build My Resume — Free <ArrowRight />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No credit card required · Your real experience only — we never fabricate</p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 text-sm text-muted-foreground md:flex-row">
          <span>Works with job descriptions from</span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-medium text-foreground/70">
            <span>LinkedIn</span>
            <span>Naukri</span>
            <span>Indeed</span>
            <span>Instahyre</span>
            <span>Wellfound</span>
            <span>Company careers pages</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-balance text-4xl font-semibold tracking-tight">Paste a job description. Get a resume tailored for that job.</h2>
          <p className="mt-4 text-muted-foreground">Found a role on LinkedIn? You&apos;re about four minutes away from a resume built for it.</p>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <s.icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ATS SCORE */}
      <section className="bg-foreground text-background">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-indigo-300">ATS analysis</p>
            <h2 className="mt-2 text-balance text-4xl font-semibold tracking-tight">Know exactly how well you match — before you apply.</h2>
            <p className="mt-4 leading-relaxed text-background/70">
              Our ATS engine scores your resume against the job across five dimensions and shows the keywords you&apos;re missing. Then tailor in one click and watch the score move.
            </p>
            <p className="mt-6 text-xs text-background/50">The score is an internal matching estimate, not a guarantee of passing a real ATS.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm text-background/60">ATS Compatibility</div>
                <div className="mt-1 text-5xl font-semibold tabular-nums">
                  92<span className="text-2xl text-background/50">/100</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300">Strong match</span>
            </div>
            <div className="mt-6 space-y-3.5">
              {[
                ["Keywords", 94],
                ["Experience relevance", 89],
                ["Skills match", 91],
                ["Formatting", 98],
                ["Education", 100],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-background/75">{k}</span>
                    <span className="tabular-nums">{v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-xs text-background/60">Missing Keywords</div>
                <div className="flex flex-wrap gap-1.5">
                  {["SQL", "Power BI"].map((k) => (
                    <span key={k} className="rounded-md bg-rose-400/15 px-2 py-0.5 font-mono text-xs text-rose-200">{k}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs text-background/60">Strong Matches</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Business Analysis", "Stakeholder Management", "Excel", "Strategy"].map((k) => (
                    <span key={k} className="rounded-md bg-emerald-400/15 px-2 py-0.5 font-mono text-xs text-emerald-200">{k}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HONEST AI */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 space-y-3 md:order-1">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Power BI</span>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Missing skill</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Missing skill — consider adding this only if you genuinely have experience with it.</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-sm">
              <div className="text-xs font-medium text-muted-foreground">Before</div>
              <p className="mt-1 text-muted-foreground line-through decoration-rose-300">Responsible for analyzing sales data for a retail client using Excel</p>
              <div className="mt-3 text-xs font-medium text-muted-foreground">After</div>
              <p className="mt-1">Analyzed sales and margin data for a retail client using Excel, identifying cost-saving opportunities</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-sm">
              <div className="text-xs font-medium text-rose-700">Blocked by guardrails</div>
              <p className="mt-1 text-rose-900/80">“Increased revenue by 40% across 12 markets” — rejected: metrics not found in your profile.</p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <p className="text-sm font-medium text-primary">Truthful by design</p>
            <h2 className="mt-2 text-balance text-4xl font-semibold tracking-tight">Better wording. Never fake experience.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Recruiters and interviewers can tell when a resume is inflated. DreamJobResume improves how your real experience reads — it never invents jobs, titles, companies, degrees, certifications, skills, achievements or metrics.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["Every suggestion is checked against your profile", "Invented numbers or names are automatically rejected", "Missing requirements are flagged, never added", "You approve each change before it's applied"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">Everything you need to apply</p>
            <h2 className="mt-2 text-balance text-4xl font-semibold tracking-tight">From job description to offer — in one place.</h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card p-7">
                <f.icon className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-primary">Templates</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight">Recruiter-approved. ATS-safe.</h2>
            <p className="mt-3 text-muted-foreground">Single-column layouts with real, selectable text. No graphics that confuse parsers.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/templates">
              Browse all templates <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
          {["consulting", "modern-professional", "classic-ats", "finance"].map((id) => {
            const t = getTemplate(id);
            return (
              <Link key={id} href="/templates" className="group">
                <TemplateThumb content={preview} template={t} className="transition group-hover:-translate-y-1 group-hover:shadow-lg" />
                <div className="mt-3 text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.bestFor.slice(0, 2).join(" · ")}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* MBA */}
      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-primary">MBA-specific guidance</p>
            <h2 className="mt-2 text-balance text-4xl font-semibold tracking-tight">Built around your specialization.</h2>
            <p className="mt-4 text-muted-foreground">Keywords, bullet patterns and template recommendations tailored to how recruiters read each MBA track.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MBA_GUIDES.map((g) => (
              <Link key={g.slug} href={`/mba-resume/${g.slug}`} className="group rounded-2xl border bg-card p-6 transition hover:border-foreground/20 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{g.name} MBA</h3>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {g.keywords.slice(0, 5).map((k) => (
                    <span key={k} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{k}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">Start free. Upgrade when you&apos;re applying seriously.</h2>
        </div>
        <PricingCards />
      </section>

      <FaqSection faqs={HOME_FAQS} />

      {/* CTA */}
      <section className="px-5 pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center text-background">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.2_268/0.5),transparent_60%)]" />
          <div className="relative">
            <h2 className="text-balance text-4xl font-semibold tracking-tight">Turn any job description into your dream resume.</h2>
            <p className="mx-auto mt-4 max-w-xl text-background/70">Your next application deserves a resume written for it.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="xl" className="bg-background text-foreground hover:bg-background/90" asChild>
                <Link href="/signup">
                  Build My Resume — Free <ArrowRight />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white/20 bg-transparent text-background hover:bg-white/10" asChild>
                <Link href="/signup?next=/tailor">Tailor My Resume</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
