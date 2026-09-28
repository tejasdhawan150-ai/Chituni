import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { ALL_SEO_PATHS } from "@/lib/seo/pages";
import { MBA_GUIDES } from "@/config/mba";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const core = ["/", "/templates"];
  return [
    ...core.map((p) => ({ url: `${siteConfig.url}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...ALL_SEO_PATHS.map((p) => ({ url: `${siteConfig.url}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...MBA_GUIDES.map((g) => ({ url: `${siteConfig.url}/mba-resume/${g.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...["/privacy", "/terms"].map((p) => ({ url: `${siteConfig.url}${p}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
