import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { LinkedInOptimizer } from "@/components/career/linkedin-optimizer";

export const metadata: Metadata = { title: "Optimize My LinkedIn" };

export default async function LinkedInPage() {
  const user = await requireUser();
  const profile = await getRepository().getProfile(user.id);
  return (
    <PageContainer>
      <PageHeader title="Optimize My LinkedIn" description="Paste your headline and About section. Get a keyword-rich rewrite recruiters can find — using only your real experience." className="mb-8" />
      <LinkedInOptimizer defaultRole={profile?.targetRoles[0] ?? ""} />
    </PageContainer>
  );
}
