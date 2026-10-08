import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeJob, tailorResume } from "@/lib/ai/engine";
import { jobDescriptionInputSchema } from "@/lib/ai/schemas";
import { resumeContentSchema } from "@/lib/resume/schema";
import { rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({ resume: resumeContentSchema, jobDescription: jobDescriptionInputSchema.shape.jobDescription });

/** Stateless: resume + job description in → analysis, scores and tailored resume out. */
export async function POST(req: Request) {
  if (rateLimited(req, "tailor")) return NextResponse.json({ error: "Too many requests. Please wait a few minutes and try again." }, { status: 429 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  const { resume, jobDescription } = parsed.data;
  if (!resume.experience.length && !resume.education.length && !resume.skills.length) {
    return NextResponse.json({ error: "Your resume looks empty. Please upload or paste it first." }, { status: 400 });
  }
  try {
    const analysis = await analyzeJob(jobDescription);
    const outcome = await tailorResume({ profile: resume, analysis, jobDescription });
    const missing = outcome.result.skill_recommendations.filter((r) => r.action === "missing").map((r) => r.skill);
    return NextResponse.json({
      jobTitle: analysis.job_title,
      company: analysis.company,
      analysis,
      before: outcome.current.overall,
      after: outcome.projected.overall,
      missingSkills: missing,
      changes: outcome.result.resume_changes.map((c) => c.description),
      tailored: outcome.tailoredContent,
    });
  } catch (err) {
    console.error("[tailor]", err);
    return NextResponse.json({ error: "Something went wrong while tailoring. Please try again." }, { status: 500 });
  }
}
