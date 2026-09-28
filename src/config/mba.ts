/** MBA specialization guidance — powers onboarding tips, editor suggestions and SEO pages. */

export interface SpecializationGuide {
  slug: string;
  name: string;
  roles: string[];
  keywords: string[];
  tools: string[];
  tips: string[];
  sampleBullets: string[];
}

export const MBA_GUIDES: SpecializationGuide[] = [
  {
    slug: "marketing",
    name: "Marketing",
    roles: ["Brand Manager", "Assistant Brand Manager", "Product Marketing Manager", "Digital Marketing Manager", "Growth Manager"],
    keywords: ["Brand Management", "Market Research", "Go-to-Market", "Digital Marketing", "Campaign Analytics", "Consumer Insights", "Market Share", "P&L"],
    tools: ["Google Analytics", "Meta Ads", "Google Ads", "Excel", "PowerPoint", "Nielsen"],
    tips: [
      "Lead with outcomes: market share, revenue, CTR, CAC or ROI — only the numbers you can defend in an interview.",
      "Show the full funnel: insight → strategy → execution → measured result.",
      "Summer internship projects (live projects) count — frame them like work experience.",
      "Name channels and tools explicitly; recruiters search for them.",
    ],
    sampleBullets: [
      "Led consumer research with 200+ respondents to identify three purchase drivers that shaped the relaunch positioning",
      "Planned and executed a digital campaign across Meta and Google, optimising spend weekly using campaign analytics",
    ],
  },
  {
    slug: "finance",
    name: "Finance",
    roles: ["Financial Analyst", "FP&A Associate", "Investment Banking Associate", "Equity Research Associate", "Corporate Finance Manager"],
    keywords: ["Financial Modeling", "Valuation", "FP&A", "Investment Analysis", "Financial Reporting", "Budgeting", "Forecasting", "Due Diligence"],
    tools: ["Excel", "Bloomberg Terminal", "Capital IQ", "SAP", "Power BI"],
    tips: [
      "Specify model types (DCF, LBO, 3-statement) and deal/portfolio sizes where you can.",
      "List certifications (CFA levels, FRM) with status — never imply you've cleared a level you haven't.",
      "Quantify accuracy and speed: forecast variance, closing timelines, reports automated.",
      "Keep formatting conservative — finance recruiters prefer classic one-page layouts.",
    ],
    sampleBullets: [
      "Built a 3-statement financial model and DCF valuation for a mid-market acquisition target",
      "Automated monthly variance reporting in Excel, reducing close time for the FP&A team",
    ],
  },
  {
    slug: "hr",
    name: "HR",
    roles: ["HR Business Partner", "Talent Acquisition Specialist", "HR Analyst", "L&D Manager", "HR Generalist"],
    keywords: ["Talent Acquisition", "HR Analytics", "Employee Engagement", "Performance Management", "HR Operations", "Compensation & Benefits", "Change Management"],
    tools: ["Workday", "SAP SuccessFactors", "Excel", "Power BI"],
    tips: [
      "Translate HR work into business impact: time-to-hire, attrition, engagement scores, cost-per-hire.",
      "Show partnership with business leaders, not just administration.",
      "Mention scale: headcount supported, number of hires, locations.",
    ],
    sampleBullets: [
      "Partnered with business heads to run campus hiring across 6 institutes, closing all planned positions",
      "Analysed exit-interview data to identify attrition drivers and proposed targeted retention interventions",
    ],
  },
  {
    slug: "operations",
    name: "Operations",
    roles: ["Operations Manager", "Supply Chain Analyst", "Procurement Manager", "Program Manager", "Business Excellence Associate"],
    keywords: ["Supply Chain Management", "Process Improvement", "Lean", "Six Sigma", "Procurement", "Inventory Management", "Vendor Management", "KPI Tracking"],
    tools: ["SAP", "Excel", "Power BI", "Tableau"],
    tips: [
      "Quantify efficiency: cost savings, cycle time, inventory turns, SLA adherence.",
      "Name methodologies you have actually applied (Lean, Six Sigma belt level, Kaizen).",
      "Show cross-functional coordination with vendors, plants and sales teams.",
    ],
    sampleBullets: [
      "Redesigned the inbound logistics process using Lean principles, cutting average turnaround time",
      "Tracked vendor KPIs through a Power BI dashboard used in weekly operations reviews",
    ],
  },
  {
    slug: "business-analytics",
    name: "Business Analytics",
    roles: ["Business Analyst", "Data Analyst", "Analytics Consultant", "Product Analyst", "Decision Scientist"],
    keywords: ["Data Analysis", "SQL", "Python", "Statistics", "Dashboards", "A/B Testing", "Predictive Modeling", "Stakeholder Management"],
    tools: ["SQL", "Python", "Power BI", "Tableau", "Excel", "R Programming"],
    tips: [
      "Pair every technical skill with the business decision it enabled.",
      "Mention data scale (rows, sources) and the stakeholders who used your output.",
      "Link a portfolio or GitHub if you have real projects.",
    ],
    sampleBullets: [
      "Wrote SQL queries across sales and inventory tables to build a demand dashboard used by regional managers",
      "Ran an A/B test on onboarding emails and presented results to the growth team",
    ],
  },
  {
    slug: "strategy",
    name: "Strategy",
    roles: ["Strategy Associate", "Management Consultant", "Corporate Strategy Analyst", "Chief of Staff", "Business Analyst (Consulting)"],
    keywords: ["Business Strategy", "Market Sizing", "Competitive Analysis", "Problem Solving", "Stakeholder Management", "PowerPoint", "Financial Modeling"],
    tools: ["Excel", "PowerPoint", "Capital IQ", "Tableau"],
    tips: [
      "Use a consulting-style one-pager: education first, dense achievement bullets.",
      "Show structured problem solving: hypothesis → analysis → recommendation → outcome.",
      "Case competition wins and leadership roles matter for MBB and Big 4 shortlists.",
    ],
    sampleBullets: [
      "Built a market-entry assessment for a consumer brand using bottom-up market sizing and competitor benchmarking",
      "Synthesised findings into a CXO-level PowerPoint deck recommending three growth levers",
    ],
  },
  {
    slug: "international-business",
    name: "International Business",
    roles: ["International Business Development Manager", "Export Manager", "Global Sourcing Analyst", "Trade Analyst"],
    keywords: ["International Business", "Market Entry", "Business Development", "Cross-border Trade", "Negotiation", "Market Research"],
    tools: ["Excel", "Salesforce", "PowerPoint"],
    tips: [
      "Highlight markets and regions you've worked with and languages you speak.",
      "Show commercial outcomes: new markets opened, partners signed, deals closed.",
    ],
    sampleBullets: [
      "Researched entry options for two Southeast Asian markets and presented a phased go-to-market plan",
      "Coordinated with overseas distributors to align on pricing and shipment schedules",
    ],
  },
  {
    slug: "entrepreneurship",
    name: "Entrepreneurship",
    roles: ["Founder's Office Associate", "Business Development Manager", "Venture Analyst", "Product Manager"],
    keywords: ["Entrepreneurship", "Go-to-Market", "Business Development", "Fundraising", "P&L Management", "Product Management"],
    tools: ["Excel", "Notion", "HubSpot", "Google Analytics"],
    tips: [
      "Treat your startup like a job: title, dates, and measurable traction.",
      "Be precise about your role and team size — avoid overstating.",
      "Emphasise ownership, speed and learning from failures.",
    ],
    sampleBullets: [
      "Co-founded a campus food-delivery venture; built operations and a partner network of local restaurants",
      "Pitched to angel investors and incubators, refining the business model based on feedback",
    ],
  },
  {
    slug: "product-management",
    name: "Product Management",
    roles: ["Associate Product Manager", "Product Manager", "Product Analyst", "Product Owner"],
    keywords: ["Product Management", "Product Roadmap", "User Research", "Product Analytics", "Agile", "Go-to-Market", "Stakeholder Management"],
    tools: ["Jira", "Figma", "SQL", "Mixpanel", "Google Analytics"],
    tips: [
      "Show the product loop: user problem → prioritisation → shipped feature → metric moved.",
      "Name the metrics you owned (activation, retention, conversion).",
      "Technical background + MBA is a strong APM story — make both visible.",
    ],
    sampleBullets: [
      "Interviewed 25 users to prioritise onboarding improvements and wrote PRDs for the top two features",
      "Worked with engineering and design in two-week sprints to ship a redesigned checkout flow",
    ],
  },
];

export function getGuide(slugOrName: string) {
  const k = slugOrName.toLowerCase();
  return MBA_GUIDES.find((g) => g.slug === k || g.name.toLowerCase() === k);
}
