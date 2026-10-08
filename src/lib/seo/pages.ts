/**
 * Programmatic SEO landing pages. Two families:
 *  - intent pages at the root:   /ai-resume-builder, /ats-resume-checker, ...
 *  - role pages under /resume-builder/[slug]: consultants, business analysts, ...
 * Content is unique per page (intro, keywords, bullets, FAQs) to avoid thin/duplicate content.
 */

export interface Faq {
  q: string;
  a: string;
}

export interface SeoPage {
  slug: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  intro: string;
  benefits: { title: string; body: string }[];
  keywords?: string[];
  sampleBullets?: string[];
  faqs: Faq[];
  related: string[];
}

const COMMON_FAQS: Faq[] = [
  {
    q: "Will DreamJobResume add experience I don't have?",
    a: "Never. The AI only rephrases and reorders facts from your own profile. If a job needs a skill you don't have, we flag it as a missing skill — we never add it to your resume.",
  },
  {
    q: "Is the ATS score a guarantee?",
    a: "No. It is our internal matching estimate based on keywords, skills, experience relevance, formatting and education. It helps you improve alignment, but no tool can guarantee how a specific employer's ATS will rank you.",
  },
  {
    q: "Can I paste a job from LinkedIn, Naukri or Indeed?",
    a: "Yes. Copy the job description text from any job board or company careers page and paste it in. We don't scrape job sites — you stay in control of what you share.",
  },
];

export const INTENT_PAGES: SeoPage[] = [
  {
    slug: "ai-resume-builder",
    path: "/ai-resume-builder",
    metaTitle: "AI Resume Builder — Tailor Your Resume to Any Job | DreamJobResume",
    metaDescription: "Build an ATS-friendly resume with AI. Paste a job description and get a resume tailored to the role — without fabricated experience.",
    eyebrow: "AI resume builder",
    h1: "The AI resume builder that tailors every resume to the job",
    intro:
      "Generic resumes get filtered out. DreamJobResume reads the job description, identifies the skills and keywords the employer is screening for, and rewrites your real experience so it speaks directly to that role.",
    benefits: [
      { title: "Job-specific, not generic", body: "Every version is built against a real job description — skills reordered, bullets strengthened, summary rewritten for the role." },
      { title: "Truthful by design", body: "Our AI is constrained to your actual experience. No invented titles, metrics or certifications." },
      { title: "ATS-safe designs", body: "Clean single-column styles with real text and standard headings. Download as PDF or Word." },
    ],
    faqs: COMMON_FAQS,
    related: ["/ats-resume-checker", "/resume-tailored-to-job-description", "/mba-resume-builder"],
  },
  {
    slug: "ai-resume-builder-india",
    path: "/ai-resume-builder-india",
    metaTitle: "AI Resume Builder India — ATS Resumes for Indian Job Seekers | DreamJobResume",
    metaDescription: "An AI resume builder made for India: tailor resumes for Naukri, LinkedIn and campus placements. 100% free, no sign-up.",
    eyebrow: "Made for India",
    h1: "AI resume builder for Indian job seekers",
    intro:
      "From campus placements to lateral moves, Indian recruiters screen hundreds of resumes per role. DreamJobResume helps you tailor yours for each application on Naukri, LinkedIn, Instahyre or company portals — completely free.",
    benefits: [
      { title: "Works with Naukri & LinkedIn JDs", body: "Paste any job description; we extract skills, experience requirements and keywords in seconds." },
      { title: "MBA & PGDM aware", body: "Recognises PGDM, PGP and MBA degrees and the skills business recruiters look for." },
      { title: "Completely free", body: "Every feature, free for everyone. No credit card, no trial." },
    ],
    faqs: [
      ...COMMON_FAQS,
      { q: "Do you support PGDM and PGP programmes?", a: "Yes — PGDM, PGP and MBA are all recognised as management degrees when we match education requirements." },
    ],
    related: ["/cv-builder-india", "/resume-builder/mba-students", "/resume-builder/freshers"],
  },
  {
    slug: "mba-resume-builder",
    path: "/mba-resume-builder",
    metaTitle: "MBA Resume Builder — Tailored Resumes for MBA Graduates | DreamJobResume",
    metaDescription: "Resume builder for MBA students and graduates. Specialization-specific guidance for marketing, finance, HR, operations, strategy and product roles.",
    eyebrow: "For MBA candidates",
    h1: "The resume builder built for MBA graduates",
    intro:
      "MBA resumes are judged differently: recruiters look for structured thinking, business impact and a clear specialization story. DreamJobResume tailors your resume to each job description and shows which skills the role is looking for.",
    benefits: [
      { title: "Specialization guidance", body: "Marketing, Finance, HR, Operations, Analytics, Strategy, IB, Entrepreneurship and Product — each with its own keyword and bullet guidance." },
      { title: "Recruiter-ready formats", body: "Clean, single-column designs that recruiters and applicant tracking systems can read." },
      { title: "A version for every job", body: "Paste a new job description any time and get a new tailored resume in seconds." },
    ],
    faqs: [
      ...COMMON_FAQS,
      { q: "Should education come first on an MBA resume?", a: "For current students and recent graduates, usually yes. Lead with your MBA and the projects or internships most relevant to the role." },
    ],
    related: ["/resume-builder/mba-students", "/resume-builder/consultants", "/resume-builder/marketing-jobs"],
  },
  {
    slug: "ats-resume-builder",
    path: "/ats-resume-builder",
    metaTitle: "ATS Resume Builder — ATS-Friendly Resumes & Match Score | DreamJobResume",
    metaDescription: "Create an ATS-friendly resume that applicant tracking systems can parse. Single-column designs, keyword matching and a match score.",
    eyebrow: "ATS resume builder",
    h1: "Build an ATS-friendly resume that gets read by humans",
    intro:
      "Applicant tracking systems parse your resume into fields and match it against the job. Tables, columns, icons and graphics can break parsing. Our designs are single-column, text-based and use standard headings — and you see a match score for every job.",
    benefits: [
      { title: "Parseable by design", body: "Real text, standard section headings, no tables or text boxes in exported PDF and DOCX." },
      { title: "Live keyword matching", body: "See matched and missing keywords update as you type." },
      { title: "Formatting checks", body: "Contact info, bullet length, action verbs, quantification and length — checked automatically." },
    ],
    faqs: COMMON_FAQS,
    related: ["/ats-resume-checker", "/resume-optimization", "/ai-resume-builder"],
  },
  {
    slug: "ats-resume-checker",
    path: "/ats-resume-checker",
    metaTitle: "ATS Resume Checker — Score Your Resume Against a Job | DreamJobResume",
    metaDescription: "Check how well your resume matches a job description. Get an ATS compatibility score with keyword, skills, experience, formatting and education breakdown.",
    eyebrow: "ATS resume checker",
    h1: "Check your resume against any job description",
    intro:
      "Upload your resume, paste the job description and get a clear breakdown: keyword coverage, skills match, experience relevance, formatting and education — plus the exact keywords you're missing.",
    benefits: [
      { title: "Five-part breakdown", body: "Keywords, experience relevance, skills match, formatting and education — each scored separately." },
      { title: "Missing keywords, explained", body: "See which requirements you don't show — and add them only if you genuinely have the experience." },
      { title: "Fix it in one click", body: "Go from score to tailored resume in the same flow." },
    ],
    faqs: COMMON_FAQS,
    related: ["/ats-resume-builder", "/resume-optimization", "/resume-tailored-to-job-description"],
  },
  {
    slug: "job-resume-builder",
    path: "/job-resume-builder",
    metaTitle: "Job Resume Builder — A Tailored Resume for Every Application | DreamJobResume",
    metaDescription: "Create a different, job-specific resume for every application in minutes. Free, no sign-up.",
    eyebrow: "Job resume builder",
    h1: "A tailored resume for every job you apply to",
    intro:
      "Applying with one resume to fifty jobs rarely works. DreamJobResume makes it fast to create a version per job, keep them organised, and track which resume went to which company.",
    benefits: [
      { title: "Versions per company", body: "Deloitte Business Analyst, P&G Brand Manager, Accenture HRBP — each its own tailored version." },
      { title: "Honest suggestions", body: "If the job asks for something you don't have, we tell you — we never add it for you." },
      { title: "PDF or Word", body: "Download your tailored resume in the format the application asks for." },
    ],
    faqs: COMMON_FAQS,
    related: ["/resume-tailored-to-job-description", "/ai-resume-builder", "/resume-builder/freshers"],
  },
  {
    slug: "resume-tailored-to-job-description",
    path: "/resume-tailored-to-job-description",
    metaTitle: "Tailor Your Resume to a Job Description with AI | DreamJobResume",
    metaDescription: "Paste a job description and get your resume tailored to it: matched skills, rewritten bullets, a targeted summary and an ATS match score.",
    eyebrow: "Resume tailoring",
    h1: "Tailor your resume to the job description — in minutes",
    intro:
      "Tailoring used to take an hour per application. Paste the job description and DreamJobResume shows your current match, what's missing and a projected score after optimization — and you can edit anything before you download.",
    benefits: [
      { title: "Current vs projected match", body: "See your score before and after tailoring, e.g. 64% → 91%." },
      { title: "You stay in control", body: "Edit any line before downloading. Nothing is invented on your behalf." },
      { title: "No keyword stuffing", body: "Keywords are only used where they truthfully describe your work." },
    ],
    faqs: COMMON_FAQS,
    related: ["/ats-resume-checker", "/job-resume-builder", "/resume-optimization"],
  },
  {
    slug: "resume-optimization",
    path: "/resume-optimization",
    metaTitle: "Resume Optimization with AI — Stronger Bullets, Better Match | DreamJobResume",
    metaDescription: "Optimize your resume with AI: improve bullets, make achievements more impactful, add relevant keywords, shorten and make it ATS-friendly.",
    eyebrow: "Resume optimization",
    h1: "Optimize every line of your resume",
    intro:
      "Paste a job description and we strengthen your bullet points, put the most relevant skills first and rewrite your summary for the role. Anything that would invent facts is automatically blocked.",
    benefits: [
      { title: "Stronger bullet points", body: "Weak openers like “Responsible for” become clear action verbs." },
      { title: "Guardrails against fabrication", body: "Any suggestion that adds numbers or names not in your profile is rejected." },
      { title: "Instant preview", body: "See your tailored resume before you download it." },
    ],
    faqs: COMMON_FAQS,
    related: ["/ats-resume-builder", "/ai-resume-builder", "/resume-tailored-to-job-description"],
  },
  {
    slug: "ai-cv-maker",
    path: "/ai-cv-maker",
    metaTitle: "AI CV Maker — Create a Job-Ready CV Online | DreamJobResume",
    metaDescription: "Make a professional, ATS-friendly CV with AI. Upload your old CV or paste it, then tailor it to any job description.",
    eyebrow: "AI CV maker",
    h1: "Make a job-ready CV with AI",
    intro:
      "Upload your existing CV (PDF or Word) and we'll read your details automatically. Paste a job description and get a CV tailored to the role in seconds.",
    benefits: [
      { title: "Import in seconds", body: "Upload a PDF or Word CV, or paste the text." },
      { title: "Simple, clean designs", body: "Classic, Modern, Executive and Minimal — all ATS-friendly." },
      { title: "PDF & DOCX", body: "Download a text-based PDF or an editable Word document." },
    ],
    faqs: COMMON_FAQS,
    related: ["/cv-builder-india", "/ai-resume-builder", "/resume-builder/freshers"],
  },
  {
    slug: "cv-builder-india",
    path: "/cv-builder-india",
    metaTitle: "CV Builder India — ATS-Friendly CVs for Indian Jobs | DreamJobResume",
    metaDescription: "Free CV builder for India. Tailor your CV to jobs on Naukri, LinkedIn and company portals. MBA and fresher friendly.",
    eyebrow: "CV builder India",
    h1: "The CV builder for India's job market",
    intro:
      "Whether you call it a CV or a resume, Indian recruiters want the same thing: relevant skills, clear achievements and a format their ATS can read. DreamJobResume delivers all three — for free.",
    benefits: [
      { title: "Fresher to 7 years", body: "Formats for campus placements, first jobs and lateral moves." },
      { title: "Indian context", body: "Handles CGPA, PGDM/PGP degrees, ₹ figures and Indian phone formats." },
      { title: "100% free", body: "Unlimited resumes and job tailoring. No credit card, ever." },
    ],
    faqs: COMMON_FAQS,
    related: ["/ai-resume-builder-india", "/resume-builder/freshers", "/mba-resume-builder"],
  },
];

interface RoleSeed {
  slug: string;
  role: string;
  audience: string;
  intro: string;
  keywords: string[];
  sampleBullets: string[];
  extraFaq: Faq;
  related: string[];
}

const ROLE_SEEDS: RoleSeed[] = [
  {
    slug: "consultants",
    role: "Consultants",
    audience: "consulting roles at MBB, Big 4 and boutique firms",
    intro: "Consulting recruiters scan for structured problem solving, client impact and leadership — on one dense, clean page. Tailor your resume to each firm's job description and keep a consulting-style format.",
    keywords: ["Management Consulting", "Problem Solving", "Market Sizing", "Business Strategy", "Stakeholder Management", "PowerPoint", "Excel", "Competitive Analysis"],
    sampleBullets: ["Synthesised interviews and market data into a growth strategy presented to the client's leadership team", "Built a market-sizing model to prioritise three new geographies for expansion"],
    extraFaq: { q: "Which template is best for consulting?", a: "Our Consulting template follows the classic one-page MBB format: education first, serif typography and dense achievement bullets." },
    related: ["/resume-builder/business-analysts", "/mba-resume-builder", "/mba-resume/strategy"],
  },
  {
    slug: "business-analysts",
    role: "Business Analysts",
    audience: "business analyst roles in consulting, tech and banking",
    intro: "Business analyst job descriptions ask for a specific mix: data analysis, Excel/SQL, stakeholder management and presentations. We match your resume to exactly what each BA role asks for.",
    keywords: ["Business Analysis", "Data Analysis", "SQL", "Excel", "Power BI", "Requirements Gathering", "Stakeholder Management", "PowerPoint"],
    sampleBullets: ["Gathered requirements from business stakeholders and translated them into functional specifications", "Built a Power BI dashboard tracking weekly sales KPIs for regional managers"],
    extraFaq: { q: "Should I list SQL if I only know basics?", a: "List skills you can discuss confidently in an interview. If a JD requires SQL and you don't have it, we'll flag it as missing rather than add it." },
    related: ["/resume-builder/consultants", "/mba-resume/business-analytics", "/ats-resume-checker"],
  },
  {
    slug: "marketing-jobs",
    role: "Marketing Jobs",
    audience: "brand, digital and product marketing roles",
    intro: "Marketing hiring managers want proof you can go from insight to results. Tailor your resume to brand management, digital marketing and growth roles with the right keywords and outcome-led bullets.",
    keywords: ["Brand Management", "Market Research", "Go-to-Market", "Digital Marketing", "Campaign Analytics", "Consumer Insights", "Google Analytics"],
    sampleBullets: ["Led consumer research to refine positioning for a product relaunch", "Managed a performance marketing budget across Meta and Google, optimising weekly on CAC"],
    extraFaq: { q: "Can I use a creative template for marketing?", a: "Our Marketing template adds a brand-forward accent while staying single-column and ATS-safe — the best of both." },
    related: ["/mba-resume/marketing", "/resume-builder/product-managers", "/mba-resume-builder"],
  },
  {
    slug: "finance-jobs",
    role: "Finance Jobs",
    audience: "FP&A, corporate finance, banking and investment roles",
    intro: "Finance resumes are read for precision. Tailor yours to FP&A, investment banking, equity research and corporate finance job descriptions — with conservative, recruiter-approved formatting.",
    keywords: ["Financial Modeling", "Valuation", "FP&A", "Budgeting", "Forecasting", "Financial Reporting", "Excel", "Due Diligence"],
    sampleBullets: ["Built a 3-statement model and DCF valuation supporting an acquisition decision", "Owned monthly budget-vs-actual reporting for a business unit"],
    extraFaq: { q: "How should I show CFA progress?", a: "State exactly what you've cleared, e.g. 'CFA Level II Candidate'. We never upgrade or invent certifications." },
    related: ["/mba-resume/finance", "/resume-builder/business-analysts", "/ats-resume-builder"],
  },
  {
    slug: "hr-jobs",
    role: "HR Jobs",
    audience: "HRBP, talent acquisition and HR analytics roles",
    intro: "Modern HR roles are business roles. Tailor your resume to HRBP, talent acquisition and HR analytics job descriptions and show impact in the metrics HR leaders care about.",
    keywords: ["HR Business Partnering", "Talent Acquisition", "Employee Engagement", "Performance Management", "HR Analytics", "HR Operations"],
    sampleBullets: ["Partnered with business leaders to plan hiring for a new product team", "Analysed engagement survey results and led action planning with managers"],
    extraFaq: { q: "What metrics work on an HR resume?", a: "Time-to-hire, offer acceptance, attrition, engagement scores and headcount supported — only the ones you can back up." },
    related: ["/mba-resume/hr", "/mba-resume-builder", "/resume-builder/freshers"],
  },
  {
    slug: "product-managers",
    role: "Product Managers",
    audience: "APM and product manager roles",
    intro: "PM job descriptions look for user empathy, prioritisation and measurable product outcomes. Tailor your resume to show the product loop — from problem to shipped feature to metric moved.",
    keywords: ["Product Management", "Product Roadmap", "User Research", "Product Analytics", "Agile", "Stakeholder Management", "SQL"],
    sampleBullets: ["Prioritised the onboarding roadmap using user interviews and funnel analysis", "Worked with engineering and design to ship a redesigned checkout flow"],
    extraFaq: { q: "I'm switching into product from consulting — will this help?", a: "Yes. We surface transferable experience (problem solving, stakeholder management, analytics) that PM JDs ask for, without inventing product titles." },
    related: ["/mba-resume/product-management", "/resume-builder/business-analysts", "/ai-resume-builder"],
  },
  {
    slug: "sales-jobs",
    role: "Sales & Business Development",
    audience: "sales, business development and account management roles",
    intro: "Sales resumes live and die by numbers and clarity. Tailor your resume to BD and sales job descriptions and make pipeline, quota and client outcomes easy to find.",
    keywords: ["Business Development", "Sales Management", "Account Management", "Negotiation", "CRM", "Lead Generation", "Salesforce"],
    sampleBullets: ["Built a pipeline of enterprise accounts through outbound prospecting and partner referrals", "Managed key accounts and led quarterly business reviews with client stakeholders"],
    extraFaq: { q: "Should I include my quota attainment?", a: "Yes, if it's accurate. Our AI keeps your numbers exactly as you entered them — it never inflates them." },
    related: ["/mba-resume/international-business", "/job-resume-builder", "/ai-resume-builder-india"],
  },
  {
    slug: "operations-jobs",
    role: "Operations Jobs",
    audience: "operations, supply chain and program management roles",
    intro: "Operations roles reward efficiency and reliability. Tailor your resume to supply chain, procurement and program management JDs with the right methodologies and outcome metrics.",
    keywords: ["Operations Management", "Supply Chain Management", "Process Improvement", "Six Sigma", "Vendor Management", "KPI Tracking", "SAP"],
    sampleBullets: ["Redesigned a fulfilment process using Lean principles to reduce turnaround time", "Tracked vendor performance through weekly KPI reviews"],
    extraFaq: { q: "Do certifications like Six Sigma help?", a: "They can — add them to Certifications with the exact belt level you hold." },
    related: ["/mba-resume/operations", "/resume-builder/business-analysts", "/ats-resume-builder"],
  },
  {
    slug: "mba-students",
    role: "MBA Students",
    audience: "summer internships, final placements and lateral hiring",
    intro: "From summer internship shortlists to final placements, MBA resumes are compared side by side. Build a sharp, education-first resume and tailor it to every company's JD.",
    keywords: ["MBA", "Leadership", "Problem Solving", "Stakeholder Management", "Business Strategy", "Market Research", "Financial Modeling"],
    sampleBullets: ["Led a 5-member team in a live project to design a go-to-market plan for a D2C brand", "Reached national finals of a strategy case competition"],
    extraFaq: { q: "Can I include live projects and case competitions?", a: "Absolutely — add them under Projects and Achievements. They're often the strongest signals for MBA recruiters." },
    related: ["/mba-resume-builder", "/resume-builder/consultants", "/resume-builder/freshers"],
  },
  {
    slug: "freshers",
    role: "Freshers",
    audience: "first jobs, graduate programmes and campus hiring",
    intro: "No work experience? Your internships, projects, coursework and leadership roles still tell a story. We help freshers present real experience clearly and tailor it to each job.",
    keywords: ["Internship", "Projects", "Excel", "Communication", "Problem Solving", "Data Analysis", "Teamwork"],
    sampleBullets: ["Analysed survey data from 150 students for a campus marketing project using Excel", "Organised an inter-college fest with a team of 20 volunteers"],
    extraFaq: { q: "How long should a fresher's resume be?", a: "One page. Our Clean ATS template is designed to fit more on a single page without clutter." },
    related: ["/cv-builder-india", "/resume-builder/mba-students", "/ai-resume-builder-india"],
  },
];

export const ROLE_PAGES: SeoPage[] = ROLE_SEEDS.map((r) => ({
  slug: r.slug,
  path: `/resume-builder/${r.slug}`,
  metaTitle: `Resume Builder for ${r.role} — AI-Tailored & ATS-Friendly | DreamJobResume`,
  metaDescription: `Create a job-specific, ATS-friendly resume for ${r.audience}. Paste the job description and get your resume tailored in minutes.`,
  eyebrow: `Resume builder for ${r.role.toLowerCase()}`,
  h1: `Resume builder for ${r.role}`,
  intro: r.intro,
  benefits: [
    { title: "Role-specific keywords", body: `We detect what ${r.audience} JDs screen for and show where your resume already matches.` },
    { title: "Truthful tailoring", body: "Your real experience, better presented. Missing skills are flagged, never invented." },
    { title: "Recruiter-ready formats", body: "Clean ATS-friendly designs, downloadable as PDF or Word." },
  ],
  keywords: r.keywords,
  sampleBullets: r.sampleBullets,
  faqs: [r.extraFaq, ...COMMON_FAQS],
  related: r.related,
}));

export function getIntentPage(slug: string) {
  return INTENT_PAGES.find((p) => p.slug === slug);
}
export function getRolePage(slug: string) {
  return ROLE_PAGES.find((p) => p.slug === slug);
}

export const ALL_SEO_PATHS = [...INTENT_PAGES, ...ROLE_PAGES].map((p) => p.path);

export function seoLabel(path: string) {
  const page = [...INTENT_PAGES, ...ROLE_PAGES].find((p) => p.path === path);
  if (page) return page.h1.replace(/ — .*$/, "");
  const m = path.match(/^\/mba-resume\/(.+)$/);
  return m ? `MBA ${m[1].replace(/-/g, " ")} resume guide` : path;
}
