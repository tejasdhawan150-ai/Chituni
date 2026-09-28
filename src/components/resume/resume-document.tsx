import * as React from "react";
import type { ResumeContent, SectionKey } from "@/lib/resume/schema";
import { SECTION_LABELS } from "@/lib/resume/schema";
import type { ResumeTemplate } from "@/lib/resume/templates";

/**
 * HTML resume renderer (live preview + template thumbnails). Mirrors the PDF
 * and DOCX renderers: single column, real text, standard section headings.
 */

const DENSITY = { compact: { section: 10, item: 6, line: 1.3 }, normal: { section: 14, item: 8, line: 1.38 }, airy: { section: 18, item: 10, line: 1.45 } };

function dateRange(start: string, end: string, current: boolean) {
  const e = current ? "Present" : end;
  return [start, e].filter(Boolean).join(" – ");
}

function SectionTitle({ t, children }: { t: ResumeTemplate; children: React.ReactNode }) {
  const base: React.CSSProperties = { fontFamily: t.fonts.heading, color: t.accent, fontWeight: t.pdfFonts.headingBold ? 700 : 500, margin: 0 };
  switch (t.sectionTitle) {
    case "underline":
      return <h2 style={{ ...base, fontSize: "1.05em", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${t.accent}`, paddingBottom: 2, marginBottom: 6 }}>{children}</h2>;
    case "caps":
      return <h2 style={{ ...base, fontSize: "1em", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>{children}</h2>;
    case "bar":
      return <h2 style={{ ...base, fontSize: "1.05em", borderLeft: `3px solid ${t.accent}`, paddingLeft: 8, marginBottom: 6 }}>{children}</h2>;
    case "rule-above":
      return <h2 style={{ ...base, fontSize: "1.02em", textTransform: "uppercase", letterSpacing: "0.08em", borderTop: `1.5px solid ${t.accent}`, paddingTop: 4, marginBottom: 6 }}>{children}</h2>;
    default:
      return <h2 style={{ ...base, fontSize: "1.1em", marginBottom: 6 }}>{children}</h2>;
  }
}

function Row({ left, right, bold }: { left: React.ReactNode; right?: React.ReactNode; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <div style={{ fontWeight: bold ? 700 : 400 }}>{left}</div>
      {right ? <div style={{ whiteSpace: "nowrap", fontSize: "0.92em", opacity: 0.8 }}>{right}</div> : null}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  const list = items.filter((b) => b.trim());
  if (!list.length) return null;
  return (
    <ul style={{ margin: "3px 0 0", paddingLeft: 16, listStyleType: "disc" }}>
      {list.map((b, i) => (
        <li key={i} style={{ marginBottom: 2 }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

export function hasSectionContent(c: ResumeContent, key: SectionKey) {
  switch (key) {
    case "summary":
      return !!c.summary.trim();
    case "additional":
      return !!c.additional.trim();
    default:
      return (c[key] as unknown[]).length > 0;
  }
}

export function ResumeDocument({ content: c, template: t, className, style }: { content: ResumeContent; template: ResumeTemplate; className?: string; style?: React.CSSProperties }) {
  const d = DENSITY[t.density];
  const b = c.basics;
  const contact = [b.email, b.phone, b.location, b.linkedinUrl, b.website].filter(Boolean);

  const sections: Record<SectionKey, React.ReactNode> = {
    summary: <p style={{ margin: 0 }}>{c.summary}</p>,
    experience: c.experience.map((e) => (
      <div key={e.id} style={{ marginBottom: d.item }}>
        <Row left={<>{e.title}{e.company ? <span style={{ fontWeight: 400 }}>{t.header === "centered" ? ", " : " — "}{e.company}</span> : null}</>} right={dateRange(e.startDate, e.endDate, e.current)} bold />
        {e.location ? <div style={{ fontSize: "0.92em", opacity: 0.75 }}>{e.location}</div> : null}
        <Bullets items={e.bullets} />
      </div>
    )),
    education: c.education.map((e) => (
      <div key={e.id} style={{ marginBottom: d.item / 1.5 }}>
        <Row left={<>{[e.degree, e.field].filter(Boolean).join(", ")}{e.institution ? <span style={{ fontWeight: 400 }}> — {e.institution}</span> : null}</>} right={dateRange(e.startDate, e.endDate, false)} bold />
        {(e.grade || e.details) && <div style={{ fontSize: "0.95em" }}>{[e.grade, e.details].filter(Boolean).join(" · ")}</div>}
      </div>
    )),
    skills: <p style={{ margin: 0 }}>{c.skills.join(" • ")}</p>,
    projects: c.projects.map((p) => (
      <div key={p.id} style={{ marginBottom: d.item / 1.5 }}>
        <Row left={<>{p.name}{p.role ? <span style={{ fontWeight: 400 }}> — {p.role}</span> : null}</>} bold />
        <Bullets items={p.bullets} />
      </div>
    )),
    certifications: (
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {c.certifications.map((ct) => (
          <li key={ct.id}>
            {ct.name}
            {ct.issuer ? `, ${ct.issuer}` : ""}
            {ct.date ? ` (${ct.date})` : ""}
          </li>
        ))}
      </ul>
    ),
    achievements: <Bullets items={c.achievements} />,
    additional: <p style={{ margin: 0, whiteSpace: "pre-line" }}>{c.additional}</p>,
  };

  const header =
    t.header === "split" ? (
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, borderBottom: `2px solid ${t.accent}`, paddingBottom: 8, marginBottom: d.section }}>
        <div>
          <h1 style={{ fontFamily: t.fonts.heading, fontSize: "2.1em", margin: 0, color: t.accent, fontWeight: 700, letterSpacing: "-0.01em" }}>{b.fullName || "Your Name"}</h1>
          {b.headline && <div style={{ fontSize: "1.05em", marginTop: 2 }}>{b.headline}</div>}
        </div>
        <div style={{ textAlign: "right", fontSize: "0.92em", lineHeight: 1.45 }}>
          {contact.map((x) => (
            <div key={x}>{x}</div>
          ))}
        </div>
      </header>
    ) : (
      <header style={{ textAlign: t.header === "centered" ? "center" : "left", marginBottom: d.section }}>
        <h1 style={{ fontFamily: t.fonts.heading, fontSize: "2.1em", margin: 0, color: t.accent, fontWeight: t.pdfFonts.headingBold ? 700 : 500, letterSpacing: "-0.01em" }}>{b.fullName || "Your Name"}</h1>
        {b.headline && <div style={{ fontSize: "1.05em", marginTop: 2 }}>{b.headline}</div>}
        {contact.length > 0 && <div style={{ fontSize: "0.92em", marginTop: 4, opacity: 0.85 }}>{contact.join("  |  ")}</div>}
      </header>
    );

  return (
    <article
      className={className}
      style={{
        width: 794,
        minHeight: 1123,
        padding: "44px 52px",
        background: "#fff",
        color: "#1f2328",
        fontFamily: t.fonts.body,
        fontSize: `${t.baseSize * 1.333}px`,
        lineHeight: d.line,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {header}
      {t.sectionOrder
        .filter((k) => hasSectionContent(c, k))
        .map((k) => (
          <section key={k} style={{ marginBottom: d.section }}>
            <SectionTitle t={t}>{SECTION_LABELS[k]}</SectionTitle>
            {sections[k]}
          </section>
        ))}
    </article>
  );
}
