import type { JobAnalysis } from "@/lib/ai/schemas";
import { contentToPlainText, type ResumeContent } from "@/lib/resume/schema";
import { EDUCATION_TERMS, mentionsSkill } from "./taxonomy";
import { clamp, uniqueCaseInsensitive } from "@/lib/utils";

/**
 * Deterministic ATS-style scoring engine.
 *
 * IMPORTANT: this is an internal matching estimate designed to approximate how
 * keyword-based applicant tracking systems evaluate a resume against a job.
 * It is NOT a guarantee of passing any specific ATS.
 */

export const ATS_DISCLAIMER =
  "This score is DreamJobResume's internal matching estimate based on keywords, skills, experience and formatting. It is not a guarantee of passing any employer's applicant tracking system.";

export const ATS_WEIGHTS = { keywords: 0.3, experience: 0.25, skills: 0.25, formatting: 0.1, education: 0.1 } as const;

export interface AtsCheck {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
}

export interface AtsReport {
  overall: number;
  breakdown: { keywords: number; experience: number; skills: number; formatting: number; education: number };
  strongMatches: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  checks: AtsCheck[];
  yearsOfExperience: number | null;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Parses "Jun 2021", "06/2021", "2021-06", "2021" → fractional year. */
export function parseResumeDate(s: string, now = new Date()): number | null {
  const t = s.trim().toLowerCase();
  if (!t) return null;
  if (/present|current|now|till date|ongoing/.test(t)) return now.getFullYear() + now.getMonth() / 12;
  const year = t.match(/(19|20)\d{2}/);
  if (!year) return null;
  const y = Number(year[0]);
  let m = 0;
  const named = MONTHS.findIndex((mm) => t.includes(mm));
  if (named >= 0) m = named;
  else {
    const num = t.match(/\b(0?[1-9]|1[0-2])\s*[/\-.]\s*(19|20)\d{2}|(19|20)\d{2}\s*[/\-.]\s*(0?[1-9]|1[0-2])\b/);
    if (num) m = Number(num[1] ?? num[4]) - 1;
  }
  return y + m / 12;
}

export function totalYearsOfExperience(content: ResumeContent, now = new Date()): number | null {
  const spans: [number, number][] = [];
  for (const e of content.experience) {
    const start = parseResumeDate(e.startDate, now);
    const end = e.current ? parseResumeDate("present", now) : parseResumeDate(e.endDate, now);
    if (start !== null && end !== null && end >= start) spans.push([start, end]);
  }
  if (!spans.length) return null;
  // Merge overlapping spans so concurrent roles are not double counted.
  spans.sort((a, b) => a[0] - b[0]);
  let total = 0;
  let [cs, ce] = spans[0];
  for (const [s, e] of spans.slice(1)) {
    if (s <= ce) ce = Math.max(ce, e);
    else {
      total += ce - cs;
      [cs, ce] = [s, e];
    }
  }
  total += ce - cs;
  return Math.round(total * 10) / 10;
}

const WEAK_OPENERS = /^(responsible for|worked on|helped|assisted|involved in|duties included|tasked with|handled)\b/i;
const STOP = new Set("the and for with from that this into over your will have has are was were our their them they using used across within team teams role work working ensure support".split(" "));

function stems(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w))
      .map((w) => w.slice(0, 6)),
  );
}

function wordCount(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

export function skillCoverage(text: string, analysis: JobAnalysis) {
  const wanted = uniqueCaseInsensitive([...analysis.required_skills, ...analysis.preferred_skills]);
  const matched = wanted.filter((s) => mentionsSkill(text, s));
  const missing = wanted.filter((s) => !matched.includes(s));
  return { wanted, matched, missing };
}

export function scoreResume(content: ResumeContent, analysis: JobAnalysis, opts: { atsSafeTemplate?: boolean; now?: Date } = {}): AtsReport {
  const text = contentToPlainText(content);
  const skillsText = content.skills.join(" , ");

  // 1. Keywords (required skills weighted 2x)
  const required = uniqueCaseInsensitive(analysis.required_skills);
  const others = uniqueCaseInsensitive([...analysis.preferred_skills, ...analysis.keywords, ...analysis.soft_skills]).filter(
    (k) => !required.some((r) => r.toLowerCase() === k.toLowerCase()),
  );
  let kwTotal = 0;
  let kwHit = 0;
  const strong: string[] = [];
  const missingKw: string[] = [];
  for (const k of required) {
    kwTotal += 2;
    if (mentionsSkill(text, k)) {
      kwHit += 2;
      strong.push(k);
    } else missingKw.push(k);
  }
  for (const k of others) {
    kwTotal += 1;
    if (mentionsSkill(text, k)) {
      kwHit += 1;
      strong.push(k);
    } else missingKw.push(k);
  }
  const keywords = kwTotal ? (kwHit / kwTotal) * 100 : 70;

  // 2. Skills (listed in skills section = full credit, elsewhere = partial)
  const { wanted, matched, missing } = skillCoverage(text, analysis);
  let skillPts = 0;
  for (const s of matched) skillPts += mentionsSkill(skillsText, s) ? 1 : 0.75;
  const skills = wanted.length ? (skillPts / wanted.length) * 100 : 70;

  // 3. Experience relevance: responsibility overlap + years
  const expText = content.experience.flatMap((e) => [e.title, ...e.bullets]).concat(content.projects.flatMap((p) => p.bullets)).join(" ");
  const expStems = stems(expText);
  const resp = analysis.responsibilities;
  let respScore = 0.7;
  if (resp.length) {
    const covered = resp.filter((r) => {
      const rs = [...stems(r)];
      const overlap = rs.filter((w) => expStems.has(w)).length;
      return overlap >= Math.min(2, rs.length);
    }).length;
    respScore = covered / resp.length;
  }
  const years = totalYearsOfExperience(content, opts.now);
  const minYears = analysis.years_experience.min;
  let yearsScore = 0.85;
  if (minYears !== null && minYears > 0) yearsScore = years === null ? 0.6 : clamp(years / minYears, 0, 1);
  else if (minYears === 0) yearsScore = 1;
  const titleBoost = analysis.job_title && content.experience.some((e) => mentionsSkill(e.title, analysis.job_title.replace(/^(senior|sr\.?|junior|jr\.?)\s+/i, ""))) ? 0.08 : 0;
  const experience = clamp((0.6 * respScore + 0.4 * yearsScore + titleBoost) * 100, 0, 100);

  // 4. Education
  const eduText = content.education.map((e) => `${e.degree} ${e.field} ${e.institution} ${e.details}`).join(" ") + " " + content.certifications.map((c) => c.name).join(" ");
  let education = 100;
  for (const req of analysis.education_requirements) {
    const preferred = /preferred/i.test(req);
    const name = req.replace(/\(preferred\)/i, "").trim();
    const term = EDUCATION_TERMS.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const has = term ? term.patterns.some((p) => p.test(eduText)) : eduText.toLowerCase().includes(name.toLowerCase());
    if (!has) education -= preferred ? 10 : 35;
  }
  if (!content.education.length) education = Math.min(education, 40);
  education = clamp(education, 0, 100);

  // 5. Formatting / ATS hygiene
  const bullets = content.experience.flatMap((e) => e.bullets).filter(Boolean);
  const summaryWords = wordCount(content.summary);
  const totalWords = wordCount(text);
  const checks: AtsCheck[] = [
    { id: "template", label: "ATS-safe single-column template", passed: opts.atsSafeTemplate !== false },
    { id: "contact", label: "Email and phone number present", passed: !!content.basics.email && !!content.basics.phone },
    { id: "linkedin", label: "LinkedIn profile URL included", passed: !!content.basics.linkedinUrl },
    { id: "summary", label: "Professional summary (30–120 words)", passed: summaryWords >= 30 && summaryWords <= 120, detail: `${summaryWords} words` },
    { id: "bullets", label: "Every role has achievement bullets", passed: content.experience.length > 0 && content.experience.every((e) => e.bullets.filter(Boolean).length >= 2) },
    {
      id: "bullet-length",
      label: "Bullets are concise (under 40 words)",
      passed: bullets.every((b) => wordCount(b) <= 40),
      detail: `${bullets.filter((b) => wordCount(b) > 40).length} long bullet(s)`,
    },
    {
      id: "action-verbs",
      label: "Bullets start with strong action verbs",
      passed: bullets.filter((b) => WEAK_OPENERS.test(b)).length === 0,
      detail: `${bullets.filter((b) => WEAK_OPENERS.test(b)).length} weak opener(s) like "Responsible for"`,
    },
    { id: "quantified", label: "Achievements are quantified", passed: bullets.length > 0 && bullets.filter((b) => /\d/.test(b)).length / bullets.length >= 0.4 },
    { id: "dates", label: "Dates present for every role", passed: content.experience.every((e) => !!e.startDate && (e.current || !!e.endDate)) },
    { id: "length", label: "Length fits 1–2 pages", passed: totalWords >= 150 && totalWords <= 1100, detail: `${totalWords} words` },
    { id: "skills-section", label: "Dedicated skills section", passed: content.skills.length >= 5 },
  ];
  const formatting = (checks.filter((c) => c.passed).length / checks.length) * 100;

  const breakdown = {
    keywords: Math.round(keywords),
    experience: Math.round(experience),
    skills: Math.round(skills),
    formatting: Math.round(formatting),
    education: Math.round(education),
  };
  const overall = Math.round(
    breakdown.keywords * ATS_WEIGHTS.keywords +
      breakdown.experience * ATS_WEIGHTS.experience +
      breakdown.skills * ATS_WEIGHTS.skills +
      breakdown.formatting * ATS_WEIGHTS.formatting +
      breakdown.education * ATS_WEIGHTS.education,
  );

  return {
    overall: clamp(overall, 0, 100),
    breakdown,
    strongMatches: uniqueCaseInsensitive(strong),
    missingKeywords: uniqueCaseInsensitive(missingKw),
    matchedSkills: matched,
    missingSkills: missing,
    checks,
    yearsOfExperience: years,
  };
}
