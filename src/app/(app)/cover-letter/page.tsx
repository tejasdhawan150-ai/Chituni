import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { hasFeature } from "@/config/pricing";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { UpgradeNotice } from "@/components/app/upgrade-notice";
import { CoverLetterGenerator } from "@/components/career/cover-letter-generator";

export const metadata: Metadata = { title: "Cover Letters" };

export default async function CoverLetterPage({ searchParams }: { searchParams: Promise<{ resume?: string }> }) {
  const user = await requireUser();
  const repo = getRepository();
  const sub = await repo.getSubscription(user.id);
  const allowed = hasFeature(sub.plan, "cover_letter");
  const { resume } = await searchParams;
  let content = null;
  if (allowed) {
    const [resumes, analyses, letters] = await Promise.all([repo.listResumes(user.id), repo.listJobAnalyses(user.id, 200), repo.listCoverLetters(user.id)]);
    const jdById = new Map(analyses.map((a) => [a.id, a.jobDescription]));
    content = (
      <CoverLetterGenerator
        resumes={resumes.map((r) => ({ id: r.id, title: r.title, targetRole: r.targetRole, targetCompany: r.targetCompany, jobDescription: (r.jobAnalysisId && jdById.get(r.jobAnalysisId)) || "" }))}
        letters={letters}
        defaults={{ resumeId: resume ?? null }}
      />
    );
  }
  return (
    <PageContainer>
      <PageHeader title="Create Cover Letter" description="A tailored cover letter using your profile, resume, the job description, company and role." className="mb-8" />
      {content ?? <UpgradeNotice plan="career" title="Tailored cover letters" body="Generate a cover letter for every application — grounded only in your real experience. Available on Career." />}
    </PageContainer>
  );
}
