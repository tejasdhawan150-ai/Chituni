import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { ApplicationTracker } from "@/components/applications/application-tracker";

export const metadata: Metadata = { title: "Job Tracker" };

export default async function ApplicationsPage() {
  const user = await requireUser();
  const repo = getRepository();
  const [applications, resumes] = await Promise.all([repo.listApplications(user.id), repo.listResumes(user.id)]);
  return (
    <PageContainer>
      <PageHeader title="Job Tracker" description="Track every application and the tailored resume you sent." className="mb-8" />
      <ApplicationTracker applications={applications} resumes={resumes.map((r) => ({ id: r.id, title: r.title, atsScore: r.atsScore }))} />
    </PageContainer>
  );
}
