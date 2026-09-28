import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { emptyProfile } from "@/lib/resume/schema";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const existing = await getRepository().getProfile(user.id);
  const initial = existing ?? { ...emptyProfile(), basics: { ...emptyProfile().basics, fullName: user.name, email: user.email } };
  return (
    <PageContainer>
      <PageHeader title="Profile" description="Changes here apply to new tailored resumes. Existing resumes keep their own content." className="mb-8" />
      <ProfileForm initial={initial} mode="edit" />
    </PageContainer>
  );
}
