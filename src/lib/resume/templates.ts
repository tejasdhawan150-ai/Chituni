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

const EXP_ORDER: SectionKey[] = ["summary", "experience", "skills", "education", "projects", "certifications", "achievements", "additional"];

const SERIF = "'Georgia', 'Times New Roman', serif";
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const GROTESK = "'Arial', 'Helvetica Neue', Helvetica, sans-serif";

export const TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic-ats", name: "Classic", category: "ats", description: "The safest possible layout. Plain headings, single column, zero graphics.",
    bestFor: ["Any role", "Large employers", "Online portals"], fonts: { heading: GROTESK, body: GROTESK },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Arial", body: "Arial" },
    accent: "#111827", header: "centered", sectionTitle: "underline", density: "normal", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "modern-professional", name: "Modern", category: "modern", description: "Contemporary sans-serif with a confident accent colour.",
    bestFor: ["Product", "Analytics", "Tech"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: true }, docxFonts: { heading: "Calibri", body: "Calibri" },
    accent: "#4f46e5", header: "left", sectionTitle: "bar", density: "normal", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "executive", name: "Executive", category: "professional", description: "Classic serif typography with authority. Great for leadership-track roles.",
    bestFor: ["General management", "Strategy"], fonts: { heading: SERIF, body: SERIF },
    pdfFonts: { heading: "Times-Roman", body: "Times-Roman", headingBold: true }, docxFonts: { heading: "Georgia", body: "Georgia" },
    accent: "#1f2937", header: "centered", sectionTitle: "underline", density: "airy", baseSize: 11, sectionOrder: EXP_ORDER, atsSafe: true,
  },
  {
    id: "minimal", name: "Minimal", category: "modern", description: "Quiet, spacious and elegant. Lets your achievements speak.",
    bestFor: ["Any role", "Design-aware companies"], fonts: { heading: SANS, body: SANS },
    pdfFonts: { heading: "Helvetica", body: "Helvetica", headingBold: false }, docxFonts: { heading: "Calibri Light", body: "Calibri" },
    accent: "#475569", header: "left", sectionTitle: "plain", density: "airy", baseSize: 10.5, sectionOrder: EXP_ORDER, atsSafe: true,
  },
];

export const DEFAULT_TEMPLATE_ID = "classic-ats";


export function getTemplate(id: string | null | undefined): ResumeTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
