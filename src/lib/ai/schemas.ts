import { z } from "zod";
import { profileSchema } from "@/lib/resume/schema";

/** Strict Zod schemas for every AI input/output. AI output is ALWAYS validated before use. */

const str = z.string().trim();
const strList = (max = 40) => z.array(str.max(200)).max(max).default([]);

export const SENIORITY_LEVELS = ["intern", "entry", "associate", "mid", "senior", "lead", "manager", "director", "unknown"] as const;

export const jobAnalysisSchema = z.object({
  job_title: str.max(160).default(""),
  company: str.max(160).default(""),
  seniority: z.enum(SENIORITY_LEVELS).catch("unknown").default("unknown"),
  location: str.max(160).default(""),
  years_experience: z
    .object({ min: z.number().min(0).max(40).nullable().default(null), max: z.number().min(0).max(40).nullable().default(null) })
    .default({ min: null, max: null }),
  education_requirements: strList(10),
  required_skills: strList(),
  preferred_skills: strList(),
  keywords: strList(60),
  responsibilities: strList(25),
  soft_skills: strList(20),
  industry_terms: strList(30),
});
export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

export const experienceRecommendationSchema = z.object({
  experience_id: str,
  bullet_index: z.number().int().min(0).nullable().default(null),
  original: str.max(600).default(""),
  suggested: str.max(600),
  reason: str.max(300).default(""),
});
export type ExperienceRecommendation = z.infer<typeof experienceRecommendationSchema>;

export const skillRecommendationSchema = z.object({
  skill: str.max(80),
  action: z.enum(["highlight", "add_from_profile", "reorder", "missing"]),
  reason: str.max(300).default(""),
});
export type SkillRecommendation = z.infer<typeof skillRecommendationSchema>;

export const resumeChangeSchema = z.object({
  section: str.max(40),
  description: str.max(300),
});

/** Output contract of the resume tailoring engine (matches the product spec). */
export const tailoringResultSchema = z.object({
  job_title: str.max(160).default(""),
  company: str.max(160).default(""),
  seniority: str.max(40).default(""),
  required_skills: strList(),
  preferred_skills: strList(),
  keywords: strList(60),
  responsibilities: strList(25),
  matched_skills: strList(60),
  missing_skills: strList(60),
  match_score: z.number().min(0).max(100).default(0),
  summary: str.max(1200).default(""),
  experience_recommendations: z.array(experienceRecommendationSchema).max(40).default([]),
  skill_recommendations: z.array(skillRecommendationSchema).max(60).default([]),
  resume_changes: z.array(resumeChangeSchema).max(30).default([]),
  /** Skill ordering for the tailored resume — must only contain skills the user already has. */
  skills_order: strList(80),
});
export type TailoringResult = z.infer<typeof tailoringResultSchema>;

export const REWRITE_ACTIONS = ["improve", "impactful", "keywords", "shorten", "ats"] as const;
export type RewriteAction = (typeof REWRITE_ACTIONS)[number];
export const REWRITE_LABELS: Record<RewriteAction, string> = {
  improve: "Improve Bullet",
  impactful: "Make More Impactful",
  keywords: "Add Relevant Keywords",
  shorten: "Shorten",
  ats: "Make ATS-Friendly",
};

export const rewriteRequestSchema = z.object({
  text: str.min(3).max(1200),
  action: z.enum(REWRITE_ACTIONS),
  context: z
    .object({
      role: str.max(160).default(""),
      keywords: strList(40),
      userSkills: strList(80),
    })
    .default({ role: "", keywords: [], userSkills: [] }),
});
export type RewriteRequest = z.infer<typeof rewriteRequestSchema>;

export const rewriteResultSchema = z.object({
  text: str.max(1200),
  notes: strList(5),
});
export type RewriteResult = z.infer<typeof rewriteResultSchema>;

export const coverLetterRequestSchema = z.object({
  resumeId: z.string().nullable().default(null),
  jobDescription: str.min(50, "Paste the full job description (at least 50 characters).").max(20000),
  company: str.max(160).default(""),
  role: str.max(160).default(""),
  tone: z.enum(["professional", "warm", "confident"]).default("professional"),
});
export type CoverLetterRequest = z.infer<typeof coverLetterRequestSchema>;

export const coverLetterResultSchema = z.object({
  body: str.min(50).max(6000),
});

export const linkedinRequestSchema = z.object({
  headline: str.max(300).default(""),
  about: str.max(3000).default(""),
  targetRole: str.max(160).default(""),
});
export type LinkedInRequest = z.infer<typeof linkedinRequestSchema>;

export const linkedinResultSchema = z.object({
  headline: str.max(220),
  about: str.max(2600),
  experience_descriptions: z
    .array(z.object({ experience_id: str, title: str.max(200).default(""), description: str.max(2000) }))
    .max(10)
    .default([]),
  skills: strList(50),
  notes: strList(10),
});
export type LinkedInResult = z.infer<typeof linkedinResultSchema>;

/** Resume parsing (upload) produces a profile draft. */
export const parsedProfileSchema = profileSchema;

export const jobDescriptionInputSchema = z.object({
  jobDescription: str
    .min(80, "That looks too short — paste the full job description (responsibilities + requirements).")
    .max(20000, "Job description is too long (20,000 characters max)."),
  jobUrl: z.union([z.url(), z.literal("")]).default(""),
});
