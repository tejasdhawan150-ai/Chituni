import type { Profile, ResumeContent } from "@/lib/resume/schema";
import type { JobAnalysis, TailoringResult } from "./schemas";

/**
 * Provider-agnostic AI interface. Implementations: OpenAI (LLM) and Heuristic
 * (deterministic, no network). Add Anthropic / Gemini / Azure by implementing
 * this interface and registering it in ./engine.ts.
 *
 * Providers return raw results; truthfulness guardrails and ATS scoring are
 * applied centrally in ./engine.ts so every provider is held to the same rules.
 */
export interface AIProvider {
  readonly name: string;
  analyzeJob(jobDescription: string): Promise<JobAnalysis>;
  tailor(input: { profile: ResumeContent; analysis: JobAnalysis; jobDescription: string; yearsOfExperience: number | null }): Promise<TailoringResult>;
  parseResume(text: string): Promise<Profile>;
}

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_output" | "provider_error" | "rate_limited" = "provider_error",
  ) {
    super(message);
  }
}
