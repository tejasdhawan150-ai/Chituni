import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, FileText, Plus, Sparkles, Target, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/app/page-header";
import { ScorePill } from "@/components/app/score-ring";
import { TailorForm } from "@/components/tailor/tailor-form";
import { firstName, greeting, relativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const repo = getRepository();
  const [profile, resumes, analyses, applications] = await Promise.all([
    repo.getProfile(user.id),
    repo.listResumes(user.id),
    repo.listJobAnalyses(user.id, 100),
    repo.listApplications(user.id),
  ]);
  const scored = resumes.filter((r) => r.atsScore !== null);
  const avg = scored.length ? Math.round(scored.reduce((s, r) => s + (r.atsScore ?? 0), 0) / scored.length) : null;
  const profileEmpty = !profile || (!profile.experience.length && !profile.education.length);
  const name = firstName(profile?.basics.fullName || user.name);

  const stats = [
    { label: "My Resumes", value: resumes.length, icon: FileText, href: "/resumes" },
    { label: "Jobs Analyzed", value: analyses.length, icon: Sparkles, href: "/tailor" },
    { label: "Applications", value: applications.length, icon: Briefcase, href: "/applications" },
    { label: "Average Match", value: avg === null ? "—" : `${avg}%`, icon: Target, href: "/resumes" },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {greeting()}, {name}
          </h1>
          <p className="mt-1 text-muted-foreground">Ready to apply for your next opportunity?</p>
        </div>
        <Button size="lg" variant="dark" asChild>
          <Link href="/tailor">
            <Plus /> Create Tailored Resume
          </Link>
        </Button>
      </div>

      {profileEmpty && (
        <Card className="mt-6 border-primary/30 bg-accent/40">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-medium">Complete your profile to start tailoring</p>
                <p className="text-sm text-muted-foreground">Upload your existing resume (PDF/DOCX) or fill it in — takes about 5 minutes.</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/onboarding">Build profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 transition hover:shadow-md">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {s.label}
                <s.icon className="size-4" />
              </div>
              <div className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{s.value}</div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1.6fr]">
          <div className="border-b bg-gradient-to-br from-accent/60 to-transparent p-6 lg:border-b-0 lg:border-r">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0a66c2]/10 px-2 py-0.5 text-xs font-medium text-[#0a66c2]">
              <span className="grid size-3.5 place-items-center rounded-[3px] bg-[#0a66c2] text-[8px] font-bold text-white">in</span> LinkedIn · Naukri · Indeed
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">Found a job on LinkedIn?</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Copy the job description and paste it here. We&apos;ll analyze the role and tailor your resume for it.</p>
            <ol className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li>1. Open the job post and select the full description</li>
              <li>2. Copy it (Ctrl/Cmd + C)</li>
              <li>3. Paste it here and click Tailor My Resume</li>
            </ol>
          </div>
          <div className="p-6">
            <TailorForm />
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Resumes</CardTitle>
            <CardDescription className="mt-1">Your tailored versions, most recent first.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/resumes">
              View all <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {resumes.length === 0 ? (
            <p className="px-5 pb-4 text-sm text-muted-foreground">No resumes yet — paste a job description above to create your first tailored resume.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-5 py-2 font-medium">Resume</th>
                    <th className="px-5 py-2 font-medium">Target role</th>
                    <th className="px-5 py-2 font-medium">Company</th>
                    <th className="px-5 py-2 font-medium">ATS score</th>
                    <th className="px-5 py-2 font-medium">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.slice(0, 6).map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-5 py-3 font-medium">
                        <Link href={`/resumes/${r.id}`} className="hover:underline">
                          {r.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{r.targetRole || "General"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.targetCompany || "—"}</td>
                      <td className="px-5 py-3">
                        <ScorePill score={r.atsScore} />
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{relativeTime(r.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
