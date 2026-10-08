import Link from "next/link";
import { ArrowRight, ClipboardPaste, Download, FileUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { FaqSection } from "@/components/marketing/faq";
import { JsonLd } from "@/components/marketing/json-ld";
import { siteConfig } from "@/config/site";

const STEPS = [
  { icon: FileUp, title: "Add your resume", body: "Upload your PDF or Word file, or paste the text." },
  { icon: ClipboardPaste, title: "Paste the job", body: "Copy the job description from LinkedIn, Naukri or any site." },
  { icon: Download, title: "Download", body: "Get a resume tailored to that job as a PDF or Word file." },
];

const FAQS = [
  { q: "Is it free?", a: "Yes. It's completely free and you don't need to sign up." },
  {
    q: "Will it make up experience?",
    a: "Never. It only rewords and reorders what's already in your resume. If the job asks for something you don't have, we tell you — we don't add it.",
  },
  { q: "Is my resume saved anywhere?", a: "Your resume stays in your own browser. We don't keep a copy on our servers." },
  { q: "What does the match score mean?", a: "It's our estimate of how well your resume matches the job's keywords and skills. It's a helpful guide, not a guarantee." },
];

export default function HomePage() {
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
          offers: { "@type": "Offer", price: 0, priceCurrency: "INR" },
        }}
      />

      <section className="relative overflow-hidden">
        <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
              Your Resume Should <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Match the Job.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
              Paste any job description and get your resume tailored to it in seconds. Free, no sign-up.
            </p>
            <Button size="xl" variant="dark" className="mt-8" asChild>
              <Link href="/build">
                Build My Resume — Free <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <HeroDemo />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border bg-card p-6 text-center">
              <div className="mx-auto grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="size-5" />
              </div>
              <div className="mt-4 text-xs font-medium text-muted-foreground">Step {i + 1}</div>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
          We only improve the wording of your real experience — we never invent anything.
        </p>
      </section>

      <FaqSection faqs={FAQS} title="Questions" />

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-foreground px-8 py-14 text-center text-background">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">Ready for your next application?</h2>
          <Button size="xl" className="mt-8 bg-background text-foreground hover:bg-background/90" asChild>
            <Link href="/build">
              Build My Resume <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
