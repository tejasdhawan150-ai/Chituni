/**
 * Prompt templates. Kept provider-agnostic: any LLM that can return JSON can use them.
 */

export const TRUTHFULNESS_RULES = `NON-NEGOTIABLE TRUTHFULNESS RULES:
- NEVER invent work experience, job titles, companies, degrees, certifications, skills, achievements, metrics, numbers, dates, tools or clients.
- Only rephrase, reorder, condense and better present facts that already exist in the candidate's data.
- If the job requires something the candidate does not have, list it as missing — do NOT add it to the resume.
- Do not keyword-stuff. Keywords may only be used where they truthfully describe existing experience.
- Never state facts about the hiring company beyond what the job description itself says.`;

export const SYSTEM_PROMPT = `You are DreamJobResume's resume engine: an expert recruiter and resume writer for MBA graduates and early-career professionals (0–7 years) targeting consulting, finance, marketing, HR, operations, product, sales, business development, analytics and general management roles, primarily in India.
Priorities, in order: 1) accuracy 2) truthfulness 3) ATS optimization 4) job relevance 5) conciseness 6) strong achievement-oriented language.
${TRUTHFULNESS_RULES}
Always respond with a single valid JSON object and nothing else.`;

export function jobAnalysisPrompt(jd: string) {
  return `Analyze the job description below and return JSON with exactly these keys:
{
  "job_title": string, "company": string,
  "seniority": one of "intern"|"entry"|"associate"|"mid"|"senior"|"lead"|"manager"|"director"|"unknown",
  "location": string,
  "years_experience": { "min": number|null, "max": number|null },
  "education_requirements": string[],   // e.g. "MBA (preferred)", "Bachelor's degree"
  "required_skills": string[],          // hard skills & tools explicitly required, canonical short names (e.g. "Excel", "Financial Modeling")
  "preferred_skills": string[],         // nice-to-have skills
  "keywords": string[],                 // the 15-30 most important ATS keywords/phrases
  "responsibilities": string[],         // concise list of key duties
  "soft_skills": string[],
  "industry_terms": string[]            // domain terminology used in the JD
}
Use only information present in the text. Use "" / [] / null when unknown.

JOB DESCRIPTION:
"""
${jd}
"""`;
}

export function tailoringPrompt(profileJson: string, analysisJson: string, jd: string) {
  return `Compare the CANDIDATE PROFILE with the JOB and produce tailoring recommendations.

Return JSON with exactly these keys:
{
  "job_title": string, "company": string, "seniority": string,
  "required_skills": string[], "preferred_skills": string[], "keywords": string[], "responsibilities": string[],
  "matched_skills": string[],       // job skills the candidate demonstrably has (present in their data)
  "missing_skills": string[],       // job skills NOT present in candidate data
  "match_score": number,            // 0-100 honest estimate for the CURRENT profile
  "summary": string,                // a 45-90 word professional summary tailored to this role using ONLY candidate facts. No numbers that are not in the candidate data.
  "experience_recommendations": [   // rewrite of existing bullets to better match the role
    { "experience_id": string (id from candidate data), "bullet_index": number, "original": string, "suggested": string, "reason": string }
  ],
  "skill_recommendations": [ { "skill": string, "action": "highlight"|"add_from_profile"|"reorder"|"missing", "reason": string } ],
  "resume_changes": [ { "section": string, "description": string } ],
  "skills_order": string[]          // the candidate's EXISTING skills, reordered by relevance to this job. Never add new skills here.
}

Rules for bullet rewrites: start with a strong action verb, keep under 30 words, keep every original fact and number, add job keywords ONLY where they truthfully describe the same work, never add new metrics. Rewrite at most the 10 most relevant bullets.

${"Use \"add_from_profile\" only for skills that appear in the candidate's experience/projects text but are missing from their skills list."}

CANDIDATE PROFILE (JSON):
${profileJson}

JOB ANALYSIS (JSON):
${analysisJson}

JOB DESCRIPTION:
"""
${jd.slice(0, 8000)}
"""`;
}

export function resumeParsePrompt(text: string) {
  return `Extract the resume below into JSON. Copy facts verbatim — do not embellish, summarise or invent anything. Use "" or [] when absent.
Schema:
{
  "basics": { "fullName": string, "headline": string, "email": string, "phone": string, "location": string, "linkedinUrl": string, "website": string },
  "summary": string,
  "experience": [ { "id": string, "company": string, "title": string, "location": string, "startDate": string, "endDate": string, "current": boolean, "bullets": string[] } ],
  "education": [ { "id": string, "institution": string, "degree": string, "field": string, "startDate": string, "endDate": string, "grade": string, "details": string } ],
  "skills": string[],
  "projects": [ { "id": string, "name": string, "role": string, "bullets": string[] } ],
  "certifications": [ { "id": string, "name": string, "issuer": string, "date": string } ],
  "achievements": string[],
  "additional": string,
  "mbaSpecialization": one of "Marketing"|"Finance"|"HR"|"Operations"|"Business Analytics"|"Strategy"|"International Business"|"Entrepreneurship"|"Product Management"|"",
  "targetRoles": []
}
Use ids like "exp1", "edu1", "proj1", "cert1". Dates as written (e.g. "Jun 2021").

RESUME TEXT:
"""
${text.slice(0, 15000)}
"""`;
}
