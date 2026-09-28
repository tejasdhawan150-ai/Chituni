import "server-only";
import type { Repository, UsageKind } from "@/lib/db/types";
import { UserFacingError } from "@/lib/errors";

/**
 * DreamJobResume is free. To keep AI costs predictable, each user gets a
 * generous daily fair-use allowance of AI actions (default 100/day, set
 * AI_DAILY_LIMIT to change it, or 0 to disable the limit).
 */
const AI_KINDS: UsageKind[] = ["job_analysis", "ai_rewrite", "cover_letter", "linkedin", "resume_parse"];

export function dailyAiLimit(): number {
  const raw = Number(process.env.AI_DAILY_LIMIT ?? 100);
  return Number.isFinite(raw) && raw >= 0 ? raw : 100;
}

export async function assertFairUse(repo: Repository, userId: string) {
  const limit = dailyAiLimit();
  if (limit === 0) return;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const counts = await Promise.all(AI_KINDS.map((k) => repo.countUsageSince(userId, k, since)));
  if (counts.reduce((a, b) => a + b, 0) >= limit) {
    throw new UserFacingError(`You've reached today's fair-use limit of ${limit} AI actions. Please try again tomorrow.`);
  }
}
