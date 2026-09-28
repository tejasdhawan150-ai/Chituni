import "server-only";
import { FEATURE_UPSELL, PLANS, hasFeature, type Feature, type PlanId } from "@/config/pricing";
import type { Repository } from "@/lib/db/types";
import type { UsageKind } from "@/lib/db/types";

export class EntitlementError extends Error {
  constructor(
    message: string,
    public readonly upgradeTo: PlanId,
  ) {
    super(message);
  }
}

function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

export async function getPlan(repo: Repository, userId: string): Promise<PlanId> {
  return (await repo.getSubscription(userId)).plan;
}

export async function assertFeature(repo: Repository, userId: string, feature: Feature) {
  const plan = await getPlan(repo, userId);
  if (!hasFeature(plan, feature)) {
    const to = FEATURE_UPSELL[feature];
    throw new EntitlementError(`This feature is available on the ${PLANS[to].name} plan.`, to);
  }
  return plan;
}

const USAGE_LIMIT: Partial<Record<UsageKind, keyof (typeof PLANS)["free"]["limits"]>> = {
  job_analysis: "jobAnalysesPerMonth",
  ai_rewrite: "aiRewritesPerMonth",
};

/** Throws when the user has exhausted the monthly quota for a metered action. */
export async function assertUsage(repo: Repository, userId: string, kind: UsageKind) {
  const plan = await getPlan(repo, userId);
  const key = USAGE_LIMIT[kind];
  if (!key) return plan;
  const limit = PLANS[plan].limits[key];
  if (!Number.isFinite(limit)) return plan;
  const used = await repo.countUsageSince(userId, kind, monthStart());
  if (used >= limit) {
    throw new EntitlementError(
      kind === "job_analysis"
        ? `You've used your ${limit} free job analyses this month. Upgrade to Pro for unlimited tailoring.`
        : `You've used your ${limit} free AI rewrites this month. Upgrade to Pro for unlimited rewriting.`,
      "pro",
    );
  }
  return plan;
}

export async function assertCanCreateResume(repo: Repository, userId: string) {
  const plan = await getPlan(repo, userId);
  const limit = PLANS[plan].limits.resumes;
  if (Number.isFinite(limit) && (await repo.countResumes(userId)) >= limit) {
    throw new EntitlementError(`The ${PLANS[plan].name} plan includes ${limit} resume. Upgrade to Pro for unlimited resumes and versions.`, "pro");
  }
  return plan;
}
