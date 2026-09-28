import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { profileToContent } from "@/lib/resume/schema";
import { getTemplate } from "@/lib/resume/templates";
import { tailorResume } from "@/lib/ai/engine";
import { PageContainer } from "@/components/app/page-header";
import { TailoringReview } from "@/components/tailor/tailoring-review";

export const metadata: Metadata = { title: "Job analysis" };

export default async function TailorResultPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ template?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { template } = await searchParams;
  const repo = getRepository();
  let rec = await repo.getJobAnalysis(user.id, id);
  if (!rec) notFound();
  const profile = await repo.getProfile(user.id);
  if (!profile) notFound();
  const content = profileToContent(profile);

  // Analyses created before tailoring existed (or seeded ones) get tailored on first view.
  if (!rec.tailoring || !rec.projectedReport) {
    const outcome = await tailorResume({ profile: content, analysis: rec.analysis, jobDescription: rec.jobDescription });
    await repo.updateJobAnalysis(user.id, rec.id, { tailoring: outcome.result, currentReport: outcome.current, projectedReport: outcome.projected });
    rec = { ...rec, tailoring: outcome.result, currentReport: outcome.current, projectedReport: outcome.projected };
  }

  const t = getTemplate(template);
  return (
    <PageContainer>
      <TailoringReview
        record={{ id: rec.id, jobDescription: rec.jobDescription, analysis: rec.analysis, tailoring: rec.tailoring!, current: rec.currentReport!, projected: rec.projectedReport! }}
        profile={content}
        initialTemplate={t.id}
      />
    </PageContainer>
  );
}
