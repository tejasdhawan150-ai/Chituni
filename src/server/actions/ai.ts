"use server";
import { rewriteRequestSchema, type RewriteRequest } from "@/lib/ai/schemas";
import { rewriteText } from "@/lib/ai/engine";
import { assertFairUse } from "@/lib/usage";
import { profileToContent, emptyContent } from "@/lib/resume/schema";
import { run } from "../context";

/** Editor AI buttons: Improve Bullet / Make More Impactful / Add Relevant Keywords / Shorten / Make ATS-Friendly. */
export async function rewriteAction(input: RewriteRequest) {
  return run(async ({ user, repo }) => {
    const req = rewriteRequestSchema.parse(input);
    await assertFairUse(repo, user.id);
    const profile = await repo.getProfile(user.id);
    const result = await rewriteText(req, profile ? profileToContent(profile) : emptyContent());
    await repo.recordUsage(user.id, "ai_rewrite");
    return result;
  });
}
