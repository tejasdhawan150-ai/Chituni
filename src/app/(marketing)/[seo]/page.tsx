import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INTENT_PAGES, getIntentPage } from "@/lib/seo/pages";
import { SeoLanding } from "@/components/marketing/seo-landing";

export const dynamicParams = false;

export function generateStaticParams() {
  return INTENT_PAGES.map((p) => ({ seo: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ seo: string }> }): Promise<Metadata> {
  const page = getIntentPage((await params).seo);
  if (!page) return {};
  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: page.path },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: page.path },
  };
}

export default async function IntentPage({ params }: { params: Promise<{ seo: string }> }) {
  const page = getIntentPage((await params).seo);
  if (!page) notFound();
  return <SeoLanding page={page} crumbs={[{ name: "Home", path: "/" }, { name: page.eyebrow.replace(/^./, (c) => c.toUpperCase()), path: page.path }]} />;
}
