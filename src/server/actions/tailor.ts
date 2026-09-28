"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { jobDescriptionInputSchema } from "@/lib/ai/schemas";
import { analyzeJob, applyTailoring, tailorResume } from "@/lib/ai/engine";
import { scoreResume } from "@/lib/ats/score";
import { assertCanCreateResume, assertUsage } from "@/lib/billing/entitlements";
import { profileToContent } from "@/lib/resume/schema";
import { getTemplate, DEFAULT_TEMPLATE_ID } from "@/lib/resume/templates";
import { hasFeature } from "@/config/pricing";
import { run, UserFacingError } from "../context";

/** Step 4–6: analyze a pasted job description and compute tailoring recommendations. */
export async function analyzeJobAction(input: { jobDescription: string; jobUrl?: string; templateId?: string }) {
  const res = await run(async ({ user, repo }) => {
    const { jobDescription, jobUrl } = jobDescriptionInputSchema.parse(input);
    await assertUsage(repo, user.id, "job_analysis");
    const profile = await repo.getProfile(user.id);
    if (!profile || (!profile.experience.length && !profile.education.length)) {
      throw new UserFacingError("Add your experience and education to your profile first — we tailor using your real background.");
    }
    const analysis = await analyzeJob(jobDescription);
    const outcome = await tailorResume({ profile: profileToContent(profile), analysis, jobDescription, templateId: input.templateId });
    const rec = await repo.createJobAnalysis(user.id, {
      jobDescription,
      jobUrl,
      analysis,
      tailoring: outcome.result,
      currentReport: outcome.current,
      projectedReport: outcome.projected,
    });
    await repo.recordUsage(user.id, "job_analysis");
    revalidatePath("/dashboard");
    return { id: rec.id };
  });
  return res;
}

const createSchema = z.object({
  analysisId: z.string().min(1),
  templateId: z.string().default(DEFAULT_TEMPLATE_ID),
  applySummary: z.boolean().default(true),
  applySkills: z.boolean().default(true),
  /** Keys "experienceId:bulletIndex" of accepted bullet rewrites. */
  acceptedBullets: z.array(z.string()).max(100).default([]),
  title: z.string().trim().max(160).optional(),
});

/** Step 6→7: create a tailored resume from accepted recommendations and open the editor. */
export async function createTailoredResumeAction(input: z.input<typeof createSchema>) {
  const res = await run(async ({ user, repo }) => {
    const opts = createSchema.parse(input);
    const plan = await assertCanCreateResume(repo, user.id);
    const rec = await repo.getJobAnalysis(user.id, opts.analysisId);
    if (!rec || !rec.tailoring) throw new UserFacingError("Job analysis not found.");
    const profile = await repo.getProfile(user.id);
    if (!profile) throw new UserFacingError("Profile not found.");

    const template = getTemplate(opts.templateId);
    const templateId = template.pro && !hasFeature(plan, "all_templates") ? DEFAULT_TEMPLATE_ID : template.id;

    const accepted = new Set(opts.acceptedBullets);
    const filtered = {
      ...rec.tailoring,
      summary: opts.applySummary ? rec.tailoring.summary : "",
      skills_order: opts.applySkills ? rec.tailoring.skills_order : [],
      skill_recommendations: opts.applySkills ? rec.tailoring.skill_recommendations : [],
      experience_recommendations: rec.tailoring.experience_recommendations.filter((r) => accepted.has(`${r.experience_id}:${r.bullet_index}`)),
    };
    const content = applyTailoring(profileToContent(profile), filtered, rec.analysis);
    const score = scoreResume(content, rec.analysis, { atsSafeTemplate: getTemplate(templateId).atsSafe }).overall;
    const a = rec.analysis;
    const resume = await repo.createResume(user.id, {
      title: opts.title || [a.job_title || "Tailored resume", a.company].filter(Boolean).join(" — "),
      templateId,
      targetRole: a.job_title,
      targetCompany: a.company,
      jobAnalysisId: rec.id,
      atsScore: score,
      content,
    });
    return { id: resume.id };
  });
  if (res.ok) redirect(`/resumes/${res.data.id}?created=1`);
  return res;
}
