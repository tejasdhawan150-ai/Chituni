export const siteConfig = {
  name: "DreamJobResume",
  shortName: "DreamJobCV",
  tagline: "Turn Any Job Description Into Your Dream Resume.",
  description:
    "Paste a job description. Get an ATS-optimized resume built for the role. The AI resume builder for MBA graduates and early-career professionals.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supportEmail: "support@dreamjobresume.com",
  twitter: "@dreamjobresume",
} as const;

export const ctas = {
  primary: "Build My Resume",
  secondary: "Tailor My Resume",
} as const;
