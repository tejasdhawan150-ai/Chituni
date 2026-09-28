import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { getTemplate } from "@/lib/resume/templates";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScorePill } from "@/components/app/score-ring";
import { TemplateThumb } from "@/components/resume/template-thumb";
import { ResumeCardActions } from "@/components/resume/resume-card-actions";
import { NewResumeButton } from "@/components/resume/new-resume-button";
import { relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "My Resumes" };

export default async function ResumesPage() {
  const user = await requireUser();
  const resumes = await getRepository().listResumes(user.id);
  return (
    <PageContainer>
      <PageHeader title="My Resumes" description="Every tailored version in one place. Switch templates anytime without losing content." actions={<NewResumeButton />} className="mb-8" />
      {resumes.length === 0 ? (
        <Card className="flex flex-col items-center p-12 text-center">
          <FileText className="size-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No resumes yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Paste a job description and we&apos;ll build your first tailored resume from your profile.</p>
          <Button className="mt-5" asChild>
            <Link href="/tailor">Tailor My Resume</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resumes.map((r) => {
            const t = getTemplate(r.templateId);
            return (
              <Card key={r.id} className="group overflow-hidden">
                <Link href={`/resumes/${r.id}`} className="block bg-muted/40 p-4">
                  <TemplateThumb content={r.content} template={t} className="rounded-md transition group-hover:-translate-y-0.5 group-hover:shadow-md" />
                </Link>
                <div className="space-y-2 border-t p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/resumes/${r.id}`} className="line-clamp-1 text-sm font-medium hover:underline">
                      {r.title}
                    </Link>
                    <ResumeCardActions id={r.id} />
                  </div>
                  <dl className="grid grid-cols-2 gap-y-1 text-xs">
                    <dt className="text-muted-foreground">Target role</dt>
                    <dd className="truncate text-right">{r.targetRole || "General"}</dd>
                    <dt className="text-muted-foreground">Company</dt>
                    <dd className="truncate text-right">{r.targetCompany || "—"}</dd>
                    <dt className="text-muted-foreground">Template</dt>
                    <dd className="truncate text-right">{t.name}</dd>
                    <dt className="text-muted-foreground">ATS score</dt>
                    <dd className="text-right">
                      <ScorePill score={r.atsScore} />
                    </dd>
                    <dt className="text-muted-foreground">Last edited</dt>
                    <dd className="text-right">{relativeTime(r.updatedAt)}</dd>
                  </dl>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
