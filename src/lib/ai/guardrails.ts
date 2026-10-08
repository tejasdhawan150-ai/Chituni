import type { ResumeContent } from "@/lib/resume/schema";
import { contentToPlainText } from "@/lib/resume/schema";
import { mentionsSkill } from "@/lib/ats/taxonomy";
import type { TailoringResult } from "./schemas";
import { uniqueCaseInsensitive } from "@/lib/utils";

/**
 * Truthfulness guardrails. These run on EVERY AI output, regardless of the
 * provider, and enforce the product's core rule: the AI may improve wording
 * and presentation of real experience but must never invent experience,
 * titles, companies, degrees, certifications, skills, achievements or metrics.
 */

export const MISSING_SKILL_NOTE = "Missing skill — consider adding this only if you genuinely have experience with it.";

/** Numbers/metrics that appear in `text` (e.g. "35%", "₹2 Cr", "12", "3x"). */
export function extractNumbers(text: string): string[] {
  return (text.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => n.replace(/,/g, ""));
}

/** Returns numbers present in `candidate` that do not exist in the `source` text. */
export function inventedNumbers(candidate: string, source: string): string[] {
  const allowed = new Set(extractNumbers(source));
  return extractNumbers(candidate).filter((n) => !allowed.has(n));
}

/** Proper-noun-ish tokens (organisations / tools) in candidate that are absent from source. */
export function inventedProperNouns(candidate: string, source: string): string[] {
  const src = source.toLowerCase();
  const words = candidate.match(/\b[A-Z][a-zA-Z0-9&]{2,}(?:\s+[A-Z][a-zA-Z0-9&]{2,})*\b/g) ?? [];
  const sentenceStarts = new Set(candidate.split(/(?<=[.!?;])\s+|\n/).map((s) => s.trim().split(/\s+/)[0]));
  return words.filter((w) => !sentenceStarts.has(w.split(/\s+/)[0]) && !src.includes(w.toLowerCase()));
}

/**
 * Enforce truthfulness on a tailoring result against the user's real profile:
 *  - matched skills must actually appear in the profile text
 *  - skills_order may only contain skills from the profile
 *  - "add_from_profile" skill recommendations must exist in the profile; otherwise → "missing"
 *  - experience recommendations must target a real experience entry and not add numbers/names
 */
export function guardTailoring(result: TailoringResult, profile: ResumeContent, derivedFacts = ""): TailoringResult {
  // derivedFacts: facts computed from the profile (e.g. "4 years of experience") that may legitimately appear in output.
  const profileText = `${contentToPlainText(profile)}\n${derivedFacts}`;
  const expById = new Map(profile.experience.map((e) => [e.id, e]));

  const wanted = uniqueCaseInsensitive([...result.required_skills, ...result.preferred_skills, ...result.matched_skills, ...result.missing_skills]);
  const matched = wanted.filter((s) => mentionsSkill(profileText, s));
  const missing = wanted.filter((s) => !matched.some((m) => m.toLowerCase() === s.toLowerCase()));

  const profileSkillsLower = new Map(profile.skills.map((s) => [s.toLowerCase(), s]));
  const skillsOrder = uniqueCaseInsensitive(
    result.skills_order
      .map((s) => profileSkillsLower.get(s.toLowerCase()) ?? (mentionsSkill(profileText, s) ? s : null))
      .filter((s): s is string => !!s),
  );

  const skillRecs = result.skill_recommendations.map((r) => {
    if ((r.action === "add_from_profile" || r.action === "highlight") && !mentionsSkill(profileText, r.skill)) {
      return { ...r, action: "missing" as const, reason: MISSING_SKILL_NOTE };
    }
    if (r.action === "missing") return { ...r, reason: MISSING_SKILL_NOTE };
    return r;
  });
  for (const m of missing) {
    if (!skillRecs.some((r) => r.skill.toLowerCase() === m.toLowerCase())) skillRecs.push({ skill: m, action: "missing", reason: MISSING_SKILL_NOTE });
  }

  const expRecs = result.experience_recommendations.flatMap((r) => {
    const exp = expById.get(r.experience_id);
    if (!exp) return [];
    const original = r.bullet_index !== null ? (exp.bullets[r.bullet_index] ?? "") : r.original;
    const source = `${original}\n${exp.title} ${exp.company}\n${profileText}`;
    if (inventedNumbers(r.suggested, source).length) return [];
    if (inventedProperNouns(r.suggested, source).length > 1) return [];
    return [{ ...r, original }];
  });

  // Summary: drop if it invents numbers or names.
  const summaryOk = !inventedNumbers(result.summary, profileText).length && inventedProperNouns(result.summary, `${profileText} ${result.company} ${result.job_title}`).length <= 1;

  return {
    ...result,
    matched_skills: matched,
    missing_skills: missing,
    skills_order: skillsOrder,
    skill_recommendations: skillRecs,
    experience_recommendations: expRecs,
    summary: summaryOk ? result.summary : "",
  };
}
