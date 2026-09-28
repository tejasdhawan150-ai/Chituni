"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { profileToContent, resumeContentSchema, emptyContent } from "@/lib/resume/schema";
import { getTemplate, DEFAULT_TEMPLATE_ID } from "@/lib/resume/templates";
import { scoreResume } from "@/lib/ats/score";
import { assertCanCreateResume, assertFeature, getPlan } from "@/lib/billing/entitlements";
import { hasFeature } from "@/config/pricing";
import { run, UserFacingError } from "../context";

const saveSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  templateId: z.string(),
  targetRole: z.string().trim().max(160).default(""),
  targetCompany: z.string().trim().max(160).default(""),
  content: resumeContentSchema,
});

export async function saveResumeAction(input: z.input<typeof saveSchema>) {
  return run(async ({ user, repo }) => {
    const data = saveSchema.parse(input);
    const existing = await repo.getResume(user.id, data.id);
    if (!existing) throw new UserFacingError("Resume not found.");
    const template = getTemplate(data.templateId);
    if (template.pro && !hasFeature(await getPlan(repo, user.id), "all_templates")) {
      throw new UserFacingError(`${template.name} is a Pro template. Upgrade to use all templates.`);
    }
    let atsScore = existing.atsScore;
    if (existing.jobAnalysisId) {
      const rec = await repo.getJobAnalysis(user.id, existing.jobAnalysisId);
      if (rec) atsScore = scoreResume(data.content, rec.analysis, { atsSafeTemplate: template.atsSafe }).overall;
    }
    const updated = await repo.updateResume(user.id, data.id, {
      title: data.title,
      templateId: template.id,
      targetRole: data.targetRole,
      targetCompany: data.targetCompany,
      content: data.content,
      atsScore,
    });
    revalidatePath("/resumes");
    revalidatePath("/dashboard");
    return { updatedAt: updated?.updatedAt ?? new Date().toISOString(), atsScore };
  });
}

export async function createResumeFromProfileAction(templateId: string = DEFAULT_TEMPLATE_ID) {
  const res = await run(async ({ user, repo }) => {
    const plan = await assertCanCreateResume(repo, user.id);
    const profile = await repo.getProfile(user.id);
    const t = getTemplate(templateId);
    const r = await repo.createResume(user.id, {
      title: "General Resume",
      templateId: t.pro && !hasFeature(plan, "all_templates") ? DEFAULT_TEMPLATE_ID : t.id,
      content: profile ? profileToContent(profile) : emptyContent(),
    });
    return { id: r.id };
  });
  if (res.ok) redirect(`/resumes/${res.data.id}`);
  return res;
}

export async function duplicateResumeAction(id: string) {
  const res = await run(async ({ user, repo }) => {
    await assertFeature(repo, user.id, "resume_versions");
    await assertCanCreateResume(repo, user.id);
    const r = await repo.getResume(user.id, id);
    if (!r) throw new UserFacingError("Resume not found.");
    const copy = await repo.createResume(user.id, {
      title: `${r.title} (copy)`,
      templateId: r.templateId,
      targetRole: r.targetRole,
      targetCompany: r.targetCompany,
      jobAnalysisId: r.jobAnalysisId,
      atsScore: r.atsScore,
      content: structuredClone(r.content),
    });
    revalidatePath("/resumes");
    return { id: copy.id };
  });
  if (res.ok) redirect(`/resumes/${res.data.id}`);
  return res;
}

export async function deleteResumeAction(id: string) {
  return run(async ({ user, repo }) => {
    await repo.deleteResume(user.id, id);
    revalidatePath("/resumes");
    revalidatePath("/dashboard");
    return true;
  });
}
