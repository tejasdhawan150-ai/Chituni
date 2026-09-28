import type { JobAnalysis } from "@/lib/ai/schemas";
import { jobAnalysisSchema } from "@/lib/ai/schemas";
import { EDUCATION_TERMS, detectSkills } from "./taxonomy";
import { uniqueCaseInsensitive } from "@/lib/utils";

/**
 * Deterministic job-description analysis. Used directly by the heuristic AI
 * provider and to enrich/validate LLM output (so a flaky model can never
 * produce an empty analysis).
 */

const PREFERRED_MARKERS = /\b(preferred|nice to have|good to have|bonus|a plus|desirable|advantage|advantageous)\b/i;
const REQUIRED_HEADERS = /^(requirements|qualifications|what you('| wi)ll need|must have|what we('| a)re looking for|skills|who you are|required)/i;
const RESP_HEADERS = /^(responsibilities|what you('| wi)ll do|the role|role|key responsibilities|your impact|job description|about the role|duties)/i;

const SENIORITY_RULES: [RegExp, JobAnalysis["seniority"]][] = [
  [/\b(intern|internship|trainee)\b/i, "intern"],
  [/\b(director|head of|vp|vice president)\b/i, "director"],
  [/\b(manager|mgr)\b/i, "manager"],
  [/\b(lead|principal|staff)\b/i, "lead"],
  [/\b(senior|sr\.?)\b/i, "senior"],
  [/\b(associate)\b/i, "associate"],
  [/\b(junior|jr\.?|graduate|fresher|entry[- ]level|analyst)\b/i, "entry"],
];

function splitLines(jd: string): string[] {
  return jd
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function stripBullet(l: string) {
  return l.replace(/^[-*•·●▪◦‣–—>]+\s*|^\d+[.)]\s*/, "").trim();
}

function isBullet(l: string) {
  return /^([-*•·●▪◦‣–—>]|\d+[.)])\s*/.test(l);
}

/** "We need someone to analyze data, build decks and support leaders." → ["Analyze data", "Build decks", "Support leaders"] */
function splitDuties(sentence: string): string[] {
  const s = sentence.trim().replace(/\.$/, "");
  const commas = (s.match(/,/g) ?? []).length;
  if (commas < 2) return [s];
  const tail = s.replace(/^.*?\bto\s+(?=[a-z])/i, "");
  return tail
    .split(/,\s*(?:and\s+)?|\s+and\s+(?=[a-z]+\s)/i)
    .map((x) => x.trim())
    .filter((x) => x.split(/\s+/).length >= 2)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1));
}

export function guessTitleAndCompany(lines: string[]): { title: string; company: string } {
  let title = "";
  let company = "";
  const titleLike = /(analyst|manager|consultant|associate|executive|specialist|lead|director|engineer|partner|officer|coordinator|intern|head|strategist|advisor|representative)/i;
  for (const l of lines.slice(0, 6)) {
    const at = l.match(/^(.{3,80}?)\s+(?:at|@|-|–|—|\|)\s+(.{2,60})$/i);
    if (!title && at && titleLike.test(at[1])) {
      title = at[1].trim();
      company = at[2].trim();
      break;
    }
    if (!title && titleLike.test(l) && l.length <= 80 && !/[.:]$/.test(l)) {
      title = l;
      continue;
    }
    if (title && !company && l.length <= 60 && !/[.:]$/.test(l) && /^[A-Z0-9&]/.test(l) && !/^(about|we |our |the |location|job|full)/i.test(l)) {
      company = l.replace(/\s*[·•|].*$/, "").trim();
      break;
    }
  }
  if (!company) {
    const m = lines.join(" ").match(/\b(?:at|join)\s+([A-Z][A-Za-z0-9&.\- ]{1,40}?)(?:,|\.|\s+(?:we|is|are|as|to)\b)/);
    if (m) company = m[1].trim();
  }
  return { title, company };
}

export function extractYears(jd: string): { min: number | null; max: number | null } {
  const range = jd.match(/(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})\s*\+?\s*(?:years|yrs)/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const plus = jd.match(/(\d{1,2})\s*\+?\s*(?:years|yrs)(?:'|’)?\s*(?:of\s+)?(?:relevant\s+|work\s+|professional\s+)?(?:experience|exp)/i);
  if (plus) return { min: Number(plus[1]), max: null };
  if (/\b(fresher|freshers|no experience required|0 years)\b/i.test(jd)) return { min: 0, max: 1 };
  return { min: null, max: null };
}

const STOP = new Set(
  "a an the and or of to in for with on at by from as is are be will we you your our this that these those it its their they who what which can must should may etc including include within across per into about over able strong good excellent ability experience years year work working role team teams job candidate candidates opportunity company preferred required requirements responsibilities plus using use based also new well other all any more most such like ensure support help".split(
    " ",
  ),
);

const LEADING_VERBS = new Set("manage build work drive lead develop analyze analyse support track present own partner coach create execute deliver identify provide conduct design run".split(" "));

/** Frequent meaningful n-grams (bigrams) that are not already skills — captures industry terminology. */
function frequentPhrases(jd: string, exclude: string[]): string[] {
  const words = jd.toLowerCase().replace(/[^a-z0-9&+\s-]/g, " ").split(/\s+/).filter(Boolean);
  const counts = new Map<string, number>();
  for (let i = 0; i < words.length - 1; i++) {
    const [a, b] = [words[i], words[i + 1]];
    if (STOP.has(a) || STOP.has(b) || LEADING_VERBS.has(a) || a.length < 3 || b.length < 3 || /^\d+$/.test(a) || /^\d+$/.test(b)) continue;
    const k = `${a} ${b}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const ex = exclude.map((e) => e.toLowerCase());
  return [...counts.entries()]
    .filter(([k, n]) => n >= 2 && !ex.some((e) => e.includes(k) || k.includes(e)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k]) => k.replace(/\b\w/g, (c) => c.toUpperCase()));
}

export function heuristicJobAnalysis(jd: string): JobAnalysis {
  const lines = splitLines(jd);
  const { title, company } = guessTitleAndCompany(lines);

  // Split into sections by header lines.
  let mode: "none" | "req" | "resp" = "none";
  const reqLines: string[] = [];
  const respLines: string[] = [];
  const preferredLines: string[] = [];
  for (const raw of lines) {
    const l = stripBullet(raw);
    const header = !isBullet(raw) && l.length < 60 && /:?$/.test(l);
    if (header && REQUIRED_HEADERS.test(l)) {
      mode = "req";
      continue;
    }
    if (header && RESP_HEADERS.test(l)) {
      mode = "resp";
      continue;
    }
    const preferredLine = PREFERRED_MARKERS.test(l);
    if (preferredLine) preferredLines.push(l);
    if (mode === "req" && !preferredLine) reqLines.push(l);
    else if (mode === "resp" || (isBullet(raw) && mode === "none")) respLines.push(l);
  }

  // Sentences mentioning core duties when there are no bullets.
  if (respLines.length === 0) {
    const sentences = jd.split(/(?<=[.;])\s+|\n+/).filter((s) => /\b(will|you'll|responsible|support|analy[sz]e|develop|manage|work with|drive|lead|own)\b/i.test(s));
    respLines.push(...sentences.slice(0, 8).flatMap(splitDuties));
  }

  const all = detectSkills(jd);
  const preferredText = preferredLines.join(" ");
  const preferredSet = new Set(detectSkills(preferredText).map((s) => s.name));
  const reqText = reqLines.join(" ");
  const reqSet = new Set(detectSkills(reqText).map((s) => s.name));

  const hard = all.filter((s) => s.kind !== "soft");
  const soft = all.filter((s) => s.kind === "soft").map((s) => s.name);

  const required = hard.filter((s) => !preferredSet.has(s.name) || reqSet.has(s.name)).map((s) => s.name);
  const preferred = hard.filter((s) => preferredSet.has(s.name) && !reqSet.has(s.name)).map((s) => s.name);

  const education = EDUCATION_TERMS.filter((e) => e.patterns.some((p) => p.test(jd))).map((e) => {
    const line = lines.find((l) => e.patterns.some((p) => p.test(l)));
    return line && PREFERRED_MARKERS.test(line) ? `${e.name} (preferred)` : e.name;
  });

  const seniorityText = `${title} ${lines.slice(0, 3).join(" ")}`;
  const seniority = SENIORITY_RULES.find(([re]) => re.test(seniorityText))?.[1] ?? "unknown";

  const industry = frequentPhrases(jd, all.map((s) => s.name));
  const location = jd.match(/\b(?:location|based in)\s*[:\-]?\s*([A-Z][A-Za-z ,]{2,40})/)?.[1]?.trim() ?? "";

  return jobAnalysisSchema.parse({
    job_title: title,
    company,
    seniority,
    location,
    years_experience: extractYears(jd),
    education_requirements: education,
    required_skills: required,
    preferred_skills: preferred,
    keywords: uniqueCaseInsensitive([...required, ...preferred, ...soft, ...industry]).slice(0, 40),
    responsibilities: respLines
      .map((r) => r.replace(/\s+/g, " ").slice(0, 200))
      .filter((r) => r.length > 12)
      .slice(0, 12),
    soft_skills: soft,
    industry_terms: industry,
  });
}

/** Merge an LLM analysis with the deterministic one so nothing obvious is dropped. */
export function mergeAnalyses(primary: JobAnalysis, fallback: JobAnalysis): JobAnalysis {
  return jobAnalysisSchema.parse({
    ...primary,
    job_title: primary.job_title || fallback.job_title,
    company: primary.company || fallback.company,
    seniority: primary.seniority === "unknown" ? fallback.seniority : primary.seniority,
    location: primary.location || fallback.location,
    years_experience: primary.years_experience.min === null ? fallback.years_experience : primary.years_experience,
    education_requirements: uniqueCaseInsensitive([...primary.education_requirements, ...fallback.education_requirements]).slice(0, 10),
    required_skills: uniqueCaseInsensitive([...primary.required_skills, ...fallback.required_skills]).slice(0, 40),
    preferred_skills: uniqueCaseInsensitive(primary.preferred_skills.length ? primary.preferred_skills : fallback.preferred_skills).slice(0, 40),
    keywords: uniqueCaseInsensitive([...primary.keywords, ...fallback.keywords]).slice(0, 60),
    responsibilities: primary.responsibilities.length ? primary.responsibilities : fallback.responsibilities,
    soft_skills: uniqueCaseInsensitive([...primary.soft_skills, ...fallback.soft_skills]).slice(0, 20),
    industry_terms: uniqueCaseInsensitive(primary.industry_terms.length ? primary.industry_terms : fallback.industry_terms).slice(0, 30),
  });
}
