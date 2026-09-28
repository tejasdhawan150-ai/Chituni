import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TemplateThumb } from "@/components/resume/template-thumb";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/resume/templates";
import { DEMO_PROFILE } from "@/lib/demo/samples";
import { profileToContent } from "@/lib/resume/schema";

export const metadata: Metadata = {
  title: "ATS-Friendly Resume Templates — Executive, Consulting, Finance & More",
  description: "13 ATS-safe resume templates for MBA graduates and early-career professionals: Classic ATS, Consulting, Executive, Finance, Marketing, Modern, Minimal and more.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  const content = profileToContent(DEMO_PROFILE);
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:pt-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance text-5xl font-semibold tracking-tight">Resume templates that recruiters — and ATS — can read</h1>
        <p className="mt-4 text-lg text-muted-foreground">Every template is single-column with real text and standard headings. Switch anytime without losing content.</p>
      </div>
      {TEMPLATE_CATEGORIES.map((cat) => (
        <div key={cat.id} className="mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">{cat.label}</h2>
            <p className="text-sm text-muted-foreground">{cat.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {TEMPLATES.filter((t) => t.category === cat.id).map((t) => (
              <div key={t.id}>
                <TemplateThumb content={content} template={t} />
                <div className="mt-3 text-sm font-medium">{t.name}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-16 text-center">
        <Button size="xl" variant="dark" asChild>
          <Link href="/signup">Build My Resume</Link>
        </Button>
      </div>
    </section>
  );
}
