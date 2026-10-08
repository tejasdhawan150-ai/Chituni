import "server-only";
import type { AIProvider } from "../provider";
import { tailoringResultSchema, type ExperienceRecommendation, type JobAnalysis, type SkillRecommendation } from "../schemas";
import { heuristicJobAnalysis } from "@/lib/ats/extract";
import { mentionsSkill } from "@/lib/ats/taxonomy";
import { scoreResume, skillCoverage } from "@/lib/ats/score";
import { contentToPlainText, profileSchema, type ResumeContent } from "@/lib/resume/schema";
import { uid, uniqueCaseInsensitive } from "@/lib/utils";

/**
 * Deterministic, offline provider. Used when no LLM key is configured and as a
 * resilience fallback when the LLM fails. It never generates new facts — it
 * only reorders, rephrases openers and trims wording.
 */

const GERUND_TO_PAST: Record<string, string> = {
  managing: "Managed", analyzing: "Analyzed", analysing: "Analysed", handling: "Handled", creating: "Created", developing: "Developed",
  preparing: "Prepared", building: "Built", leading: "Led", coordinating: "Coordinated", conducting: "Conducted", designing: "Designed",
  driving: "Drove", executing: "Executed", maintaining: "Maintained", monitoring: "Monitored", overseeing: "Oversaw", planning: "Planned",
  running: "Ran", supporting: "Supported", tracking: "Tracked", identifying: "Identified", implementing: "Implemented", improving: "Improved",
  launching: "Launched", owning: "Owned", reviewing: "Reviewed", writing: "Wrote", presenting: "Presented", recruiting: "Recruited",
  onboarding: "Onboarded", generating: "Generated", negotiating: "Negotiated", forecasting: "Forecasted", reporting: "Reported",
};

const FILLER: [RegExp, string][] = [
  [/\bin order to\b/gi, "to"],
  [/\bsuccessfully\s+/gi, ""],
  [/\bwas able to\s+/gi, ""],
  [/\ba number of\b/gi, "several"],
  [/\bvarious\s+/gi, ""],
  [/\bon a (daily|weekly|monthly) basis\b/gi, "$1"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\butilized\b/gi, "used"],
  [/\butilised\b/gi, "used"],
  [/\bin the process of\s+/gi, ""],
  [/\s{2,}/g, " "],
];

export function strengthenOpener(text: string): string {
  let t = text.trim().replace(/\.$/, "");
  const resp = t.match(/^(?:I\s+)?(?:was\s+)?(?:responsible for|tasked with|in charge of|involved in)\s+(\w+)\s*(.*)$/i);
  if (resp) {
    const past = GERUND_TO_PAST[resp[1].toLowerCase()];
    t = past ? `${past} ${resp[2]}` : `Owned ${resp[1]} ${resp[2]}`;
  }
  t = t
    .replace(/^(?:I\s+)?helped (?:to )?(\w)/i, (_, c: string) => `Supported ${c.toLowerCase()}`)
    .replace(/^(?:I\s+)?assisted (?:in|with)\s+/i, "Supported ")
    .replace(/^(?:I\s+)?worked on\s+/i, "Delivered ")
    .replace(/^(?:I\s+)?handled\s+/i, "Managed ")
    .replace(/^I\s+/i, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function removeFiller(text: string) {
  return FILLER.reduce((acc, [re, rep]) => acc.replace(re, rep), text).trim();
}

function relevance(text: string, terms: string[]) {
  return terms.reduce((n, t) => n + (mentionsSkill(text, t) ? 1 : 0), 0);
}

function latestRole(c: ResumeContent) {
  return c.experience[0];
}

const article = (w: string) => (/^[aeiou]/i.test(w) || /^(HR|MBA|SEO|FP&A|MIS|SAP|L&D|FMCG|RM)\b/.test(w) ? "an" : "a");

export function heuristicSummary(profile: ResumeContent, analysis: JobAnalysis, matched: string[]): string {
  const role = latestRole(profile);
  const mba = profile.education.find((e) => /mba|pgdm|pgp/i.test(`${e.degree} ${e.field}`));
  const skills = matched.slice(0, 4);
  const parts: string[] = [];
  const identity = role?.title || profile.basics.headline.split("|")[0].trim() || (mba ? "MBA graduate" : "Business professional");
  const mbaText = mba ? ` with ${/pgdm|pgp/i.test(mba.degree) ? `a ${mba.degree}` : "an MBA"}${mba.field ? ` in ${mba.field}` : ""}` : "";
  const where = role?.company ? `, ${role.current ? "currently at" : "most recently at"} ${role.company}` : "";
  parts.push(`${identity}${mbaText}${where}.`);
  if (skills.length) parts.push(`Brings hands-on experience in ${skills.length > 1 ? `${skills.slice(0, -1).join(", ")} and ${skills[skills.length - 1]}` : skills[0]}.`);
  if (analysis.job_title)
    parts.push(`Seeking to contribute as ${article(analysis.job_title)} ${analysis.job_title}${analysis.company ? ` at ${analysis.company}` : ""}, applying a structured, data-driven approach to deliver business outcomes.`);
  else parts.push("Known for a structured, data-driven approach and clear communication with stakeholders.");
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export const heuristicProvider: AIProvider = {
  name: "heuristic",

  async analyzeJob(jd) {
    return heuristicJobAnalysis(jd);
  },

  async tailor({ profile, analysis }) {
    const text = contentToPlainText(profile);
    const { matched, missing } = skillCoverage(text, analysis);
    const jobTerms = uniqueCaseInsensitive([...analysis.required_skills, ...analysis.preferred_skills, ...analysis.keywords]);

    // Skills: profile skills ordered by relevance; evidenced-but-unlisted skills recommended.
    const skillsOrder = [...profile.skills].sort((a, b) => relevance(b, jobTerms) - relevance(a, jobTerms));
    const listed = profile.skills.join(" , ");
    const skillRecs: SkillRecommendation[] = [];
    for (const s of matched) {
      if (!mentionsSkill(listed, s)) {
        skillRecs.push({ skill: s, action: "add_from_profile", reason: "Your experience shows this skill but it isn't in your skills list." });
        skillsOrder.unshift(s);
      } else skillRecs.push({ skill: s, action: "highlight", reason: "Required by the job — moved higher in your skills list." });
    }
    for (const s of missing) skillRecs.push({ skill: s, action: "missing", reason: "" });

    // Bullet rewrites: fix weak openers and trim filler.
    const expRecs: ExperienceRecommendation[] = [];
    for (const e of profile.experience) {
      e.bullets.forEach((b, i) => {
        const suggested = removeFiller(strengthenOpener(b));
        if (suggested && suggested !== b.trim().replace(/\.$/, "")) {
          expRecs.push({ experience_id: e.id, bullet_index: i, original: b, suggested, reason: "Stronger action verb and tighter wording." });
        }
      });
    }

    const current = scoreResume(profile, analysis);
    const changes = [
      { section: "Summary", description: "Rewrote professional summary to target this role using your real experience." },
      { section: "Skills", description: "Reordered skills so the ones this job asks for appear first." },
      { section: "Experience", description: "Reordered bullets to lead with the most relevant achievements." },
    ];
    if (expRecs.length) changes.push({ section: "Experience", description: `Strengthened ${expRecs.length} achievement statement(s) with action verbs.` });
    if (skillRecs.some((r) => r.action === "add_from_profile")) changes.push({ section: "Skills", description: "Added skills already evidenced in your experience." });

    return tailoringResultSchema.parse({
      job_title: analysis.job_title,
      company: analysis.company,
      seniority: analysis.seniority,
      required_skills: analysis.required_skills,
      preferred_skills: analysis.preferred_skills,
      keywords: analysis.keywords,
      responsibilities: analysis.responsibilities,
      matched_skills: matched,
      missing_skills: missing,
      match_score: current.overall,
      summary: heuristicSummary(profile, analysis, matched),
      experience_recommendations: expRecs.slice(0, 20),
      skill_recommendations: skillRecs,
      resume_changes: changes,
      skills_order: uniqueCaseInsensitive(skillsOrder),
    });
  },

  async parseResume(text) {
    return heuristicParseResume(text);
  },
};

const SECTION_HEADS: [RegExp, string][] = [
  [/^(professional\s+)?(summary|profile|objective|about me)$/i, "summary"],
  [/^(work\s+|professional\s+)?(experience|employment( history)?|work history)$/i, "experience"],
  [/^(education|academic(s| qualifications)?|qualifications)$/i, "education"],
  [/^(key\s+|technical\s+|core\s+)?(skills|competencies|core competencies|skills & tools)$/i, "skills"],
  [/^(academic\s+|key\s+)?projects$/i, "projects"],
  [/^(certifications?|licenses?( & certifications)?|courses)$/i, "certifications"],
  [/^(achievements|awards|honors|awards & achievements|accomplishments|positions of responsibility)$/i, "achievements"],
  [/^(additional information|interests|languages|extra[- ]curricular( activities)?|hobbies)$/i, "additional"],
];

const DATE_RANGE = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4})\s*(?:-|–|—|to)\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4}|present|current|till date|now)/i;

/**
 * Find the candidate's name near the top. Handles PDFs where the name runs
 * into the headline ("Aanya KapoorBusiness Analyst | MBA") and skips section
 * headings like "PROFESSIONAL SUMMARY".
 */
function guessName(lines: string[]): string {
  const looksLikeName = (t: string) =>
    /^[A-Za-z][A-Za-z.' -]{2,50}$/.test(t) && t.split(/\s+/).length >= 2 && t.split(/\s+/).length <= 5 && !SECTION_HEADS.some(([re]) => re.test(t)) && !/@|\d/.test(t);
  for (const raw of lines.slice(0, 6)) {
    const first = raw.split(/\s[|•·,–—-]\s|\s{2,}|\t/)[0].trim();
    const glued = first.split(/(?<=[a-z])(?=[A-Z][a-z])/);
    // "Aanya KapoorBusiness Analyst" → "Aanya Kapoor"
    if (glued.length > 1 && looksLikeName(glued[0])) return glued[0];
    if (looksLikeName(first)) return first;
  }
  return "";
}

/** Best-effort structural parse without an LLM. Users review the result before saving. */
export function heuristicParseResume(raw: string) {
  const text = raw.replace(/\r/g, "");
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] ?? "";
  const phone = text.match(/(\+?\d[\d\s-]{8,14}\d)/)?.[0]?.trim() ?? "";
  const linkedin = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?/i)?.[0] ?? "";
  const fullName = guessName(lines);

  const sections: Record<string, string[]> = {};
  let current = "header";
  for (const l of lines) {
    const norm = l.replace(/[:\-–—_|]+$/, "").trim();
    const head = norm.length < 45 ? SECTION_HEADS.find(([re]) => re.test(norm)) : undefined;
    if (head) {
      current = head[1];
      continue;
    }
    (sections[current] ??= []).push(l);
  }
  const bulletClean = (l: string) => l.replace(/^[-*•·●▪◦‣–>]+\s*/, "").trim();

  // Experience: a date-range line starts a new role; the preceding/next non-bullet lines are title/company.
  const experience: ResumeContent["experience"] = [];
  const expLines = sections.experience ?? [];
  for (let i = 0; i < expLines.length; i++) {
    const l = expLines[i];
    const dm = l.match(DATE_RANGE);
    const isBullet = /^[-*•·●▪◦‣–>]/.test(l);
    if (dm && !isBullet) {
      const header = l.replace(DATE_RANGE, "").replace(/[|,–—-]\s*$/, "").trim();
      const prev = experience.length === 0 || experience[experience.length - 1].bullets.length > 0 ? expLines[i - 1] : undefined;
      const [a, b] = header.split(/\s+(?:at|@|\||,|–|—|-)\s+/);
      experience.push({
        id: uid("exp"),
        title: a || (prev && !/^[-*•]/.test(prev) ? prev : ""),
        company: b || "",
        location: "",
        startDate: dm[1],
        endDate: /present|current|now|till/i.test(dm[2]) ? "" : dm[2],
        current: /present|current|now|till/i.test(dm[2]),
        bullets: [],
      });
    } else if (experience.length) {
      const last = experience[experience.length - 1];
      if (isBullet || l.length > 60) last.bullets.push(bulletClean(l));
      else if (!last.company) last.company = l;
      else if (!last.title) last.title = l;
    }
  }

  const education: ResumeContent["education"] = [];
  for (const l of sections.education ?? []) {
    if (/\b(mba|pgdm|pgp|b\.?tech|b\.?e|b\.?com|bba|b\.?sc|m\.?sc|m\.?tech|bachelor|master|ca|cfa)\b/i.test(l)) {
      const dm = l.match(DATE_RANGE) ?? l.match(/(\d{4})/);
      education.push({
        id: uid("edu"),
        degree: l.replace(DATE_RANGE, "").split(/[,|–—]/)[0].trim(),
        field: "",
        institution: l.split(/[,|–—]/)[1]?.replace(DATE_RANGE, "").trim() ?? "",
        startDate: dm && dm[2] ? dm[1] : "",
        endDate: dm ? (dm[2] ?? dm[1]) : "",
        grade: l.match(/(cgpa|gpa|%)\s*[:\-]?\s*[\d.]+|[\d.]+\s*(cgpa|gpa|%)/i)?.[0] ?? "",
        details: "",
      });
    } else if (education.length && !education[education.length - 1].institution) {
      education[education.length - 1].institution = l;
    }
  }

  const skillsRaw = (sections.skills ?? []).join(", ").replace(/^[^:]*:\s*/gm, "");
  const skills = uniqueCaseInsensitive(
    skillsRaw
      .split(/[,;|•·]/)
      .map((s) => s.replace(/^[^:]{0,30}:\s*/, "").trim())
      .filter((s) => s.length > 1 && s.length < 50),
  );

  const specMatch = text.match(/mba[^\n]{0,40}?(marketing|finance|hr|human resources|operations|business analytics|analytics|strategy|international business|entrepreneurship|product)/i);
  const specMap: Record<string, string> = {
    marketing: "Marketing", finance: "Finance", hr: "HR", "human resources": "HR", operations: "Operations", "business analytics": "Business Analytics",
    analytics: "Business Analytics", strategy: "Strategy", "international business": "International Business", entrepreneurship: "Entrepreneurship", product: "Product Management",
  };

  return profileSchema.parse({
    basics: { fullName, email, phone, linkedinUrl: linkedin, headline: "", location: "", website: "" },
    summary: (sections.summary ?? []).join(" ").slice(0, 2000),
    experience: experience.slice(0, 20),
    education: education.slice(0, 10),
    skills: skills.slice(0, 80),
    projects: (sections.projects ?? []).length
      ? [{ id: uid("proj"), name: bulletClean(sections.projects![0]), role: "", bullets: sections.projects!.slice(1).map(bulletClean).slice(0, 8) }]
      : [],
    certifications: (sections.certifications ?? []).slice(0, 20).map((l) => ({ id: uid("cert"), name: bulletClean(l).slice(0, 200), issuer: "", date: "" })),
    achievements: (sections.achievements ?? []).map(bulletClean).slice(0, 20),
    additional: (sections.additional ?? []).join("; ").slice(0, 1500),
    mbaSpecialization: specMatch ? (specMap[specMatch[1].toLowerCase()] ?? "") : "",
  });
}
