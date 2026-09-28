import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { emptyProfile } from "@/lib/resume/schema";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = { title: "Build your profile" };

export default async function OnboardingPage() {
  const user = await requireUser();
  const existing = await getRepository().getProfile(user.id);
  const initial = existing ?? { ...emptyProfile(), basics: { ...emptyProfile().basics, fullName: user.name, email: user.email } };
  return (
    <PageContainer>
      <PageHeader title="Build your profile" description="Your master profile is the single source of truth. Every tailored resume is built only from what you add here." className="mb-8" />
      <ProfileForm initial={initial} mode="onboarding" />
    </PageContainer>
  );
}
