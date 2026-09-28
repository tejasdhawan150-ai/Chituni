import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { profileToContent } from "@/lib/resume/schema";
import { hasFeature } from "@/config/pricing";
import { DEFAULT_TEMPLATE_ID } from "@/lib/resume/templates";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { ScorePill } from "@/components/app/score-ring";
import { TailorStart } from "@/components/tailor/tailor-start";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Tailor for a job" };

export default async function TailorPage() {
  const user = await requireUser();
  const repo = getRepository();
  const [profile, sub, analyses] = await Promise.all([repo.getProfile(user.id), repo.getSubscription(user.id), repo.listJobAnalyses(user.id, 8)]);
  if (!profile || (!profile.experience.length && !profile.education.length)) redirect("/onboarding");

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Tailor your resume for a job" description="Paste a job description. We'll analyze the role and show exactly how to tailor your resume for it." className="mb-8" />
      <TailorStart content={profileToContent(profile)} canUsePro={hasFeature(sub.plan, "all_templates")} defaultTemplate={DEFAULT_TEMPLATE_ID} />

      {analyses.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Recently analyzed jobs</h2>
          <Card className="divide-y">
            {analyses.map((a) => (
              <Link key={a.id} href={`/tailor/${a.id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-muted/40">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{a.analysis.job_title || "Untitled role"}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {a.analysis.company || "Unknown company"} · {relativeTime(a.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ScorePill score={a.projectedReport?.overall ?? a.currentReport?.overall ?? null} />
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
