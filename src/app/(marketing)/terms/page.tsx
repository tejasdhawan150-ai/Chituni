import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-5 py-16">
      <h1>Terms of Service</h1>
      <p>By using DreamJobResume you agree to provide accurate information about yourself. You are responsible for the truthfulness of every resume you send to employers.</p>
      <h2>No guarantees</h2>
      <p>ATS scores are internal matching estimates. We do not guarantee interviews, offers, or that any applicant tracking system will accept your resume.</p>
      <h2>Free service</h2>
      <p>DreamJobResume is provided free of charge. To keep it fast for everyone, AI features are subject to a daily fair-use limit per account.</p>
      <h2>Acceptable use</h2>
      <p>Do not use the service to create fraudulent credentials or misrepresent your experience.</p>
      <p className="text-sm text-muted-foreground">Template — have it reviewed by counsel before launch.</p>
    </article>
  );
}
