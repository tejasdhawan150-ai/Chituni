"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { applicationInputSchema, APPLICATION_STATUSES, type ApplicationInput } from "@/lib/resume/schema";
import { assertFeature } from "@/lib/billing/entitlements";
import { run, UserFacingError } from "../context";

async function resumeScore(repo: import("@/lib/db").Repository, userId: string, resumeId: string | null) {
  if (!resumeId) return null;
  const r = await repo.getResume(userId, resumeId);
  if (!r) throw new UserFacingError("Linked resume not found.");
  return r.atsScore;
}

export async function createApplicationAction(input: ApplicationInput) {
  return run(async ({ user, repo }) => {
    await assertFeature(repo, user.id, "job_tracker");
    const data = applicationInputSchema.parse(input);
    const app = await repo.createApplication(user.id, { ...data, atsScore: await resumeScore(repo, user.id, data.resumeId) });
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return app;
  });
}

export async function updateApplicationAction(id: string, input: Partial<ApplicationInput>) {
  return run(async ({ user, repo }) => {
    await assertFeature(repo, user.id, "job_tracker");
    const patch = applicationInputSchema.partial().parse(input);
    const atsScore = patch.resumeId !== undefined ? await resumeScore(repo, user.id, patch.resumeId) : undefined;
    const app = await repo.updateApplication(user.id, id, { ...patch, ...(atsScore !== undefined ? { atsScore } : {}) });
    if (!app) throw new UserFacingError("Application not found.");
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return app;
  });
}

export async function setApplicationStatusAction(id: string, status: (typeof APPLICATION_STATUSES)[number]) {
  const s = z.enum(APPLICATION_STATUSES).parse(status);
  return updateApplicationAction(id, { status: s, ...(s === "applied" ? { appliedOn: new Date().toISOString().slice(0, 10) } : {}) });
}

export async function deleteApplicationAction(id: string) {
  return run(async ({ user, repo }) => {
    await repo.deleteApplication(user.id, id);
    revalidatePath("/applications");
    return true;
  });
}
