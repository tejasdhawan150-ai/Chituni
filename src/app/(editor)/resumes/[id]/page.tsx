import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { ResumeEditor } from "@/components/editor/resume-editor";

export const metadata: Metadata = { title: "Resume editor" };

export default async function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const repo = getRepository();
  const resume = await repo.getResume(user.id, id);
  if (!resume) notFound();
  const [profile, rec] = await Promise.all([
    repo.getProfile(user.id),
    resume.jobAnalysisId ? repo.getJobAnalysis(user.id, resume.jobAnalysisId) : Promise.resolve(null),
  ]);
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
    />
  );
}
