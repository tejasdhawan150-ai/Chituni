import type { JobAnalysisRecord, Subscription } from "./types";
import type { Application, Profile, Resume } from "@/lib/resume/schema";
import { profileToContent } from "@/lib/resume/schema";
import { DEMO_PROFILE, SAMPLE_JD_ACCENTURE, SAMPLE_JD_DELOITTE, SAMPLE_JD_PG } from "@/lib/demo/samples";
import { heuristicJobAnalysis } from "@/lib/ats/extract";
import { scoreResume } from "@/lib/ats/score";
import { uid } from "@/lib/utils";

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

/** Seed data for demo mode. */
export function seedDemoData(userId: string) {
  const profile: Profile = structuredClone(DEMO_PROFILE);
  const content = profileToContent(profile);

  const jobs = [
    { jd: SAMPLE_JD_DELOITTE, template: "consulting", age: 1 },
    { jd: SAMPLE_JD_PG, template: "marketing", age: 3 },
    { jd: SAMPLE_JD_ACCENTURE, template: "corporate", age: 6 },
  ];

  const analyses: JobAnalysisRecord[] = [];
  const resumes: Resume[] = [
    {
      id: uid(),
      userId,
      title: "General MBA Resume",
      templateId: "mba-professional",
      targetRole: "",
      targetCompany: "",
      jobAnalysisId: null,
      atsScore: null,
      content,
      createdAt: daysAgo(14),
      updatedAt: daysAgo(10),
    },
  ];

  for (const j of jobs) {
    const analysis = heuristicJobAnalysis(j.jd);
    const report = scoreResume(content, analysis);
    const rec: JobAnalysisRecord = {
      id: uid(),
      userId,
      jobDescription: j.jd,
      jobUrl: "",
      analysis,
      tailoring: null,
      currentReport: report,
      projectedReport: null,
      createdAt: daysAgo(j.age),
    };
    analyses.push(rec);
    resumes.push({
      id: uid(),
      userId,
      title: `${analysis.job_title} — ${analysis.company}`,
      templateId: j.template,
      targetRole: analysis.job_title,
      targetCompany: analysis.company,
      jobAnalysisId: rec.id,
      atsScore: report.overall,
      content: structuredClone(content),
      createdAt: daysAgo(j.age),
      updatedAt: daysAgo(j.age),
    });
  }

  const statuses: Application["status"][] = ["interview", "applied", "saved"];
  const applications: Application[] = resumes.slice(1).map((r, i) => ({
    id: uid(),
    userId,
    company: r.targetCompany,
    role: r.targetRole,
    resumeId: r.id,
    atsScore: r.atsScore,
    appliedOn: statuses[i] === "saved" ? null : daysAgo(i + 1).slice(0, 10),
    status: statuses[i],
    jobUrl: "",
    notes: "",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const subscription: Subscription = {
    userId,
    plan: "career",
    status: "active",
    currency: "INR",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
  };

  return { profile, resumes, analyses, applications, subscription };
}
