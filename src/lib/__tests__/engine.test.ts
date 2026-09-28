import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import { heuristicJobAnalysis } from "@/lib/ats/extract";
import { scoreResume, totalYearsOfExperience, parseResumeDate } from "@/lib/ats/score";
import { guardRewrite, guardTailoring, inventedNumbers, MISSING_SKILL_NOTE } from "@/lib/ai/guardrails";
import { heuristicProvider, strengthenOpener, heuristicParseResume } from "@/lib/ai/providers/heuristic";
import { applyTailoring } from "@/lib/ai/engine";
import { DEMO_PROFILE, SAMPLE_JD_DELOITTE, SAMPLE_JD_PG } from "@/lib/demo/samples";
import { profileToContent } from "@/lib/resume/schema";
import { tailoringResultSchema } from "@/lib/ai/schemas";

const content = profileToContent(DEMO_PROFILE);

describe("job analysis (heuristic)", () => {
  it("extracts title, company, skills, education and years from the Deloitte JD", () => {
    const a = heuristicJobAnalysis(SAMPLE_JD_DELOITTE);
    expect(a.job_title).toBe("Senior Business Analyst");
    expect(a.company).toBe("Deloitte");
    expect(a.seniority).toBe("senior");
    expect(a.years_experience.min).toBe(2);
    expect(a.education_requirements).toContain("MBA (preferred)");
    for (const s of ["Excel", "PowerPoint", "Data Analysis", "Business Strategy"]) expect(a.required_skills).toContain(s);
    expect(a.soft_skills).toContain("Stakeholder Management");
  });

  it("separates preferred skills", () => {
    const a = heuristicJobAnalysis(SAMPLE_JD_PG);
    expect(a.preferred_skills).toEqual(expect.arrayContaining(["Google Analytics", "SQL"]));
    expect(a.years_experience).toEqual({ min: 1, max: 3 });
  });
});

describe("ATS scoring", () => {
  it("scores the demo profile highly against a matching JD and reports breakdown", () => {
    const report = scoreResume(content, heuristicJobAnalysis(SAMPLE_JD_DELOITTE));
    expect(report.overall).toBeGreaterThan(70);
    expect(report.breakdown.education).toBe(100);
    expect(report.strongMatches).toContain("Excel");
  });

  it("parses dates and merges overlapping experience", () => {
    expect(parseResumeDate("Jun 2021")).toBeCloseTo(2021 + 5 / 12);
    const years = totalYearsOfExperience(content, new Date("2024-07-01"));
    expect(years).toBeGreaterThan(3.5);
    expect(years).toBeLessThan(5);
  });
});

describe("truthfulness guardrails", () => {
  it("detects invented metrics", () => {
    expect(inventedNumbers("Grew revenue 40%", "Grew revenue")).toEqual(["40"]);
    expect(inventedNumbers("Cut costs 8%", "identifying 8% cost savings")).toEqual([]);
  });

  it("rejects rewrites that add numbers", () => {
    const out = guardRewrite("Built dashboards for sales", { text: "Built 12 dashboards for sales, boosting revenue 30%", notes: [] }, "");
    expect(out.text).toBe("Built dashboards for sales");
    expect(out.notes[0]).toMatch(/discarded/);
  });

  it("moves unsupported skills to missing and strips invented skills from ordering", () => {
    const raw = tailoringResultSchema.parse({
      required_skills: ["Excel", "Tableau"],
      matched_skills: ["Excel", "Tableau"],
      skills_order: ["Tableau", "Excel"],
      skill_recommendations: [{ skill: "Tableau", action: "add_from_profile", reason: "" }],
      experience_recommendations: [
        { experience_id: "exp_demo_1", bullet_index: 1, suggested: "Built 25 PowerPoint decks for the CXO team", reason: "" },
        { experience_id: "nope", bullet_index: 0, suggested: "x", reason: "" },
      ],
    });
    const g = guardTailoring(raw, content);
    expect(g.matched_skills).toEqual(["Excel"]);
    expect(g.missing_skills).toEqual(["Tableau"]);
    expect(g.skills_order).toEqual(["Excel"]);
    expect(g.skill_recommendations.find((r) => r.skill === "Tableau")).toMatchObject({ action: "missing", reason: MISSING_SKILL_NOTE });
    expect(g.experience_recommendations).toHaveLength(0);
  });
});

describe("heuristic tailoring", () => {
  it("never adds skills the candidate lacks and improves the score", async () => {
    const analysis = heuristicJobAnalysis(SAMPLE_JD_PG);
    const raw = await heuristicProvider.tailor({ profile: content, analysis, jobDescription: SAMPLE_JD_PG, yearsOfExperience: 4 });
    const g = guardTailoring(raw, content);
    const tailored = applyTailoring(content, g, analysis);
    for (const s of tailored.skills) expect(JSON.stringify(content).toLowerCase()).toContain(s.toLowerCase().split(" ")[0]);
    expect(scoreResume(tailored, analysis).overall).toBeGreaterThanOrEqual(scoreResume(content, analysis).overall);
  });

  it("strengthens weak openers", () => {
    expect(strengthenOpener("Responsible for managing vendor payments")).toBe("Managed vendor payments");
    expect(strengthenOpener("Helped the team launch a product.")).toBe("Supported the team launch a product");
  });
});

describe("resume parsing (heuristic)", () => {
  it("extracts contact info, experience and skills", () => {
    const p = heuristicParseResume(`Rohan Verma
rohan@example.com | +91 99999 88888 | linkedin.com/in/rohanv

Experience
Financial Analyst at Axis Bank  Jul 2021 - Present
- Built financial models for 15 corporate clients
- Prepared monthly MIS reports

Education
MBA Finance, IIM Indore, 2019 - 2021

Skills
Excel, Financial Modeling, Valuation, SQL`);
    expect(p.basics.email).toBe("rohan@example.com");
    expect(p.basics.fullName).toBe("Rohan Verma");
    expect(p.experience[0]).toMatchObject({ title: "Financial Analyst", company: "Axis Bank", current: true });
    expect(p.experience[0].bullets).toHaveLength(2);
    expect(p.skills).toEqual(["Excel", "Financial Modeling", "Valuation", "SQL"]);
    expect(p.mbaSpecialization).toBe("Finance");
  });
});
