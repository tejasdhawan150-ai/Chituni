/**
 * Single source of truth for plans, prices and entitlements.
 * Prices are defined per currency so USD / global pricing can be switched on
 * by adding amounts + Stripe price IDs — no UI code changes required.
 */

export const CURRENCIES = ["INR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PLAN_IDS = ["free", "pro", "career"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export type Feature =
  | "all_templates"
  | "advanced_ats"
  | "ai_rewrite"
  | "docx_export"
  | "resume_versions"
  | "job_tracker"
  | "cover_letter"
  | "linkedin_optimization"
  | "career_insights"
  | "interview_prep"
  | "priority_ai";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly amount in the currency's minor unit (paise / cents). null = not sold in that currency. */
  monthly: Record<Currency, number | null>;
  /** Env var holding the Stripe Price ID per currency. Resolved server-side only. */
  stripePriceEnv: Partial<Record<Currency, string>>;
  limits: { resumes: number; jobAnalysesPerMonth: number; aiRewritesPerMonth: number };
  features: Feature[];
  highlights: string[];
  cta: string;
  featured?: boolean;
}

const UNLIMITED = Number.POSITIVE_INFINITY;

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Try tailoring for your next application.",
    monthly: { INR: 0, USD: 0 },
    stripePriceEnv: {},
    limits: { resumes: 1, jobAnalysesPerMonth: 2, aiRewritesPerMonth: 10 },
    features: [],
    highlights: ["1 resume", "2 job analyses", "Basic templates", "Basic ATS analysis", "PDF download"],
    cta: "Build My Resume — Free",
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "For active job seekers applying every week.",
    monthly: { INR: 49900, USD: 900 },
    stripePriceEnv: { INR: "STRIPE_PRICE_PRO_INR", USD: "STRIPE_PRICE_PRO_USD" },
    limits: { resumes: UNLIMITED, jobAnalysesPerMonth: UNLIMITED, aiRewritesPerMonth: UNLIMITED },
    features: ["all_templates", "advanced_ats", "ai_rewrite", "docx_export", "resume_versions", "job_tracker"],
    highlights: [
      "Unlimited resumes",
      "Unlimited job tailoring",
      "All templates",
      "Advanced ATS analysis",
      "AI resume rewriting",
      "PDF/DOCX export",
      "Resume versions",
      "Job tracker",
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
  career: {
    id: "career",
    name: "Career",
    tagline: "Everything you need to land the offer.",
    monthly: { INR: 99900, USD: 1900 },
    stripePriceEnv: { INR: "STRIPE_PRICE_CAREER_INR", USD: "STRIPE_PRICE_CAREER_USD" },
    limits: { resumes: UNLIMITED, jobAnalysesPerMonth: UNLIMITED, aiRewritesPerMonth: UNLIMITED },
    features: [
      "all_templates",
      "advanced_ats",
      "ai_rewrite",
      "docx_export",
      "resume_versions",
      "job_tracker",
      "cover_letter",
      "linkedin_optimization",
      "career_insights",
      "interview_prep",
      "priority_ai",
    ],
    highlights: [
      "Everything in Pro",
      "Advanced career insights",
      "Cover letter generation",
      "LinkedIn profile optimization",
      "Interview preparation",
      "Priority AI processing",
    ],
    cta: "Go Career",
  },
};

export const PLAN_LIST: Plan[] = PLAN_IDS.map((id) => PLANS[id]);

export const DEFAULT_CURRENCY: Currency = (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY as Currency) === "USD" ? "USD" : "INR";

const LOCALE: Record<Currency, string> = { INR: "en-IN", USD: "en-US" };

export function formatPrice(minor: number, currency: Currency) {
  return new Intl.NumberFormat(LOCALE[currency], { style: "currency", currency, maximumFractionDigits: minor % 100 === 0 ? 0 : 2 }).format(minor / 100);
}

export function planPrice(plan: Plan, currency: Currency = DEFAULT_CURRENCY): string | null {
  const amount = plan.monthly[currency];
  return amount === null ? null : formatPrice(amount, currency);
}

export function hasFeature(planId: PlanId, feature: Feature) {
  return PLANS[planId].features.includes(feature);
}

export const FEATURE_UPSELL: Record<Feature, PlanId> = {
  all_templates: "pro",
  advanced_ats: "pro",
  ai_rewrite: "pro",
  docx_export: "pro",
  resume_versions: "pro",
  job_tracker: "pro",
  cover_letter: "career",
  linkedin_optimization: "career",
  career_insights: "career",
  interview_prep: "career",
  priority_ai: "career",
};
