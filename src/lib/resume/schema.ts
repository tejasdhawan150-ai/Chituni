import { z } from "zod";

/**
 * Core resume domain model. The same content shape is used for the user's
 * master profile and for every tailored resume version, so switching
 * templates or tailoring never loses data.
 */

const trimmed = (max: number) => z.string().trim().max(max);

export const basicsSchema = z.object({
  fullName: trimmed(120).default(""),
  headline: trimmed(160).default(""),
  email: trimmed(200).default(""),
  phone: trimmed(40).default(""),
  location: trimmed(120).default(""),
  linkedinUrl: trimmed(300).default(""),
  website: trimmed(300).default(""),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: trimmed(160).default(""),
  title: trimmed(160).default(""),
  location: trimmed(120).default(""),
  startDate: trimmed(40).default(""),
  endDate: trimmed(40).default(""),
  current: z.boolean().default(false),
  bullets: z.array(trimmed(600)).default([]),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: trimmed(200).default(""),
  degree: trimmed(160).default(""),
  field: trimmed(160).default(""),
  startDate: trimmed(40).default(""),
  endDate: trimmed(40).default(""),
  grade: trimmed(60).default(""),
  details: trimmed(600).default(""),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: trimmed(200).default(""),
  issuer: trimmed(160).default(""),
  date: trimmed(40).default(""),
});

export const projectSchema = z.object({
  id: z.string(),
  name: trimmed(200).default(""),
  role: trimmed(160).default(""),
  bullets: z.array(trimmed(600)).default([]),
});

export const SECTION_KEYS = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "additional",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Professional Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
  additional: "Additional Information",
};

export const resumeContentSchema = z.object({
  basics: basicsSchema.default(basicsSchema.parse({})),
  summary: trimmed(2000).default(""),
  experience: z.array(experienceSchema).max(20).default([]),
  education: z.array(educationSchema).max(10).default([]),
  skills: z.array(trimmed(80)).max(80).default([]),
  projects: z.array(projectSchema).max(15).default([]),
  certifications: z.array(certificationSchema).max(20).default([]),
  achievements: z.array(trimmed(400)).max(20).default([]),
  additional: trimmed(1500).default(""),
});

export const MBA_SPECIALIZATIONS = [
  "Marketing",
  "Finance",
  "HR",
  "Operations",
  "Business Analytics",
  "Strategy",
  "International Business",
  "Entrepreneurship",
  "Product Management",
  "Not applicable",
] as const;

export const profileSchema = resumeContentSchema.extend({
  mbaSpecialization: z.enum(MBA_SPECIALIZATIONS).or(z.literal("")).default(""),
  targetRoles: z.array(trimmed(80)).max(10).default([]),
});

export type Basics = z.infer<typeof basicsSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;
export type Profile = z.infer<typeof profileSchema>;

export function emptyContent(): ResumeContent {
  return resumeContentSchema.parse({});
}

export function emptyProfile(): Profile {
  return profileSchema.parse({});
}

/** Strip profile-only fields so a profile can seed a resume. */
export function profileToContent(p: Profile): ResumeContent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mbaSpecialization, targetRoles, ...content } = p;
  return resumeContentSchema.parse(structuredClone(content));
}

/** Entities persisted by the repository layer. */
export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  targetRole: string;
  targetCompany: string;
  jobAnalysisId: string | null;
  atsScore: number | null;
  content: ResumeContent;
  createdAt: string;
  updatedAt: string;
}

export const APPLICATION_STATUSES = ["saved", "applied", "interview", "offer", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id: string;
  userId: string;
  company: string;
  role: string;
  resumeId: string | null;
  atsScore: number | null;
  appliedOn: string | null;
  status: ApplicationStatus;
  jobUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const applicationInputSchema = z.object({
  company: trimmed(160).min(1, "Company is required"),
  role: trimmed(160).min(1, "Role is required"),
  resumeId: z.string().nullable().default(null),
  appliedOn: z.string().nullable().default(null),
  status: z.enum(APPLICATION_STATUSES).default("saved"),
  jobUrl: z.union([z.url(), z.literal("")]).default(""),
  notes: trimmed(2000).default(""),
});
export type ApplicationInput = z.infer<typeof applicationInputSchema>;

export interface CoverLetter {
  id: string;
  userId: string;
  resumeId: string | null;
  company: string;
  role: string;
  body: string;
  createdAt: string;
}

/** Plain text rendering of resume content (used for ATS scoring and AI prompts). */
export function contentToPlainText(c: ResumeContent): string {
  const parts: string[] = [];
  const b = c.basics;
  parts.push([b.fullName, b.headline, b.location].filter(Boolean).join(" | "));
  if (c.summary) parts.push(c.summary);
  for (const e of c.experience) {
    parts.push(`${e.title} at ${e.company} (${e.startDate} - ${e.current ? "Present" : e.endDate})`);
    parts.push(...e.bullets);
  }
  for (const ed of c.education) parts.push(`${ed.degree} ${ed.field} ${ed.institution} ${ed.details}`);
  if (c.skills.length) parts.push(`Skills: ${c.skills.join(", ")}`);
  for (const p of c.projects) parts.push(`${p.name} ${p.role}`, ...p.bullets);
  for (const ct of c.certifications) parts.push(`${ct.name} ${ct.issuer}`);
  parts.push(...c.achievements);
  if (c.additional) parts.push(c.additional);
  return parts.filter(Boolean).join("\n");
}
