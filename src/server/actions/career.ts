"use server";
import { revalidatePath } from "next/cache";
import { coverLetterRequestSchema, linkedinRequestSchema, type CoverLetterRequest, type LinkedInRequest } from "@/lib/ai/schemas";
import { generateCoverLetter, optimizeLinkedIn } from "@/lib/ai/engine";
import { assertFairUse } from "@/lib/usage";
import { profileToContent } from "@/lib/resume/schema";
import { run, UserFacingError } from "../context";

export async function generateCoverLetterAction(input: CoverLetterRequest) {
  return run(async ({ user, repo }) => {
    await assertFairUse(repo, user.id);
    const req = coverLetterRequestSchema.parse(input);
    let content;
    if (req.resumeId) {
      const r = await repo.getResume(user.id, req.resumeId);
      if (!r) throw new UserFacingError("Resume not found.");
      content = r.content;
    } else {
      const p = await repo.getProfile(user.id);
      if (!p) throw new UserFacingError("Complete your profile first.");
      content = profileToContent(p);
    }
    const body = await generateCoverLetter(content, req);
    const saved = await repo.createCoverLetter(user.id, { resumeId: req.resumeId, company: req.company, role: req.role, body });
    await repo.recordUsage(user.id, "cover_letter");
    revalidatePath("/cover-letter");
    return saved;
  });
}

export async function optimizeLinkedInAction(input: LinkedInRequest) {
  return run(async ({ user, repo }) => {
    await assertFairUse(repo, user.id);
    const req = linkedinRequestSchema.parse(input);
    const profile = await repo.getProfile(user.id);
    if (!profile) throw new UserFacingError("Complete your profile first — we only use your real experience.");
    const result = await optimizeLinkedIn(profile, req);
    await repo.recordUsage(user.id, "linkedin");
    return result;
  });
}
