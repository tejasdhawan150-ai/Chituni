import "server-only";
import { AlignmentType, BorderStyle, Document, LevelFormat, Packer, Paragraph, TabStopPosition, TabStopType, TextRun } from "docx";
import type { ResumeContent, SectionKey } from "./schema";
import { SECTION_LABELS } from "./schema";
import type { ResumeTemplate } from "./templates";

/** ATS-safe DOCX export: real paragraphs, native bullets, no tables or text boxes. */

const hex = (c: string) => c.replace("#", "");
const halfPt = (pt: number) => Math.round(pt * 2);

function range(start: string, end: string, current: boolean) {
  return [start, current ? "Present" : end].filter(Boolean).join(" – ");
}

export async function renderResumeDocx(c: ResumeContent, t: ResumeTemplate): Promise<Buffer> {
  const body = t.docxFonts.body;
  const size = halfPt(t.baseSize);
  const center = t.header === "centered";
  const out: Paragraph[] = [];

  const b = c.basics;
  out.push(
    new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: b.fullName || "Your Name", bold: true, size: halfPt(t.baseSize * 2), font: t.docxFonts.heading, color: hex(t.accent) })],
    }),
  );
  if (b.headline) out.push(new Paragraph({ alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: b.headline, size: size + 1, font: body })] }));
  const contact = [b.email, b.phone, b.location, b.linkedinUrl, b.website].filter(Boolean).join("  |  ");
  if (contact)
    out.push(
      new Paragraph({
        alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 120 },
        children: [new TextRun({ text: contact, size: size - 2, font: body, color: "444444" })],
      }),
    );

  const heading = (text: string) =>
    new Paragraph({
      spacing: { before: 200, after: 80 },
      border: t.sectionTitle === "underline" || t.sectionTitle === "rule-above" ? { [t.sectionTitle === "underline" ? "bottom" : "top"]: { style: BorderStyle.SINGLE, size: 6, color: hex(t.accent), space: 2 } } : undefined,
      children: [
        new TextRun({
          text: t.sectionTitle === "plain" || t.sectionTitle === "bar" ? text : text.toUpperCase(),
          bold: t.pdfFonts.headingBold,
          size: size + 2,
          font: t.docxFonts.heading,
          color: hex(t.accent),
        }),
      ],
    });

  const para = (text: string) => new Paragraph({ children: [new TextRun({ text, size, font: body })], spacing: { after: 40 } });
  const bullet = (text: string) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text, size, font: body })], spacing: { after: 20 } });
  const row = (left: string, leftRest: string, right: string) =>
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      spacing: { before: 60 },
      children: [
        new TextRun({ text: left, bold: true, size, font: body }),
        new TextRun({ text: leftRest, size, font: body }),
        ...(right ? [new TextRun({ text: `\t${right}`, size: size - 1, font: body, color: "555555" })] : []),
      ],
    });

  const sections: Record<SectionKey, () => Paragraph[]> = {
    summary: () => [para(c.summary)],
    experience: () =>
      c.experience.flatMap((e) => [
        row(e.title, e.company ? ` — ${e.company}${e.location ? `, ${e.location}` : ""}` : "", range(e.startDate, e.endDate, e.current)),
        ...e.bullets.filter((x) => x.trim()).map(bullet),
      ]),
    education: () =>
      c.education.flatMap((e) => [
        row([e.degree, e.field].filter(Boolean).join(", "), e.institution ? ` — ${e.institution}` : "", range(e.startDate, e.endDate, false)),
        ...(e.grade || e.details ? [para([e.grade, e.details].filter(Boolean).join(" · "))] : []),
      ]),
    skills: () => [para(c.skills.join(" • "))],
    projects: () => c.projects.flatMap((p) => [row(p.name, p.role ? ` — ${p.role}` : "", ""), ...p.bullets.filter((x) => x.trim()).map(bullet)]),
    certifications: () => c.certifications.map((ct) => bullet([ct.name, ct.issuer].filter(Boolean).join(", ") + (ct.date ? ` (${ct.date})` : ""))),
    achievements: () => c.achievements.filter((x) => x.trim()).map(bullet),
    additional: () => [para(c.additional)],
  };

  for (const k of t.sectionOrder) {
    const has = k === "summary" ? !!c.summary.trim() : k === "additional" ? !!c.additional.trim() : (c[k] as unknown[]).length > 0;
    if (!has) continue;
    out.push(heading(SECTION_LABELS[k]), ...sections[k]());
  }

  const doc = new Document({
    creator: "DreamJobResume",
    title: `${b.fullName || "Resume"} — Resume`,
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }],
        },
      ],
    },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 800, right: 800 } } }, children: out }],
  });
  return Packer.toBuffer(doc);
}

export async function renderTextDocx(body: string, font = "Calibri"): Promise<Buffer> {
  const doc = new Document({
    creator: "DreamJobResume",
    sections: [
      {
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
        children: body.split(/\n{2,}/).map(
          (p) =>
            new Paragraph({
              spacing: { after: 200 },
              children: p.split("\n").flatMap((line, i) => (i === 0 ? [new TextRun({ text: line, font, size: 22 })] : [new TextRun({ text: line, font, size: 22, break: 1 })])),
            }),
        ),
      },
    ],
  });
  return Packer.toBuffer(doc);
}
