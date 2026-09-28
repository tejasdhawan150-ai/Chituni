import "server-only";
import type { JobAnalysisRecord, NewResume, Repository, UsageKind } from "./types";
import type { Application, CoverLetter, Profile, Resume } from "@/lib/resume/schema";
import { uid } from "@/lib/utils";
import { seedDemoData } from "./seed";

/**
 * In-memory repository used in DEMO MODE (no Supabase configured).
 * Data lives for the lifetime of the server process and is seeded with a
 * realistic MBA profile so every screen can be explored locally.
 */

interface Store {
  profiles: Map<string, Profile>;
  resumes: Map<string, Resume>;
  analyses: Map<string, JobAnalysisRecord>;
  applications: Map<string, Application>;
  coverLetters: Map<string, CoverLetter>;
  usage: { userId: string; kind: UsageKind; at: string }[];
  seeded: Set<string>;
}

const g = globalThis as unknown as { __djrStore?: Store };
const store: Store = (g.__djrStore ??= {
  profiles: new Map(),
  resumes: new Map(),
  analyses: new Map(),
  applications: new Map(),
  coverLetters: new Map(),
  usage: [],
  seeded: new Set(),
});

const now = () => new Date().toISOString();
const byUpdated = <T extends { updatedAt?: string; createdAt: string }>(a: T, b: T) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt);

function ensureSeed(userId: string) {
  if (store.seeded.has(userId)) return;
  store.seeded.add(userId);
  const seed = seedDemoData(userId);
  store.profiles.set(userId, seed.profile);
  seed.resumes.forEach((r) => store.resumes.set(r.id, r));
  seed.analyses.forEach((a) => store.analyses.set(a.id, a));
  seed.applications.forEach((a) => store.applications.set(a.id, a));
}

function owned<T extends { userId: string }>(map: Map<string, T>, userId: string, id: string): T | null {
  const v = map.get(id);
  return v && v.userId === userId ? v : null;
}

export const memoryRepository: Repository = {
  async getProfile(userId) {
    ensureSeed(userId);
    return store.profiles.get(userId) ?? null;
  },
  async saveProfile(userId, profile) {
    store.profiles.set(userId, profile);
  },

  async listResumes(userId) {
    ensureSeed(userId);
    return [...store.resumes.values()].filter((r) => r.userId === userId).sort(byUpdated);
  },
  async getResume(userId, id) {
    ensureSeed(userId);
    return owned(store.resumes, userId, id);
  },
  async createResume(userId, input: NewResume) {
    const r: Resume = {
      id: uid(),
      userId,
      title: input.title,
      templateId: input.templateId,
      targetRole: input.targetRole ?? "",
      targetCompany: input.targetCompany ?? "",
      jobAnalysisId: input.jobAnalysisId ?? null,
      atsScore: input.atsScore ?? null,
      content: input.content,
      createdAt: now(),
      updatedAt: now(),
    };
    store.resumes.set(r.id, r);
    return r;
  },
  async updateResume(userId, id, patch) {
    const r = owned(store.resumes, userId, id);
    if (!r) return null;
    const next = { ...r, ...patch, updatedAt: now() };
    store.resumes.set(id, next);
    return next;
  },
  async deleteResume(userId, id) {
    if (owned(store.resumes, userId, id)) store.resumes.delete(id);
    for (const a of store.applications.values()) if (a.userId === userId && a.resumeId === id) a.resumeId = null;
  },
  async countResumes(userId) {
    return (await this.listResumes(userId)).length;
  },

  async listJobAnalyses(userId, limit = 50) {
    ensureSeed(userId);
    return [...store.analyses.values()].filter((a) => a.userId === userId).sort(byUpdated).slice(0, limit);
  },
  async getJobAnalysis(userId, id) {
    ensureSeed(userId);
    return owned(store.analyses, userId, id);
  },
  async createJobAnalysis(userId, input) {
    const rec: JobAnalysisRecord = { ...input, id: uid(), userId, createdAt: now() };
    store.analyses.set(rec.id, rec);
    return rec;
  },
  async updateJobAnalysis(userId, id, patch) {
    const a = owned(store.analyses, userId, id);
    if (a) store.analyses.set(id, { ...a, ...patch });
  },
  async countJobAnalyses(userId) {
    return (await this.listJobAnalyses(userId, 10_000)).length;
  },

  async listApplications(userId) {
    ensureSeed(userId);
    return [...store.applications.values()].filter((a) => a.userId === userId).sort(byUpdated);
  },
  async createApplication(userId, input) {
    const a: Application = {
      id: uid(),
      userId,
      company: input.company,
      role: input.role,
      resumeId: input.resumeId,
      atsScore: input.atsScore ?? null,
      appliedOn: input.appliedOn,
      status: input.status,
      jobUrl: input.jobUrl,
      notes: input.notes,
      createdAt: now(),
      updatedAt: now(),
    };
    store.applications.set(a.id, a);
    return a;
  },
  async updateApplication(userId, id, patch) {
    const a = owned(store.applications, userId, id);
    if (!a) return null;
    const next = { ...a, ...patch, updatedAt: now() };
    store.applications.set(id, next);
    return next;
  },
  async deleteApplication(userId, id) {
    if (owned(store.applications, userId, id)) store.applications.delete(id);
  },

  async listCoverLetters(userId) {
    return [...store.coverLetters.values()].filter((c) => c.userId === userId).sort(byUpdated);
  },
  async createCoverLetter(userId, input) {
    const c: CoverLetter = { ...input, id: uid(), userId, createdAt: now() };
    store.coverLetters.set(c.id, c);
    return c;
  },

  async recordUsage(userId, kind) {
    store.usage.push({ userId, kind, at: now() });
  },
  async countUsageSince(userId, kind, sinceIso) {
    return store.usage.filter((u) => u.userId === userId && u.kind === kind && u.at >= sinceIso).length;
  },
};
