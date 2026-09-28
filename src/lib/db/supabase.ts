import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobAnalysisRecord, Repository } from "./types";
import { profileSchema, resumeContentSchema, type Application, type CoverLetter, type Resume } from "@/lib/resume/schema";
import { jobAnalysisSchema, tailoringResultSchema } from "@/lib/ai/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Database error: ${res.error.message}`);
  return res.data;
}

const toResume = (r: Row): Resume => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  templateId: r.template_id,
  targetRole: r.target_role,
  targetCompany: r.target_company,
  jobAnalysisId: r.job_analysis_id,
  atsScore: r.ats_score,
  content: resumeContentSchema.parse(r.content ?? {}),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toAnalysis = (r: Row): JobAnalysisRecord => ({
  id: r.id,
  userId: r.user_id,
  jobDescription: r.job_description,
  jobUrl: r.job_url,
  analysis: jobAnalysisSchema.parse(r.analysis),
  tailoring: r.tailoring ? tailoringResultSchema.parse(r.tailoring) : null,
  currentReport: r.current_report,
  projectedReport: r.projected_report,
  createdAt: r.created_at,
});

const toApplication = (r: Row): Application => ({
  id: r.id,
  userId: r.user_id,
  company: r.company,
  role: r.role,
  resumeId: r.resume_id,
  atsScore: r.ats_score,
  appliedOn: r.applied_on,
  status: r.status,
  jobUrl: r.job_url,
  notes: r.notes,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toCoverLetter = (r: Row): CoverLetter => ({
  id: r.id,
  userId: r.user_id,
  resumeId: r.resume_id,
  company: r.company,
  role: r.role,
  body: r.body,
  createdAt: r.created_at,
});

function resumePatchToRow(p: Partial<Resume>): Row {
  const row: Row = {};
  if (p.title !== undefined) row.title = p.title;
  if (p.templateId !== undefined) row.template_id = p.templateId;
  if (p.targetRole !== undefined) row.target_role = p.targetRole;
  if (p.targetCompany !== undefined) row.target_company = p.targetCompany;
  if (p.jobAnalysisId !== undefined) row.job_analysis_id = p.jobAnalysisId;
  if (p.atsScore !== undefined) row.ats_score = p.atsScore;
  if (p.content !== undefined) row.content = p.content;
  return row;
}

function appPatchToRow(p: Partial<Application>): Row {
  const row: Row = {};
  if (p.company !== undefined) row.company = p.company;
  if (p.role !== undefined) row.role = p.role;
  if (p.resumeId !== undefined) row.resume_id = p.resumeId;
  if (p.atsScore !== undefined) row.ats_score = p.atsScore;
  if (p.appliedOn !== undefined) row.applied_on = p.appliedOn || null;
  if (p.status !== undefined) row.status = p.status;
  if (p.jobUrl !== undefined) row.job_url = p.jobUrl;
  if (p.notes !== undefined) row.notes = p.notes;
  return row;
}

/**
 * Supabase/Postgres repository. Uses the per-request server client so Row
 * Level Security is enforced by the database; user_id filters are added as
 * defence in depth.
 */
export function createSupabaseRepository(client?: SupabaseClient): Repository {
  const db = async () => client ?? (await createSupabaseServerClient());

  return {
    async getProfile(userId) {
      const data = check(await (await db()).from("profiles").select("data").eq("id", userId).maybeSingle());
      return data?.data ? profileSchema.parse(data.data) : null;
    },
    async saveProfile(userId, profile) {
      check(await (await db()).from("profiles").upsert({ id: userId, full_name: profile.basics.fullName, data: profile }));
    },

    async listResumes(userId) {
      const data = check(await (await db()).from("resumes").select("*").eq("user_id", userId).order("updated_at", { ascending: false }));
      return (data ?? []).map(toResume);
    },
    async getResume(userId, id) {
      const data = check(await (await db()).from("resumes").select("*").eq("user_id", userId).eq("id", id).maybeSingle());
      return data ? toResume(data) : null;
    },
    async createResume(userId, input) {
      const data = check(
        await (await db())
          .from("resumes")
          .insert({ user_id: userId, ...resumePatchToRow(input as Partial<Resume>) })
          .select("*")
          .single(),
      );
      return toResume(data);
    },
    async updateResume(userId, id, patch) {
      const data = check(await (await db()).from("resumes").update(resumePatchToRow(patch)).eq("user_id", userId).eq("id", id).select("*").maybeSingle());
      return data ? toResume(data) : null;
    },
    async deleteResume(userId, id) {
      check(await (await db()).from("resumes").delete().eq("user_id", userId).eq("id", id));
    },
    async countResumes(userId) {
      const res = await (await db()).from("resumes").select("id", { count: "exact", head: true }).eq("user_id", userId);
      if (res.error) throw new Error(res.error.message);
      return res.count ?? 0;
    },

    async listJobAnalyses(userId, limit = 50) {
      const data = check(await (await db()).from("job_analyses").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit));
      return (data ?? []).map(toAnalysis);
    },
    async getJobAnalysis(userId, id) {
      const data = check(await (await db()).from("job_analyses").select("*").eq("user_id", userId).eq("id", id).maybeSingle());
      return data ? toAnalysis(data) : null;
    },
    async createJobAnalysis(userId, input) {
      const data = check(
        await (await db())
          .from("job_analyses")
          .insert({
            user_id: userId,
            job_description: input.jobDescription,
            job_url: input.jobUrl,
            analysis: input.analysis,
            tailoring: input.tailoring,
            current_report: input.currentReport,
            projected_report: input.projectedReport,
          })
          .select("*")
          .single(),
      );
      return toAnalysis(data);
    },
    async updateJobAnalysis(userId, id, patch) {
      const row: Row = {};
      if (patch.tailoring !== undefined) row.tailoring = patch.tailoring;
      if (patch.currentReport !== undefined) row.current_report = patch.currentReport;
      if (patch.projectedReport !== undefined) row.projected_report = patch.projectedReport;
      check(await (await db()).from("job_analyses").update(row).eq("user_id", userId).eq("id", id));
    },
    async countJobAnalyses(userId) {
      const res = await (await db()).from("job_analyses").select("id", { count: "exact", head: true }).eq("user_id", userId);
      if (res.error) throw new Error(res.error.message);
      return res.count ?? 0;
    },

    async listApplications(userId) {
      const data = check(await (await db()).from("applications").select("*").eq("user_id", userId).order("updated_at", { ascending: false }));
      return (data ?? []).map(toApplication);
    },
    async createApplication(userId, input) {
      const data = check(
        await (await db())
          .from("applications")
          .insert({ user_id: userId, ...appPatchToRow(input as Partial<Application>) })
          .select("*")
          .single(),
      );
      return toApplication(data);
    },
    async updateApplication(userId, id, patch) {
      const data = check(
        await (await db())
          .from("applications")
          .update(appPatchToRow(patch as Partial<Application>))
          .eq("user_id", userId)
          .eq("id", id)
          .select("*")
          .maybeSingle(),
      );
      return data ? toApplication(data) : null;
    },
    async deleteApplication(userId, id) {
      check(await (await db()).from("applications").delete().eq("user_id", userId).eq("id", id));
    },

    async listCoverLetters(userId) {
      const data = check(await (await db()).from("cover_letters").select("*").eq("user_id", userId).order("created_at", { ascending: false }));
      return (data ?? []).map(toCoverLetter);
    },
    async createCoverLetter(userId, input) {
      const data = check(
        await (await db())
          .from("cover_letters")
          .insert({ user_id: userId, resume_id: input.resumeId, company: input.company, role: input.role, body: input.body })
          .select("*")
          .single(),
      );
      return toCoverLetter(data);
    },

    async recordUsage(userId, kind) {
      check(await (await db()).from("usage_events").insert({ user_id: userId, kind }));
    },
    async countUsageSince(userId, kind, sinceIso) {
      const res = await (await db())
        .from("usage_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("kind", kind)
        .gte("created_at", sinceIso);
      if (res.error) throw new Error(res.error.message);
      return res.count ?? 0;
    },
  };
}
