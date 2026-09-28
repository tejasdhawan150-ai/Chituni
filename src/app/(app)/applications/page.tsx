import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { hasFeature } from "@/config/pricing";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { UpgradeNotice } from "@/components/app/upgrade-notice";
import { ApplicationTracker } from "@/components/applications/application-tracker";

export const metadata: Metadata = { title: "Job Tracker" };

export default async function ApplicationsPage() {
  const user = await requireUser();
  const repo = getRepository();
  const sub = await repo.getSubscription(user.id);
  const allowed = hasFeature(sub.plan, "job_tracker");
  const [applications, resumes] = allowed ? await Promise.all([repo.listApplications(user.id), repo.listResumes(user.id)]) : [[], []];
  return (
    <PageContainer>
      <PageHeader title="Job Tracker" description="Track every application and the tailored resume you sent." className="mb-8" />
      {allowed ? (
        <ApplicationTracker applications={applications} resumes={resumes.map((r) => ({ id: r.id, title: r.title, atsScore: r.atsScore }))} />
      ) : (
        <UpgradeNotice plan="pro" title="Track your applications" body="Organise every application from Saved to Offer and link each to the resume you sent. Available on Pro." />
      )}
    </PageContainer>
  );
}
