/**
 * Curated taxonomy of business / MBA-track skills with aliases.
 * Used by the deterministic ATS engine and the heuristic AI provider to detect
 * skills in job descriptions and resumes. Matching is case-insensitive and
 * word-boundary aware.
 */

export type SkillKind = "hard" | "tool" | "soft" | "domain";

export interface SkillEntry {
  name: string;
  kind: SkillKind;
  aliases?: string[];
}

export const SKILLS: SkillEntry[] = [
  // Analytics & tools
  { name: "Excel", kind: "tool", aliases: ["advanced excel", "ms excel", "microsoft excel", "spreadsheets", "vlookup", "pivot tables"] },
  { name: "PowerPoint", kind: "tool", aliases: ["ms powerpoint", "powerpoint", "presentations", "slide decks", "decks"] },
  { name: "SQL", kind: "tool", aliases: ["mysql", "postgresql", "t-sql", "structured query language"] },
  { name: "Power BI", kind: "tool", aliases: ["powerbi", "power-bi"] },
  { name: "Tableau", kind: "tool" },
  { name: "Python", kind: "tool", aliases: ["pandas", "numpy"] },
  { name: "R Programming", kind: "tool", aliases: ["rstudio", "r language"] },
  { name: "Google Analytics", kind: "tool", aliases: ["ga4", "google analytics 4"] },
  { name: "SAP", kind: "tool", aliases: ["sap erp", "sap fico", "sap s/4hana"] },
  { name: "Salesforce", kind: "tool", aliases: ["sfdc", "salesforce crm"] },
  { name: "HubSpot", kind: "tool" },
  { name: "Jira", kind: "tool" },
  { name: "Figma", kind: "tool" },
  { name: "Workday", kind: "tool" },
  { name: "Bloomberg Terminal", kind: "tool", aliases: ["bloomberg"] },
  { name: "Capital IQ", kind: "tool", aliases: ["capiq", "s&p capital iq"] },
  { name: "Alteryx", kind: "tool" },
  { name: "Looker", kind: "tool" },
  { name: "SPSS", kind: "tool" },
  { name: "Google Ads", kind: "tool", aliases: ["adwords"] },
  { name: "Meta Ads", kind: "tool", aliases: ["facebook ads", "meta ads manager"] },
  { name: "CRM", kind: "tool", aliases: ["crm tools", "customer relationship management"] },

  // Core business / analysis
  { name: "Data Analysis", kind: "hard", aliases: ["analyze data", "analyse data", "analyzing data", "analysing data", "data analytics", "analyze business data", "business data"] },
  { name: "Business Analysis", kind: "hard", aliases: ["business analyst", "requirements gathering", "brd", "business requirements"] },
  { name: "Business Strategy", kind: "hard", aliases: ["strategy", "strategic initiatives", "strategic planning", "corporate strategy"] },
  { name: "Financial Modeling", kind: "hard", aliases: ["financial modelling", "financial models", "dcf", "3-statement model", "three statement model"] },
  { name: "Valuation", kind: "hard", aliases: ["company valuation", "comparable companies", "precedent transactions"] },
  { name: "FP&A", kind: "hard", aliases: ["financial planning and analysis", "financial planning & analysis", "budgeting and forecasting"] },
  { name: "Budgeting", kind: "hard", aliases: ["budget management", "budgets"] },
  { name: "Forecasting", kind: "hard", aliases: ["demand forecasting", "revenue forecasting"] },
  { name: "Financial Reporting", kind: "hard", aliases: ["mis reporting", "management reporting", "financial statements"] },
  { name: "Investment Analysis", kind: "hard", aliases: ["investment research", "equity research", "due diligence"] },
  { name: "Accounting", kind: "hard", aliases: ["ifrs", "gaap", "ind as"] },
  { name: "Risk Management", kind: "hard", aliases: ["risk assessment", "credit risk", "market risk"] },
  { name: "Market Research", kind: "hard", aliases: ["consumer research", "customer research", "market analysis", "competitive analysis", "competitor analysis"] },
  { name: "Brand Management", kind: "hard", aliases: ["brand strategy", "brand building", "branding"] },
  { name: "Go-to-Market", kind: "hard", aliases: ["go to market", "gtm", "product launch", "launch strategy"] },
  { name: "Digital Marketing", kind: "hard", aliases: ["performance marketing", "online marketing", "social media marketing", "seo", "sem", "content marketing"] },
  { name: "Campaign Analytics", kind: "hard", aliases: ["campaign management", "campaign performance", "marketing analytics"] },
  { name: "Product Management", kind: "hard", aliases: ["product manager", "product roadmap", "roadmapping", "product strategy"] },
  { name: "Product Analytics", kind: "hard", aliases: ["a/b testing", "ab testing", "experimentation", "funnel analysis"] },
  { name: "User Research", kind: "hard", aliases: ["customer interviews", "usability testing"] },
  { name: "Agile", kind: "hard", aliases: ["scrum", "agile methodology", "sprint planning"] },
  { name: "Project Management", kind: "hard", aliases: ["program management", "pmo", "project planning"] },
  { name: "Process Improvement", kind: "hard", aliases: ["process optimization", "process optimisation", "lean", "six sigma", "kaizen", "operational excellence"] },
  { name: "Supply Chain Management", kind: "hard", aliases: ["supply chain", "logistics", "procurement", "inventory management", "sourcing"] },
  { name: "Operations Management", kind: "hard", aliases: ["business operations", "operations strategy", "operational planning"] },
  { name: "Sales Management", kind: "hard", aliases: ["b2b sales", "enterprise sales", "inside sales", "sales pipeline", "sales targets", "field sales", "channel sales", "sales quota"] },
  { name: "Business Development", kind: "hard", aliases: ["bd", "partnerships", "lead generation", "new business"] },
  { name: "Account Management", kind: "hard", aliases: ["key account management", "client servicing", "client management"] },
  { name: "Talent Acquisition", kind: "hard", aliases: ["recruitment", "recruiting", "hiring", "sourcing candidates", "campus hiring"] },
  { name: "HR Analytics", kind: "hard", aliases: ["people analytics", "workforce analytics"] },
  { name: "Employee Engagement", kind: "hard", aliases: ["engagement initiatives", "employee experience"] },
  { name: "Performance Management", kind: "hard", aliases: ["performance appraisal", "okrs", "kpi setting"] },
  { name: "HR Operations", kind: "hard", aliases: ["hr ops", "payroll", "onboarding", "hris"] },
  { name: "Compensation & Benefits", kind: "hard", aliases: ["c&b", "compensation and benefits", "total rewards"] },
  { name: "Learning & Development", kind: "hard", aliases: ["l&d", "training and development"] },
  { name: "HR Business Partnering", kind: "hard", aliases: ["hrbp", "hr business partner"] },
  { name: "Management Consulting", kind: "hard", aliases: ["consulting", "strategy consulting", "client engagements"] },
  { name: "Market Sizing", kind: "hard", aliases: ["tam sam som", "market estimation"] },
  { name: "Problem Solving", kind: "soft", aliases: ["structured problem solving", "problem-solving", "hypothesis-driven"] },
  { name: "KPI Tracking", kind: "hard", aliases: ["kpis", "dashboards", "dashboarding", "metrics tracking"] },
  { name: "P&L Management", kind: "hard", aliases: ["p&l", "profit and loss"] },
  { name: "Pricing Strategy", kind: "hard", aliases: ["pricing", "revenue management"] },
  { name: "Customer Success", kind: "hard", aliases: ["customer retention", "churn reduction"] },
  { name: "Change Management", kind: "hard", aliases: ["transformation", "change initiatives"] },
  { name: "Entrepreneurship", kind: "domain", aliases: ["startup", "co-founded", "venture building"] },
  { name: "International Business", kind: "domain", aliases: ["cross-border", "global markets", "international markets"] },
  { name: "Statistics", kind: "hard", aliases: ["statistical analysis", "regression", "hypothesis testing"] },
  { name: "Machine Learning", kind: "hard", aliases: ["ml", "predictive modeling", "predictive modelling"] },

  // Soft skills
  { name: "Stakeholder Management", kind: "soft", aliases: ["stakeholders", "senior stakeholders", "stakeholder engagement", "stakeholder communication"] },
  { name: "Cross-functional Collaboration", kind: "soft", aliases: ["cross-functional teams", "cross functional", "cross-functional"] },
  { name: "Communication", kind: "soft", aliases: ["communication skills", "written and verbal communication", "verbal communication"] },
  { name: "Leadership", kind: "soft", aliases: ["team leadership", "led a team", "people management", "team management"] },
  { name: "Presentation Skills", kind: "soft", aliases: ["storytelling", "executive presentations", "develop presentations"] },
  { name: "Negotiation", kind: "soft", aliases: ["negotiating", "vendor negotiation"] },
  { name: "Attention to Detail", kind: "soft", aliases: ["detail-oriented", "detail oriented"] },
  { name: "Critical Thinking", kind: "soft", aliases: ["analytical thinking", "analytical skills"] },
  { name: "Time Management", kind: "soft", aliases: ["prioritization", "multitasking"] },
];

export const EDUCATION_TERMS: { name: string; patterns: RegExp[] }[] = [
  { name: "MBA", patterns: [/\bmba\b/i, /\bpgdm\b/i, /\bpgp\b/i, /master of business administration/i, /post ?graduate diploma in management/i] },
  { name: "CA", patterns: [/\bchartered accountant\b/i, /\bca\b(?! ?\d)/] },
  { name: "CFA", patterns: [/\bcfa\b/i] },
  { name: "Bachelor's degree", patterns: [/\bbachelor'?s?\b/i, /\bb\.?\s?(tech|e|com|sc|a|ba)\b/i, /\bundergraduate degree\b/i, /\bgraduate degree\b/i] },
  { name: "Master's degree", patterns: [/\bmaster'?s?\b(?! of business)/i, /\bm\.?\s?(tech|sc|com|a)\b/i] },
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Build a regex that matches a term on word boundaries (handles symbols like &, /, +). */
export function termRegex(term: string): RegExp {
  const t = escapeRe(term.toLowerCase());
  return new RegExp(`(^|[^a-z0-9])${t}(?=$|[^a-z0-9])`, "i");
}

const compiled = SKILLS.map((s) => ({
  entry: s,
  patterns: [s.name, ...(s.aliases ?? [])].map(termRegex),
}));

/** Detect taxonomy skills mentioned in free text. Returns canonical names, in first-appearance order. */
export function detectSkills(text: string): SkillEntry[] {
  const lower = text.toLowerCase();
  const hits: { entry: SkillEntry; index: number }[] = [];
  for (const { entry, patterns } of compiled) {
    let best = -1;
    for (const re of patterns) {
      const m = re.exec(lower);
      if (m && (best === -1 || m.index < best)) best = m.index;
    }
    if (best >= 0) hits.push({ entry, index: best });
  }
  return hits.sort((a, b) => a.index - b.index).map((h) => h.entry);
}

/** Returns true when `text` mentions the skill by name or any known alias. */
export function mentionsSkill(text: string, skill: string): boolean {
  const lower = text.toLowerCase();
  const known = SKILLS.find((s) => s.name.toLowerCase() === skill.toLowerCase() || s.aliases?.some((a) => a === skill.toLowerCase()));
  const terms = known ? [known.name, ...(known.aliases ?? [])] : [skill];
  return terms.some((t) => termRegex(t).test(lower));
}

export function canonicalSkill(skill: string): string {
  const k = skill.trim().toLowerCase();
  const found = SKILLS.find((s) => s.name.toLowerCase() === k || s.aliases?.includes(k));
  return found ? found.name : skill.trim();
}
