import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-5 py-16">
      <h1>Privacy Policy</h1>
      <p>DreamJobResume stores the profile, resumes, job descriptions and application data you provide so we can deliver the service. Your data is private to your account and protected by row-level security in our database.</p>
      <h2>AI processing</h2>
      <p>To analyze job descriptions and tailor resumes, relevant text is sent to our AI provider under their API data-use terms. We do not use your resume content to train models.</p>
      <h2>Job descriptions</h2>
      <p>We only process job descriptions you paste. We do not scrape LinkedIn or other job boards.</p>
      <h2>Payments</h2>
      <p>Payments are processed by our payment provider. We never see or store your full card details.</p>
      <h2>Your rights</h2>
      <p>You can export or delete your data at any time by contacting support. Deleting your account removes your profile, resumes and applications.</p>
      <p className="text-sm text-muted-foreground">Template policy — have it reviewed by counsel before launch (e.g. for India&apos;s DPDP Act).</p>
    </article>
  );
}
