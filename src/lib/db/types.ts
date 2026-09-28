import type { JobAnalysis, TailoringResult } from "@/lib/ai/schemas";
import type { AtsReport } from "@/lib/ats/score";
import type { PlanId } from "@/config/pricing";
import type { Application, ApplicationInput, CoverLetter, Profile, Resume, ResumeContent } from "@/lib/resume/schema";

export interface JobAnalysisRecord {
  id: string;
  userId: string;
  jobDescription: string;
  jobUrl: string;
  analysis: JobAnalysis;
  tailoring: TailoringResult | null;
  currentReport: AtsReport | null;
  projectedReport: AtsReport | null;
  createdAt: string;
}

export interface Subscription {
  userId: string;
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "none";
  currency: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

export type UsageKind = "job_analysis" | "ai_rewrite" | "cover_letter" | "linkedin" | "resume_parse";

export interface NewResume {
  title: string;
  templateId: string;
  targetRole?: string;
  targetCompany?: string;
  jobAnalysisId?: string | null;
  atsScore?: number | null;
  content: ResumeContent;
}

/**
 * Persistence boundary. Swap Supabase for any other database by implementing
 * this interface (see ./memory.ts for a reference implementation).
 * Every method is scoped by userId — implementations MUST enforce ownership.
 */
export interface Repository {
  getProfile(userId: string): Promise<Profile | null>;
  saveProfile(userId: string, profile: Profile): Promise<void>;

  listResumes(userId: string): Promise<Resume[]>;
  getResume(userId: string, id: string): Promise<Resume | null>;
  createResume(userId: string, input: NewResume): Promise<Resume>;
  updateResume(userId: string, id: string, patch: Partial<Omit<Resume, "id" | "userId" | "createdAt">>): Promise<Resume | null>;
  deleteResume(userId: string, id: string): Promise<void>;
  countResumes(userId: string): Promise<number>;

  listJobAnalyses(userId: string, limit?: number): Promise<JobAnalysisRecord[]>;
  getJobAnalysis(userId: string, id: string): Promise<JobAnalysisRecord | null>;
  createJobAnalysis(userId: string, input: Omit<JobAnalysisRecord, "id" | "userId" | "createdAt">): Promise<JobAnalysisRecord>;
  updateJobAnalysis(userId: string, id: string, patch: Partial<Pick<JobAnalysisRecord, "tailoring" | "currentReport" | "projectedReport">>): Promise<void>;
  countJobAnalyses(userId: string): Promise<number>;

  listApplications(userId: string): Promise<Application[]>;
  createApplication(userId: string, input: ApplicationInput & { atsScore?: number | null }): Promise<Application>;
  updateApplication(userId: string, id: string, patch: Partial<ApplicationInput> & { atsScore?: number | null }): Promise<Application | null>;
  deleteApplication(userId: string, id: string): Promise<void>;

  listCoverLetters(userId: string): Promise<CoverLetter[]>;
  createCoverLetter(userId: string, input: Omit<CoverLetter, "id" | "userId" | "createdAt">): Promise<CoverLetter>;

  getSubscription(userId: string): Promise<Subscription>;

  recordUsage(userId: string, kind: UsageKind): Promise<void>;
  countUsageSince(userId: string, kind: UsageKind, sinceIso: string): Promise<number>;
}
