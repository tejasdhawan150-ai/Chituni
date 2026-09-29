"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { profileToContent, resumeContentSchema, emptyContent } from "@/lib/resume/schema";
import { getTemplate, DEFAULT_TEMPLATE_ID } from "@/lib/resume/templates";
import { scoreResume } from "@/lib/ats/score";
import { missing, run } from "../context";

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
    if (!existing) throw missing("resume");
    const template = getTemplate(data.templateId);
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
    const profile = await repo.getProfile(user.id);
    const r = await repo.createResume(user.id, {
      title: "General Resume",
      templateId: getTemplate(templateId).id,
      content: profile ? profileToContent(profile) : emptyContent(),
    });
    return { id: r.id };
  });
  if (res.ok) redirect(`/resumes/${res.data.id}`);
  return res;
}

export async function duplicateResumeAction(id: string) {
  const res = await run(async ({ user, repo }) => {
    const r = await repo.getResume(user.id, id);
    if (!r) throw missing("resume");
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
