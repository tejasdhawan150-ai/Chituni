import "server-only";
import type { AIProvider } from "./provider";
import { heuristicProvider } from "./providers/heuristic";
import { createOpenAIProvider } from "./providers/openai";
import { guardTailoring } from "./guardrails";
import type { JobAnalysis, TailoringResult } from "./schemas";
import { heuristicJobAnalysis, mergeAnalyses } from "@/lib/ats/extract";
import { scoreResume, totalYearsOfExperience, type AtsReport } from "@/lib/ats/score";
import { mentionsSkill } from "@/lib/ats/taxonomy";
import { resumeContentSchema, type Profile, type ResumeContent } from "@/lib/resume/schema";
import { getTemplate } from "@/lib/resume/templates";
import { uniqueCaseInsensitive } from "@/lib/utils";

/**
 * The resume engine: orchestrates the configured AI provider, deterministic
 * extraction, truthfulness guardrails and ATS scoring. All server code should
 * call these functions rather than a provider directly.
 */

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  const configured = (process.env.AI_PROVIDER ?? "").toLowerCase();
  const key = process.env.OPENAI_API_KEY;
  if ((configured === "openai" || configured === "") && key) {
    cached = createOpenAIProvider(key, process.env.OPENAI_MODEL || "gpt-4.1-mini");
  } else {
    cached = heuristicProvider;
  }
  return cached;
}

async function withFallback<T>(label: string, primary: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  const provider = getAIProvider();
  if (provider === heuristicProvider) return fallback();
  try {
    return await primary();
  } catch (err) {
    console.error(`[ai] ${label} failed on ${provider.name}, using heuristic fallback:`, (err as Error).message);
    return fallback();
  }
}

export async function analyzeJob(jobDescription: string): Promise<JobAnalysis> {
  const deterministic = heuristicJobAnalysis(jobDescription);
  const provider = getAIProvider();
  if (provider === heuristicProvider) return deterministic;
  return withFallback(
    "analyzeJob",
    async () => mergeAnalyses(await provider.analyzeJob(jobDescription), deterministic),
    async () => deterministic,
  );
}

export interface TailoringOutcome {
  result: TailoringResult;
  current: AtsReport;
  projected: AtsReport;
  tailoredContent: ResumeContent;
}

/** Relevance-sort bullets inside each role (stable) — most job-relevant first. */
function reorderBullets(bullets: string[], terms: string[]) {
  return bullets
    .map((b, i) => ({ b, i, score: terms.reduce((n, t) => n + (mentionsSkill(b, t) ? 1 : 0), 0) }))
    .sort((a, z) => z.score - a.score || a.i - z.i)
    .map((x) => x.b);
}

/** Apply a GUARDED tailoring result to the user's content. Only uses facts already in the content. */
export function applyTailoring(content: ResumeContent, result: TailoringResult, analysis: JobAnalysis): ResumeContent {
  const next = resumeContentSchema.parse(structuredClone(content));
  if (result.summary) next.summary = result.summary;

  const recsByExp = new Map<string, Map<number, string>>();
  for (const r of result.experience_recommendations) {
    if (r.bullet_index === null) continue;
    if (!recsByExp.has(r.experience_id)) recsByExp.set(r.experience_id, new Map());
    recsByExp.get(r.experience_id)!.set(r.bullet_index, r.suggested);
  }
  const terms = uniqueCaseInsensitive([...analysis.required_skills, ...analysis.preferred_skills, ...analysis.keywords]);
  next.experience = next.experience.map((e) => {
    const recs = recsByExp.get(e.id);
    const bullets = e.bullets.map((b, i) => recs?.get(i) ?? b);
    return { ...e, bullets: reorderBullets(bullets, terms) };
  });

  const evidenced = result.skill_recommendations.filter((r) => r.action === "add_from_profile").map((r) => r.skill);
  next.skills = uniqueCaseInsensitive([...result.skills_order, ...evidenced, ...next.skills]).slice(0, 30);
  return next;
}

export async function tailorResume(input: { profile: ResumeContent; analysis: JobAnalysis; jobDescription: string; templateId?: string }): Promise<TailoringOutcome> {
  const { profile, analysis, jobDescription } = input;
  const years = totalYearsOfExperience(profile);
  const provider = getAIProvider();
  const args = { profile, analysis, jobDescription, yearsOfExperience: years };
  const raw = await withFallback("tailor", () => provider.tailor(args), () => heuristicProvider.tailor(args));
  const derived = years !== null ? `${Math.floor(years)} years ${Math.round(years)} years ${years} years` : "";
  const guarded = guardTailoring(raw, profile, derived);
  const atsSafe = input.templateId ? getTemplate(input.templateId).atsSafe : true;

  const current = scoreResume(profile, analysis, { atsSafeTemplate: atsSafe });
  const tailoredContent = applyTailoring(profile, guarded, analysis);
  const projected = scoreResume(tailoredContent, analysis, { atsSafeTemplate: atsSafe });

  return {
    result: { ...guarded, match_score: current.overall },
    current,
    projected: projected.overall >= current.overall ? projected : current,
    tailoredContent: projected.overall >= current.overall ? tailoredContent : profile,
  };
}

export async function parseResumeText(text: string): Promise<Profile> {
  const provider = getAIProvider();
  return withFallback("parseResume", () => provider.parseResume(text), () => heuristicProvider.parseResume(text));
}
