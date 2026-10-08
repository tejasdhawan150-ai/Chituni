"use client";
import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, Check, CircleAlert, Download, FileUp, LoaderCircle, Pencil, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScaledResume } from "@/components/resume/scaled-resume";
import { TEMPLATES, getTemplate } from "@/lib/resume/templates";
import { profileToContent, type ResumeContent } from "@/lib/resume/schema";
import type { JobAnalysis } from "@/lib/ai/schemas";
import { scoreResume } from "@/lib/ats/score";
import { DEMO_PROFILE, SAMPLE_JD_DELOITTE } from "@/lib/demo/samples";
import { cn } from "@/lib/utils";

interface TailorResult {
  jobTitle: string;
  company: string;
  analysis: JobAnalysis;
  before: number;
  after: number;
  missingSkills: string[];
  changes: string[];
  tailored: ResumeContent;
}

const STORAGE_KEY = "dreamjobresume:v1";

/** Remove empty bullets/skills left over from editing. */
function clean(c: ResumeContent): ResumeContent {
  return {
    ...c,
    skills: c.skills.map((s) => s.trim()).filter(Boolean),
    experience: c.experience.map((e) => ({ ...e, bullets: e.bullets.map((b) => b.trim()).filter(Boolean) })),
  };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

function StepTitle({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className={cn("grid size-7 place-items-center rounded-full text-sm font-semibold", done ? "bg-emerald-500 text-white" : "bg-foreground text-background")}>
        {done ? <Check className="size-4" /> : n}
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

/** Plain, simple editor for the resume text. */
function SimpleEditor({ value, onChange }: { value: ResumeContent; onChange: (c: ResumeContent) => void }) {
  const b = value.basics;
  const setBasics = (k: keyof ResumeContent["basics"], v: string) => onChange({ ...value, basics: { ...b, [k]: v } });
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name">
          <Input value={b.fullName} onChange={(e) => setBasics("fullName", e.target.value)} />
        </Field>
        <Field label="Headline">
          <Input value={b.headline} onChange={(e) => setBasics("headline", e.target.value)} />
        </Field>
        <Field label="Email">
          <Input value={b.email} onChange={(e) => setBasics("email", e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={b.phone} onChange={(e) => setBasics("phone", e.target.value)} />
        </Field>
        <Field label="City">
          <Input value={b.location} onChange={(e) => setBasics("location", e.target.value)} />
        </Field>
        <Field label="LinkedIn">
          <Input value={b.linkedinUrl} onChange={(e) => setBasics("linkedinUrl", e.target.value)} />
        </Field>
      </div>
      <Field label="Summary">
        <Textarea rows={4} value={value.summary} onChange={(e) => onChange({ ...value, summary: e.target.value })} />
      </Field>
      {value.experience.map((exp, i) => {
        const setExp = (patch: Partial<typeof exp>) => onChange({ ...value, experience: value.experience.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
        return (
          <div key={exp.id} className="space-y-3 rounded-lg border p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Job title">
                <Input value={exp.title} onChange={(e) => setExp({ title: e.target.value })} />
              </Field>
              <Field label="Company">
                <Input value={exp.company} onChange={(e) => setExp({ company: e.target.value })} />
              </Field>
              <Field label="Start">
                <Input value={exp.startDate} onChange={(e) => setExp({ startDate: e.target.value })} />
              </Field>
              <Field label="End">
                <Input value={exp.current ? "Present" : exp.endDate} onChange={(e) => setExp({ endDate: e.target.value, current: /present/i.test(e.target.value) })} />
              </Field>
            </div>
            <Field label="What you did (one point per line)">
              <Textarea rows={4} value={exp.bullets.join("\n")} onChange={(e) => setExp({ bullets: e.target.value.split("\n") })} />
            </Field>
          </div>
        );
      })}
      {value.education.map((ed, i) => {
        const setEd = (patch: Partial<typeof ed>) => onChange({ ...value, education: value.education.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
        return (
          <div key={ed.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
            <Field label="Degree">
              <Input value={ed.degree} onChange={(e) => setEd({ degree: e.target.value })} />
            </Field>
            <Field label="College">
              <Input value={ed.institution} onChange={(e) => setEd({ institution: e.target.value })} />
            </Field>
            <Field label="Year">
              <Input value={ed.endDate} onChange={(e) => setEd({ endDate: e.target.value })} />
            </Field>
          </div>
        );
      })}
      <Field label="Skills (separate with commas)">
        <Textarea rows={2} value={value.skills.join(", ")} onChange={(e) => onChange({ ...value, skills: e.target.value.split(",").map((s) => s.replace(/^\s+/, "")) })} />
      </Field>
    </div>
  );
}

export function ResumeTool() {
  const [resume, setResume] = React.useState<ResumeContent | null>(null);
  const [jd, setJd] = React.useState("");
  const [result, setResult] = React.useState<TailorResult | null>(null);
  const [edited, setEdited] = React.useState<ResumeContent | null>(null);
  const [templateId, setTemplateId] = React.useState(TEMPLATES[0].id);
  const [pasted, setPasted] = React.useState("");
  const [busy, setBusy] = React.useState<"" | "reading" | "tailoring" | "pdf" | "docx">("");
  const [editing, setEditing] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  // Restore the last session from this browser.
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      if (saved) {
        /* eslint-disable react-hooks/set-state-in-effect */
        setResume(saved.resume ?? null);
        setJd(saved.jd ?? "");
        setResult(saved.result ?? null);
        setEdited(saved.edited ?? null);
        if (saved.templateId && TEMPLATES.some((t) => t.id === saved.templateId)) setTemplateId(saved.templateId);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      // ignore broken storage
    }
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ resume, jd, result, edited, templateId }));
    } catch {
      // storage full or blocked — not critical
    }
  }, [loaded, resume, jd, result, edited, templateId]);

  const applyResume = (r: ResumeContent | null) => {
    setResume(r);
    setResult(null);
    setEdited(null);
  };

  const uploadFile = async (file?: File | null) => {
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) return void toast.error("Please upload a PDF or Word (.docx) file.");
    setBusy("reading");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't read that file.");
      applyResume(data.resume);
      toast.success("Resume added.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const readPastedText = async () => {
    if (pasted.trim().length < 80) return void toast.error("Please paste your full resume text.");
    setBusy("reading");
    try {
      const data = await postJson<{ resume: ResumeContent }>("/api/resume/parse", { text: pasted });
      applyResume(data.resume);
      toast.success("Resume added.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const trySample = () => {
    applyResume(profileToContent(DEMO_PROFILE));
    setJd(SAMPLE_JD_DELOITTE);
  };

  const tailor = async () => {
    if (!resume) return void toast.error("First add your resume (step 1).");
    if (jd.trim().length < 80) return void toast.error("Please paste the full job description (step 2).");
    setBusy("tailoring");
    try {
      const data = await postJson<TailorResult>("/api/resume/tailor", { resume, jobDescription: jd });
      setResult(data);
      setEdited(data.tailored);
      setEditing(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const download = async (format: "pdf" | "docx") => {
    if (!edited) return;
    setBusy(format);
    try {
      const res = await fetch("/api/resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: clean(edited), templateId, format }),
      });
      if (!res.ok) throw new Error("Download failed. Please try again.");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(edited.basics.fullName || "my").replace(/\s+/g, "-").toLowerCase()}-resume.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const startOver = () => {
    setResume(null);
    setJd("");
    setResult(null);
    setEdited(null);
    setPasted("");
    setEditing(false);
  };

  // Live score as the user edits the tailored resume.
  const liveScore = React.useMemo(() => (result && edited ? scoreResume(clean(edited), result.analysis).overall : null), [result, edited]);

  return (
    <div className="space-y-6">
      {/* STEP 1 */}
      <Card className="p-6">
        <StepTitle n={1} title="Add your resume" done={!!resume} />
        {resume ? (
          <div className="flex flex-col gap-3 rounded-xl bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Check className="size-4 text-emerald-600" />
              <span>
                <span className="font-medium">{resume.basics.fullName || "Your resume"}</span> — {resume.experience.length} job{resume.experience.length === 1 ? "" : "s"}, {resume.skills.length} skills
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => applyResume(null)}>
              Change resume
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  uploadFile(e.dataTransfer.files[0]);
                }}
                disabled={!!busy}
                className={cn(
                  "flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition hover:border-primary hover:bg-accent/40",
                  dragging && "border-primary bg-accent/40",
                )}
              >
                {busy === "reading" ? <LoaderCircle className="size-7 animate-spin text-primary" /> : <FileUp className="size-7 text-primary" />}
                <span className="font-medium">{busy === "reading" ? "Reading your resume…" : "Upload your resume"}</span>
                <span className="text-xs text-muted-foreground">PDF or Word file · click or drag it here</span>
              </button>
              <input ref={fileInput} type="file" accept=".pdf,.docx" hidden onChange={(e) => uploadFile(e.target.files?.[0])} />
              <div className="flex flex-col gap-2">
                <Textarea value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="…or paste your resume text here" className="min-h-32 flex-1" disabled={!!busy} />
                <Button variant="outline" onClick={readPastedText} disabled={!!busy || !pasted.trim()}>
                  Use this text
                </Button>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              No resume handy?{" "}
              <button type="button" onClick={trySample} className="font-medium text-primary hover:underline">
                Try it with a sample
              </button>
            </p>
          </>
        )}
      </Card>

      {/* STEP 2 */}
      <Card className="p-6">
        <StepTitle n={2} title="Paste the job description" done={jd.trim().length >= 80} />
        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Copy the job post from LinkedIn, Naukri, Indeed or a company website and paste it here."
          className="min-h-48 text-[14px] leading-relaxed"
        />
      </Card>

      <Button size="xl" className="w-full" onClick={tailor} disabled={busy === "tailoring" || busy === "reading"}>
        {busy === "tailoring" ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
        {busy === "tailoring" ? "Tailoring your resume…" : "Tailor My Resume"}
      </Button>

      {/* STEP 3 */}
      {result && edited && (
        <div ref={resultRef} className="scroll-mt-20">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StepTitle n={3} title="Your tailored resume" done />
              <button type="button" onClick={startOver} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <RotateCcw className="size-3.5" /> Start over
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Left: results */}
              <div className="space-y-5">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-muted-foreground">Match with {result.company ? `${result.company}` : "this job"}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg text-muted-foreground line-through">{result.before}%</span>
                    <ArrowRight className="size-4 self-center text-muted-foreground" />
                    <span className="text-4xl font-semibold text-emerald-600">{liveScore ?? result.after}%</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-muted-foreground">An estimate of how well your resume matches the job — not a guarantee.</p>
                </div>

                {result.changes.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-medium">What we improved</div>
                    <ul className="space-y-1.5 text-sm">
                      {result.changes.map((c) => (
                        <li key={c} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.missingSkills.length > 0 && (
                  <div className="rounded-xl bg-amber-50 p-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-amber-900">
                      <CircleAlert className="size-4" /> The job also asks for
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {result.missingSkills.map((s) => (
                        <span key={s} className="rounded-md bg-white px-2 py-0.5 text-xs text-amber-900 ring-1 ring-amber-200">
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-amber-900/80">We didn&apos;t add these. Add them yourself only if you genuinely have this experience.</p>
                  </div>
                )}
              </div>

              {/* Right: preview + download */}
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplateId(t.id)}
                        className={cn("rounded-full border px-3 py-1 text-sm transition", templateId === t.id ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-muted")}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => download("pdf")} disabled={!!busy}>
                      {busy === "pdf" ? <LoaderCircle className="animate-spin" /> : <Download />} PDF
                    </Button>
                    <Button variant="outline" onClick={() => download("docx")} disabled={!!busy}>
                      {busy === "docx" ? <LoaderCircle className="animate-spin" /> : <Download />} Word
                    </Button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md bg-white shadow-[0_8px_40px_-12px_rgba(15,23,42,0.25)] ring-1 ring-black/5">
                  <ScaledResume content={clean(edited)} template={getTemplate(templateId)} />
                </div>

                <div className="rounded-xl border">
                  <button type="button" onClick={() => setEditing((e) => !e)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <Pencil className="size-4" /> {editing ? "Done editing" : "Edit the text"}
                    </span>
                    <span className="text-xs text-muted-foreground">{editing ? "Close" : "Fix anything we got wrong"}</span>
                  </button>
                  {editing && (
                    <div className="border-t p-4">
                      <SimpleEditor value={edited} onChange={setEdited} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
