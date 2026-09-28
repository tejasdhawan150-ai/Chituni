import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { hasFeature } from "@/config/pricing";
import { ResumeEditor } from "@/components/editor/resume-editor";

export const metadata: Metadata = { title: "Resume editor" };

export default async function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const repo = getRepository();
  const resume = await repo.getResume(user.id, id);
  if (!resume) notFound();
  const [profile, sub, rec] = await Promise.all([
    repo.getProfile(user.id),
    repo.getSubscription(user.id),
    resume.jobAnalysisId ? repo.getJobAnalysis(user.id, resume.jobAnalysisId) : Promise.resolve(null),
  ]);
  const plan = sub.plan;
  return (
    <ResumeEditor
      resume={{
        id: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        targetRole: resume.targetRole,
        targetCompany: resume.targetCompany,
        content: resume.content,
        updatedAt: resume.updatedAt,
      }}
      analysis={rec?.analysis ?? null}
      profileSkills={profile?.skills ?? []}
      mbaSpecialization={profile?.mbaSpecialization ?? ""}
      entitlements={{
        allTemplates: hasFeature(plan, "all_templates"),
        docx: hasFeature(plan, "docx_export"),
        versions: hasFeature(plan, "resume_versions"),
        advancedAts: hasFeature(plan, "advanced_ats"),
        coverLetter: hasFeature(plan, "cover_letter"),
      }}
    />
  );
}
