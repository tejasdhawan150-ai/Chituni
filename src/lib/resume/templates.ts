import type { SectionKey } from "./schema";

/**
 * Resume templates are pure configuration. A single renderer per output format
 * (HTML preview, PDF, DOCX) reads this config, so every template shares the
 * same ATS-safe structure (single column, real text, standard headings) and
 * users can switch templates without losing content.
 */

export type TemplateCategory = "professional" | "modern" | "ats";
export type PdfFont = "Helvetica" | "Times-Roman" | "Courier";

export interface ResumeTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  bestFor: string[];
  /** CSS font stacks for the HTML preview. */
  fonts: { heading: string; body: string };
  /** Built-in PDF fonts (guaranteed embeddable + text-selectable for ATS). */
  pdfFonts: { heading: PdfFont; body: PdfFont; headingBold: boolean };
  /** DOCX fonts (commonly installed on Windows/Mac). */
  docxFonts: { heading: string; body: string };
  accent: string;
  header: "centered" | "left" | "split";
  sectionTitle: "underline" | "caps" | "bar" | "plain" | "rule-above";
  density: "compact" | "normal" | "airy";
  baseSize: number; // pt
  sectionOrder: SectionKey[];
  atsSafe: boolean;
}

const MBA_ORDER: SectionKey[] = ["summary", "education", "experience", "projects", "skills", "certifications", "achievements", "additional"];
const EXP_ORDER: SectionKey[] = ["summary", "experience", "skills", "education", "projects", "certifications", "achievements", "additional"];
const SKILLS_FIRST: SectionKey[] = ["summary", "skills", "experience", "projects", "education", "certifications", "achievements", "additional"];

const SERIF = "'Georgia', 'Times New Roman', serif";
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const GROTESK = "'Arial', 'Helvetica Neue', Helvetica, sans-serif";

export const TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic-ats", name: "Classic ATS", category: "ats", description: "The safest possible layout. Plain headings, single column, zero graphics.",
    bestFor: ["Any role", "Large employers", "Online portals"], fonts: { heading: GROTESK, body: GROTESK },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Arial", body: "Arial" },
    accent: "#111827", header: "centered", sectionTitle: "underline", density: "normal", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "ats-professional", name: "ATS Professional", category: "ats", description: "ATS-first with a touch of polish — left-aligned header and ruled sections.",
    bestFor: ["Analyst roles", "Operations", "Sales"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Calibri", body: "Calibri" },
    accent: "#1e3a8a", header: "left", sectionTitle: "rule-above", density: "normal", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "ats-executive", name: "ATS Executive", category: "ats", description: "Serif headings and generous spacing, still 100% parseable.",
    bestFor: ["Senior associates", "Managers"], fonts: { heading: SERIF, body: GROTESK },
    pdfFonts: { heading: "Times-Roman", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Georgia", body: "Arial" },
    accent: "#0f172a", header: "centered", sectionTitle: "caps", density: "airy", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "clean-ats", name: "Clean ATS", category: "ats", description: "Compact and minimal — fits more on one page without clutter.",
    bestFor: ["Freshers", "0–2 years"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Calibri", body: "Calibri" },
    accent: "#334155", header: "left", sectionTitle: "plain", density: "compact", baseSize: 10, sectionOrder: MBA_ORDER, atsSafe: true,
  },
  {
    id: "executive", name: "Executive", category: "professional", description: "Classic serif typography with authority. Great for leadership-track roles.",
    bestFor: ["General management", "Strategy"], fonts: { heading: SERIF, body: SERIF },
    pdfFonts: { heading: "Times-Roman", body: "Times-Roman", headingBold: true }, docxFonts: { heading: "Georgia", body: "Georgia" },
    accent: "#1f2937", header: "centered", sectionTitle: "underline", density: "airy", baseSize: 11, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "consulting", name: "Consulting", category: "professional", description: "The MBB-style one-pager: education up top, dense achievement bullets.",
    bestFor: ["Consulting", "Strategy", "MBA"], fonts: { heading: SERIF, body: SERIF },
    pdfFonts: { heading: "Times-Roman", body: "Times-Roman", headingBold: true }, docxFonts: { heading: "Times New Roman", body: "Times New Roman" },
    accent: "#000000", header: "centered", sectionTitle: "caps", density: "compact", baseSize: 10.5, sectionOrder: MBA_ORDER, atsSafe: true,
  },
  {
    id: "corporate", name: "Corporate", category: "professional", description: "Navy accents and a split header. Polished for large-company roles.",
    bestFor: ["Corporate roles", "HR", "Operations"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Calibri", body: "Calibri" },
    accent: "#1e3a8a", header: "split", sectionTitle: "bar", density: "normal", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "finance", name: "Finance", category: "professional", description: "Conservative, numbers-forward layout banks and funds expect.",
    bestFor: ["Finance", "Banking", "FP&A"], fonts: { heading: SERIF, body: SERIF },
    pdfFonts: { heading: "Times-Roman", body: "Times-Roman", headingBold: true }, docxFonts: { heading: "Garamond", body: "Garamond" },
    accent: "#14532d", header: "centered", sectionTitle: "rule-above", density: "compact", baseSize: 10.5, sectionOrder: MBA_ORDER, atsSafe: true,
  },
  {
    id: "modern-professional", name: "Modern Professional", category: "modern", description: "Contemporary sans-serif with a confident accent colour.",
    bestFor: ["Product", "Analytics", "Tech"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Calibri", body: "Calibri" },
    accent: "#4f46e5", header: "left", sectionTitle: "bar", density: "normal", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "minimal", name: "Minimal", category: "modern", description: "Quiet, spacious and elegant. Lets your achievements speak.",
    bestFor: ["Any role", "Design-aware companies"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: false }, docxFonts: { heading: "Calibri Light", body: "Calibri" },
    accent: "#475569", header: "left", sectionTitle: "plain", density: "airy", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "marketing", name: "Marketing", category: "modern", description: "Brand-forward accent with skills up front — built for marketers.",
    bestFor: ["Marketing", "Brand", "Growth"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Calibri", body: "Calibri" },
    accent: "#be123c", header: "left", sectionTitle: "underline", density: "normal", baseSize: 10.5, sectionOrder: SKILLS_FIRST, atsSafe: true,
  },
  {
    id: "mba-professional", name: "MBA Professional", category: "professional", description: "Education-first structure recruiters expect from MBA candidates.",
    bestFor: ["MBA students", "Campus placements", "Lateral hires"], fonts: { heading: SERIF, body: GROTESK },
    pdfFonts: { heading: "Times-Roman", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Georgia", body: "Arial" },
    accent: "#7c2d12", header: "centered", sectionTitle: "rule-above", density: "compact", baseSize: 10.5, sectionOrder: MBA_ORDER, atsSafe: true,
  },
  {
    id: "contemporary", name: "Contemporary", category: "modern", description: "Fresh teal accent and split header for a modern, confident look.",
    bestFor: ["Startups", "Business development"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Calibri", body: "Calibri" },
    accent: "#0f766e", header: "split", sectionTitle: "caps", density: "normal", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
];

export const DEFAULT_TEMPLATE_ID = "classic-ats";

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; description: string }[] = [
  { id: "ats", label: "ATS", description: "Maximum parseability for online application portals." },
  { id: "professional", label: "Professional", description: "Executive, consulting, corporate and finance styles." },
  { id: "modern", label: "Modern", description: "Contemporary, minimal and clean designs — still ATS-safe." },
];

export function getTemplate(id: string | null | undefined): ResumeTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
