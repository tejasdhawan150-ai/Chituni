import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { hasFeature } from "@/config/pricing";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { UpgradeNotice } from "@/components/app/upgrade-notice";
import { LinkedInOptimizer } from "@/components/career/linkedin-optimizer";

export const metadata: Metadata = { title: "Optimize My LinkedIn" };

export default async function LinkedInPage() {
  const user = await requireUser();
  const repo = getRepository();
  const [sub, profile] = await Promise.all([repo.getSubscription(user.id), repo.getProfile(user.id)]);
  return (
    <PageContainer>
      <PageHeader title="Optimize My LinkedIn" description="Paste your headline and About section. Get a keyword-rich rewrite recruiters can find — using only your real experience." className="mb-8" />
      {hasFeature(sub.plan, "linkedin_optimization") ? (
        <LinkedInOptimizer defaultRole={profile?.targetRoles[0] ?? ""} />
      ) : (
        <UpgradeNotice plan="career" title="LinkedIn profile optimization" body="Generate a headline, About section, experience descriptions and skills. Available on Career." />
      )}
    </PageContainer>
  );
}
