import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ROLE_PAGES, getRolePage } from "@/lib/seo/pages";
import { SeoLanding } from "@/components/marketing/seo-landing";

export const dynamicParams = false;

export function generateStaticParams() {
  return ROLE_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getRolePage((await params).slug);
  if (!page) return {};
  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical: page.path },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: page.path },
  };
}

export default async function RolePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = getRolePage((await params).slug);
  if (!page) notFound();
  return (
    <SeoLanding
      page={page}
      crumbs={[
        { name: "Home", path: "/" },
        { name: "Resume builder", path: "/ai-resume-builder" },
        { name: page.h1.replace("Resume builder for ", ""), path: page.path },
      ]}
    />
  );
}
