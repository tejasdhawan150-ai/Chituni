import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-5 py-16">
      <h1>Privacy Policy</h1>
      <p>DreamJobResume doesn&apos;t need an account and doesn&apos;t keep a database of resumes.</p>
      <h2>Your resume</h2>
      <p>When you upload a resume or paste a job description, it&apos;s sent to our server only to read it, tailor it and create your download. We don&apos;t store it. Your latest resume is saved in your own browser so you don&apos;t lose your work; you can clear it with “Start over”.</p>
      <h2>AI processing</h2>
      <p>If AI is switched on, the relevant text is sent to our AI provider under their API data-use terms. We do not use your resume to train models.</p>
      <h2>Job descriptions</h2>
      <p>We only process job descriptions you paste. We do not scrape LinkedIn or other job boards.</p>
      <p className="text-sm text-muted-foreground">Template policy — have it reviewed before launch (e.g. for India&apos;s DPDP Act).</p>
    </article>
  );
}
