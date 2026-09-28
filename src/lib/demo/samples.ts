import type { Profile } from "@/lib/resume/schema";

export const SAMPLE_JD_DELOITTE = `Senior Business Analyst
Deloitte

We are looking for a Business Analyst to support strategic initiatives, analyze business data, develop presentations, work with cross-functional teams and provide insights to senior stakeholders.

Requirements:
- MBA preferred
- Advanced Excel
- PowerPoint
- Data analysis
- Business strategy
- Stakeholder management
- 2+ years experience`;

export const SAMPLE_JD_PG = `Assistant Brand Manager
Procter & Gamble

About the role:
You will own the go-to-market plan for a household care brand, lead consumer and market research, manage digital marketing campaigns with agency partners and track campaign analytics to optimise ROI.

Responsibilities:
- Build and execute the annual brand plan and go-to-market strategy
- Analyze market share, consumer insights and competitor activity
- Manage digital marketing and performance campaigns
- Work with cross-functional teams across sales, finance and supply chain
- Present recommendations to senior stakeholders

Qualifications:
- MBA in Marketing
- 1-3 years of experience in brand management or marketing
- Strong Excel and PowerPoint skills
- Nice to have: Google Analytics, SQL`;

export const SAMPLE_JD_ACCENTURE = `HR Business Partner
Accenture

Responsibilities:
- Partner with business leaders on talent acquisition, performance management and employee engagement
- Use HR analytics to identify attrition drivers and recommend interventions
- Drive HR operations excellence and change management initiatives
- Coach managers on performance conversations

Requirements:
- MBA in HR
- 3+ years of experience as an HRBP or in HR operations
- Stakeholder management and communication skills
- Preferred: Workday, Power BI`;

/** Fictional demo candidate — used for demo mode and marketing previews. */
export const DEMO_PROFILE: Profile = {
  basics: {
    fullName: "Aanya Kapoor",
    headline: "Business Analyst | MBA (Strategy & Marketing)",
    email: "aanya.kapoor@example.com",
    phone: "+91 98765 43210",
    location: "Mumbai, India",
    linkedinUrl: "linkedin.com/in/aanya-kapoor-demo",
    website: "",
  },
  summary:
    "Business analyst with an MBA in Strategy and Marketing and experience across consulting and consumer goods. Skilled in data analysis, Excel modelling and building executive-ready PowerPoint presentations. Comfortable working with cross-functional teams and senior stakeholders to turn data into clear business recommendations.",
  experience: [
    {
      id: "exp_demo_1",
      company: "Northbridge Advisory",
      title: "Business Analyst",
      location: "Mumbai",
      startDate: "Jul 2022",
      endDate: "",
      current: true,
      bullets: [
        "Responsible for analyzing sales and margin data for a retail client across 120 stores using Excel and SQL, identifying 8% cost savings",
        "Built PowerPoint decks and strategy recommendations presented to the client's CXO team",
        "Worked with cross-functional teams from finance and operations to design a KPI dashboard in Power BI",
        "Helped senior stakeholders prioritise 5 growth initiatives through market sizing and competitor analysis",
      ],
    },
    {
      id: "exp_demo_2",
      company: "Hindustan Consumer Products",
      title: "Marketing Intern",
      location: "Mumbai",
      startDate: "Apr 2021",
      endDate: "Jun 2021",
      current: false,
      bullets: [
        "Conducted market research with 300+ consumers to evaluate a new product concept",
        "Analyzed campaign analytics for digital marketing campaigns and recommended budget reallocation that improved CTR by 18%",
      ],
    },
    {
      id: "exp_demo_3",
      company: "Tata Consultancy Services",
      title: "Systems Engineer",
      location: "Pune",
      startDate: "Jun 2018",
      endDate: "May 2020",
      current: false,
      bullets: [
        "Gathered business requirements from banking clients and translated them into functional specifications",
        "Automated weekly MIS reporting in Excel, reducing turnaround time by 60%",
      ],
    },
  ],
  education: [
    {
      id: "edu_demo_1",
      institution: "Narsee Monjee Institute of Management Studies",
      degree: "MBA",
      field: "Strategy & Marketing",
      startDate: "2020",
      endDate: "2022",
      grade: "CGPA 3.6/4",
      details: "Case competition finalist; Consulting Club member",
    },
    {
      id: "edu_demo_2",
      institution: "University of Pune",
      degree: "B.E.",
      field: "Computer Engineering",
      startDate: "2014",
      endDate: "2018",
      grade: "First Class",
      details: "",
    },
  ],
  skills: ["Excel", "PowerPoint", "SQL", "Power BI", "Data Analysis", "Market Research", "Stakeholder Management", "Business Strategy", "Market Sizing", "Digital Marketing"],
  projects: [
    {
      id: "proj_demo_1",
      name: "Go-to-market strategy for a D2C skincare brand",
      role: "Team lead, MBA live project",
      bullets: ["Designed a go-to-market plan with pricing, channel and positioning recommendations adopted by the founders"],
    },
  ],
  certifications: [{ id: "cert_demo_1", name: "Google Data Analytics Professional Certificate", issuer: "Google", date: "2023" }],
  achievements: ["National finalist, Deloitte Maverick case competition (2021)", "Top 5% of MBA batch in Corporate Strategy"],
  additional: "Languages: English, Hindi, Marathi",
  mbaSpecialization: "Strategy",
  targetRoles: ["Business Analyst", "Strategy Associate", "Product Analyst"],
};
