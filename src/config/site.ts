/**
 * Resolve the public site URL. Accepts values with or without a protocol and
 * falls back to Vercel's system env vars, so a mis-typed setting can never
 * break the build.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];
  for (const raw of candidates) {
    const v = raw?.trim();
    if (!v) continue;
    const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      return new URL(withProtocol).origin;
    } catch {
      // try the next candidate
    }
  }
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "DreamJobResume",
  shortName: "DreamJobCV",
  tagline: "Turn Any Job Description Into Your Dream Resume.",
  description:
    "Paste a job description. Get an ATS-optimized resume built for the role. The AI resume builder for MBA graduates and early-career professionals.",
  url: resolveSiteUrl(),
  supportEmail: "support@dreamjobresume.com",
  twitter: "@dreamjobresume",
} as const;

export const ctas = {
  primary: "Build My Resume",
  secondary: "Tailor My Resume",
} as const;
