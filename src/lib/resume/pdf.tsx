import "server-only";
import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ResumeContent, SectionKey } from "./schema";
import { SECTION_LABELS } from "./schema";
import type { ResumeTemplate } from "./templates";

/**
 * Text-based PDF export (selectable, parseable by ATS). Uses built-in PDF
 * fonts so no font files need to be fetched at runtime.
 */

const boldOf = (f: string) => (f === "Times-Roman" ? "Times-Bold" : f === "Courier" ? "Courier-Bold" : "Helvetica-Bold");
const SPACING = { compact: { section: 8, item: 5 }, normal: { section: 11, item: 7 }, airy: { section: 14, item: 9 } };

const hasContent = (c: ResumeContent, k: SectionKey) =>
  k === "summary" ? !!c.summary.trim() : k === "additional" ? !!c.additional.trim() : (c[k] as unknown[]).length > 0;

function range(start: string, end: string, current: boolean) {
  return [start, current ? "Present" : end].filter(Boolean).join(" – ");
}

export function ResumePdf({ content: c, template: t }: { content: ResumeContent; template: ResumeTemplate }) {
  const sp = SPACING[t.density];
  const bodyBold = boldOf(t.pdfFonts.body);
  const headingFont = t.pdfFonts.headingBold ? boldOf(t.pdfFonts.heading) : t.pdfFonts.heading;
  const s = StyleSheet.create({
    page: { paddingVertical: 34, paddingHorizontal: 40, fontFamily: t.pdfFonts.body, fontSize: t.baseSize, color: "#1f2328", lineHeight: 1.35 },
    name: { fontFamily: headingFont, fontSize: t.baseSize * 2, color: t.accent, textAlign: t.header === "centered" ? "center" : "left" },
    headline: { fontSize: t.baseSize + 0.5, marginTop: 2, textAlign: t.header === "centered" ? "center" : "left" },
    contact: { fontSize: t.baseSize - 0.8, marginTop: 3, color: "#444", textAlign: t.header === "centered" ? "center" : "left" },
    section: { marginTop: sp.section },
    sectionTitle: {
      fontFamily: headingFont,
      fontSize: t.baseSize + 0.8,
      color: t.accent,
      marginBottom: 4,
      textTransform: t.sectionTitle === "plain" || t.sectionTitle === "bar" ? "none" : "uppercase",
      letterSpacing: t.sectionTitle === "caps" ? 1.4 : 0.5,
      ...(t.sectionTitle === "underline" ? { borderBottomWidth: 0.8, borderBottomColor: t.accent, paddingBottom: 2 } : {}),
      ...(t.sectionTitle === "rule-above" ? { borderTopWidth: 1.2, borderTopColor: t.accent, paddingTop: 3 } : {}),
      ...(t.sectionTitle === "bar" ? { borderLeftWidth: 2.5, borderLeftColor: t.accent, paddingLeft: 6 } : {}),
    },
    row: { flexDirection: "row", justifyContent: "space-between" },
    bold: { fontFamily: bodyBold },
    muted: { color: "#555", fontSize: t.baseSize - 0.8 },
    item: { marginBottom: sp.item },
    bulletRow: { flexDirection: "row", marginTop: 1.5, paddingLeft: 4 },
    bulletDot: { width: 10 },
    bulletText: { flex: 1 },
  });

  const Bullets = ({ items }: { items: string[] }) => (
    <>
      {items
        .filter((b) => b.trim())
        .map((b, i) => (
          <View key={i} style={s.bulletRow} wrap={false}>
            <Text style={s.bulletDot}>•</Text>
            <Text style={s.bulletText}>{b}</Text>
          </View>
        ))}
    </>
  );

  const render: Record<SectionKey, React.ReactNode> = {
    summary: <Text>{c.summary}</Text>,
    experience: c.experience.map((e) => (
      <View key={e.id} style={s.item}>
        <View style={s.row}>
          <Text style={{ flex: 1 }}>
            <Text style={s.bold}>{e.title}</Text>
            {e.company ? ` — ${e.company}` : ""}
            {e.location ? `, ${e.location}` : ""}
          </Text>
          <Text style={s.muted}>{range(e.startDate, e.endDate, e.current)}</Text>
        </View>
        <Bullets items={e.bullets} />
      </View>
    )),
    education: c.education.map((e) => (
      <View key={e.id} style={s.item} wrap={false}>
        <View style={s.row}>
          <Text style={{ flex: 1 }}>
            <Text style={s.bold}>{[e.degree, e.field].filter(Boolean).join(", ")}</Text>
            {e.institution ? ` — ${e.institution}` : ""}
          </Text>
          <Text style={s.muted}>{range(e.startDate, e.endDate, false)}</Text>
        </View>
        {e.grade || e.details ? <Text>{[e.grade, e.details].filter(Boolean).join(" · ")}</Text> : null}
      </View>
    )),
    skills: <Text>{c.skills.join(" • ")}</Text>,
    projects: c.projects.map((p) => (
      <View key={p.id} style={s.item}>
        <Text>
          <Text style={s.bold}>{p.name}</Text>
          {p.role ? ` — ${p.role}` : ""}
        </Text>
        <Bullets items={p.bullets} />
      </View>
    )),
    certifications: <Bullets items={c.certifications.map((ct) => [ct.name, ct.issuer].filter(Boolean).join(", ") + (ct.date ? ` (${ct.date})` : ""))} />,
    achievements: <Bullets items={c.achievements} />,
    additional: <Text>{c.additional}</Text>,
  };

  const b = c.basics;
  const contact = [b.email, b.phone, b.location, b.linkedinUrl, b.website].filter(Boolean).join("  |  ");

  return (
    <Document title={`${b.fullName || "Resume"} — Resume`} author={b.fullName} creator="DreamJobResume" producer="DreamJobResume">
      <Page size="A4" style={s.page}>
        <View style={t.header === "split" ? { borderBottomWidth: 1.5, borderBottomColor: t.accent, paddingBottom: 6 } : {}}>
          <Text style={s.name}>{b.fullName || "Your Name"}</Text>
          {b.headline ? <Text style={s.headline}>{b.headline}</Text> : null}
          {contact ? <Text style={s.contact}>{contact}</Text> : null}
        </View>
        {t.sectionOrder
          .filter((k) => hasContent(c, k))
          .map((k) => (
            <View key={k} style={s.section}>
              <Text style={s.sectionTitle}>{SECTION_LABELS[k]}</Text>
              {render[k]}
            </View>
          ))}
      </Page>
    </Document>
  );
}

export async function renderResumePdf(content: ResumeContent, template: ResumeTemplate): Promise<Buffer> {
  return renderToBuffer(<ResumePdf content={content} template={template} />);
}

export async function renderTextPdf(title: string, body: string, author: string): Promise<Buffer> {
  const s = StyleSheet.create({
    page: { padding: 56, fontFamily: "Helvetica", fontSize: 11, lineHeight: 1.5, color: "#1f2328" },
    p: { marginBottom: 10 },
  });
  return renderToBuffer(
    <Document title={title} author={author} creator="DreamJobResume">
      <Page size="A4" style={s.page}>
        {body.split(/\n{2,}/).map((p, i) => (
          <Text key={i} style={s.p}>
            {p}
          </Text>
        ))}
      </Page>
    </Document>,
  );
}
