"use client";
import * as React from "react";
import { ArrowRight, Briefcase, CircleAlert, FileText, GraduationCap, LoaderCircle, MapPin, Sparkles, Target } from "lucide-react";
import type { JobAnalysis, TailoringResult } from "@/lib/ai/schemas";
import type { AtsReport } from "@/lib/ats/score";
import type { ResumeContent } from "@/lib/resume/schema";
import { MISSING_SKILL_NOTE } from "@/lib/ai/guardrails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScoreRing } from "@/components/app/score-ring";
import { AtsChecks, AtsDisclaimer, BreakdownBars, KeywordChips } from "@/components/app/ats-breakdown";
import { TemplatePicker } from "@/components/resume/template-picker";
import { createTailoredResumeAction } from "@/server/actions/tailor";
import { unwrap } from "@/lib/action-client";
import { getTemplate } from "@/lib/resume/templates";
import { cn } from "@/lib/utils";

interface Props {
  record: { id: string; jobDescription: string; analysis: JobAnalysis; tailoring: TailoringResult; current: AtsReport; projected: AtsReport };
  profile: ResumeContent;
  canUsePro: boolean;
  advancedAts: boolean;
  initialTemplate: string;
}

function ChipList({ items, variant = "default" }: { items: string[]; variant?: "default" | "outline" | "muted" }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Not specified</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <Badge key={s} variant={variant}>
          {s}
        </Badge>
      ))}
    </div>
  );
}

function years(a: JobAnalysis) {
  const { min, max } = a.years_experience;
  if (min === null && max === null) return "Not specified";
  if (min !== null && max !== null) return `${min}–${max} years`;
  return `${min ?? 0}+ years`;
}

export function TailoringReview({ record, profile, canUsePro, advancedAts, initialTemplate }: Props) {
  const { analysis: a, tailoring: t, current, projected } = record;
  const [templateId, setTemplateId] = React.useState(initialTemplate);
  const [applySummary, setApplySummary] = React.useState(!!t.summary);
  const [applySkills, setApplySkills] = React.useState(true);
  const [accepted, setAccepted] = React.useState<Set<string>>(() => new Set(t.experience_recommendations.map((r) => `${r.experience_id}:${r.bullet_index}`)));
  const [pending, setPending] = React.useState(false);
  const expById = new Map(profile.experience.map((e) => [e.id, e]));
  const missing = t.skill_recommendations.filter((r) => r.action === "missing");
  const evidenced = t.skill_recommendations.filter((r) => r.action === "add_from_profile");

  const create = async () => {
    setPending(true);
    const res = await createTailoredResumeAction({ analysisId: record.id, templateId, applySummary, applySkills, acceptedBullets: [...accepted] });
    // On success the action redirects to the editor.
    if (res && !res.ok) {
      unwrap(res);
      setPending(false);
    }
  };

  const toggle = (key: string) =>
    setAccepted((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  return (
    <div className="space-y-8 pb-28">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 text-primary" /> AI job analysis
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{a.job_title || "Untitled role"}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {a.company && (
            <span className="flex items-center gap-1.5">
              <Briefcase className="size-4" /> {a.company}
            </span>
          )}
          {a.seniority !== "unknown" && <Badge variant="outline" className="capitalize">{a.seniority}</Badge>}
          <span className="flex items-center gap-1.5">
            <Target className="size-4" /> {years(a)}
          </span>
          {a.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {a.location}
            </span>
          )}
          <Dialog>
            <DialogTrigger className="flex items-center gap-1.5 text-primary hover:underline">
              <FileText className="size-4" /> View job description
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Job description</DialogTitle>
                <DialogDescription>As pasted.</DialogDescription>
              </DialogHeader>
              <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-4 font-sans text-sm">{record.jobDescription}</pre>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Match */}
      <Card>
        <div className="grid gap-8 p-6 lg:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <ScoreRing score={current.overall} size={104} />
              <div className="mt-2 text-sm font-medium">Current Match</div>
              <div className="text-xs text-muted-foreground">your profile as-is</div>
            </div>
            <ArrowRight className="size-5 text-muted-foreground" />
            <div className="text-center">
              <ScoreRing score={projected.overall} size={104} />
              <div className="mt-2 text-sm font-medium">Projected Match</div>
              <div className="text-xs text-muted-foreground">after optimization</div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-medium">ATS breakdown (projected)</h3>
              <BreakdownBars report={projected} compare={current} />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium">Strong Matches</h3>
                <KeywordChips items={projected.strongMatches} tone="good" max={advancedAts ? undefined : 8} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium">Missing Keywords</h3>
                <KeywordChips items={projected.missingKeywords} tone="bad" max={advancedAts ? undefined : 5} />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t px-6 py-3">
          <AtsDisclaimer />
        </div>
      </Card>

      {/* Analysis */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">What this job is looking for</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Required skills</CardTitle>
            </CardHeader>
            <CardContent>
              <ChipList items={a.required_skills} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Preferred skills</CardTitle>
            </CardHeader>
            <CardContent>
              <ChipList items={a.preferred_skills} variant="outline" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Soft skills</CardTitle>
            </CardHeader>
            <CardContent>
              <ChipList items={a.soft_skills} variant="muted" />
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Key responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              {a.responsibilities.length ? (
                <ul className="space-y-1.5 text-sm">
                  {a.responsibilities.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" /> {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Not specified</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-4" /> Education & experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Education</div>
                <div>{a.education_requirements.join(", ") || "Not specified"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Experience</div>
                <div>{years(a)}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle>ATS keywords & industry terminology</CardTitle>
            </CardHeader>
            <CardContent>
              <ChipList items={[...a.keywords, ...a.industry_terms.filter((x) => !a.keywords.includes(x))]} variant="outline" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skills gap */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skills you already have</CardTitle>
            <CardDescription>Found in your profile — we&apos;ll make sure they&apos;re visible.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <KeywordChips items={t.matched_skills} tone="good" />
            {evidenced.length > 0 && (
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Added to your skills list:</span> {evidenced.map((e) => e.skill).join(", ")} — your experience shows these but they weren&apos;t listed.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Missing skills</CardTitle>
            <CardDescription>We will not add these to your resume.</CardDescription>
          </CardHeader>
          <CardContent>
            {missing.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing missing — great fit.</p>
            ) : (
              <ul className="space-y-2">
                {missing.map((m) => (
                  <li key={m.skill} className="flex items-start gap-2.5 rounded-lg border border-amber-200/70 bg-amber-50/50 p-3">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <div>
                      <div className="text-sm font-medium">{m.skill}</div>
                      <div className="text-xs text-muted-foreground">{MISSING_SKILL_NOTE}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="text-lg font-semibold">Recommended changes</h2>
        <p className="mb-4 text-sm text-muted-foreground">Review and choose what to apply. Nothing changes without your approval.</p>
        <div className="space-y-4">
          {t.summary && (
            <Card className={cn("p-5 transition", !applySummary && "opacity-60")}>
              <label className="flex items-start gap-3">
                <input type="checkbox" checked={applySummary} onChange={(e) => setApplySummary(e.target.checked)} className="mt-1 size-4 accent-[var(--primary)]" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Tailored professional summary</div>
                  {profile.summary && <p className="mt-2 text-sm text-muted-foreground line-through decoration-muted-foreground/40">{profile.summary}</p>}
                  <p className="mt-2 text-sm">{t.summary}</p>
                </div>
              </label>
            </Card>
          )}
          <Card className={cn("p-5 transition", !applySkills && "opacity-60")}>
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={applySkills} onChange={(e) => setApplySkills(e.target.checked)} className="mt-1 size-4 accent-[var(--primary)]" />
              <div className="flex-1">
                <div className="text-sm font-medium">Reorder skills by relevance</div>
                <p className="mt-2 text-sm text-muted-foreground">{t.skills_order.slice(0, 12).join(" • ") || "Keep current order"}</p>
              </div>
            </label>
          </Card>
          {t.experience_recommendations.length > 0 && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Strengthened achievement statements</CardTitle>
                  <CardDescription className="mt-1">
                    {accepted.size} of {t.experience_recommendations.length} selected
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setAccepted(new Set(t.experience_recommendations.map((r) => `${r.experience_id}:${r.bullet_index}`)))}>
                    Select all
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAccepted(new Set())}>
                    None
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.experience_recommendations.map((r) => {
                  const key = `${r.experience_id}:${r.bullet_index}`;
                  const exp = expById.get(r.experience_id);
                  return (
                    <label key={key} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition", accepted.has(key) ? "border-primary/30 bg-accent/30" : "opacity-70")}>
                      <input type="checkbox" checked={accepted.has(key)} onChange={() => toggle(key)} className="mt-1 size-4 accent-[var(--primary)]" />
                      <div className="min-w-0 flex-1 text-sm">
                        {exp && (
                          <div className="mb-1.5 text-xs text-muted-foreground">
                            {exp.title} · {exp.company}
                          </div>
                        )}
                        <p className="text-muted-foreground line-through decoration-muted-foreground/40">{r.original}</p>
                        <p className="mt-1">{r.suggested}</p>
                        {r.reason && <p className="mt-1.5 text-xs text-primary">{r.reason}</p>}
                      </div>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}
          {t.resume_changes.length > 0 && (
            <Card className="p-5">
              <div className="mb-2 text-sm font-medium">Also included</div>
              <ul className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                {t.resume_changes.map((c, i) => (
                  <li key={i}>
                    <span className="font-medium text-foreground">{c.section}:</span> {c.description}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card className="p-5">
            <div className="mb-3 text-sm font-medium">Formatting checks (projected)</div>
            <AtsChecks report={projected} advanced={advancedAts} />
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Choose a template</h2>
        <TemplatePicker value={templateId} onChange={setTemplateId} content={profile} canUsePro={canUsePro} columns="grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" />
      </section>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <div className="hidden text-sm sm:block">
            <span className="text-muted-foreground">Template:</span> <span className="font-medium">{getTemplate(templateId).name}</span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-muted-foreground">Projected match</span> <span className="font-medium tabular-nums">{projected.overall}%</span>
          </div>
          <Button size="lg" onClick={create} disabled={pending} className="w-full sm:w-auto">
            {pending ? <LoaderCircle className="animate-spin" /> : <Sparkles />} Create Tailored Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
