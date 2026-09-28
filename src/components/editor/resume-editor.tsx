"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Lightbulb,
  LoaderCircle,
  Mail,
  Plus,
  Save,
  Sparkles,
  Trash,
} from "lucide-react";
import type { JobAnalysis } from "@/lib/ai/schemas";
import { scoreResume } from "@/lib/ats/score";
import { mentionsSkill } from "@/lib/ats/taxonomy";
import type { ResumeContent } from "@/lib/resume/schema";
import { getTemplate } from "@/lib/resume/templates";
import { MBA_GUIDES } from "@/config/mba";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScaledResume } from "@/components/resume/scaled-resume";
import { TemplatePicker } from "@/components/resume/template-picker";
import { ScoreRing } from "@/components/app/score-ring";
import { AtsChecks, AtsDisclaimer, BreakdownBars, KeywordChips } from "@/components/app/ats-breakdown";
import { SkillsInput } from "@/components/profile/skills-input";
import { LinesField } from "@/components/profile/lines-field";
import { BulletEditor, type AiContext } from "./bullet-editor";
import { deleteResumeAction, duplicateResumeAction, saveResumeAction } from "@/server/actions/resumes";
import { unwrap } from "@/lib/action-client";
import { cn, relativeTime, uid } from "@/lib/utils";
import { downloadFile } from "@/lib/download";

export interface EditorProps {
  resume: { id: string; title: string; templateId: string; targetRole: string; targetCompany: string; content: ResumeContent; updatedAt: string };
  analysis: JobAnalysis | null;
  profileSkills: string[];
  mbaSpecialization: string;
}

type SaveState = "saved" | "dirty" | "saving" | "error";

function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function ResumeEditor({ resume, analysis, profileSkills, mbaSpecialization }: EditorProps) {
  const router = useRouter();
  const [content, setContent] = React.useState<ResumeContent>(resume.content);
  const [meta, setMeta] = React.useState({ title: resume.title, templateId: resume.templateId, targetRole: resume.targetRole, targetCompany: resume.targetCompany });
  const [save, setSave] = React.useState<SaveState>("saved");
  const [savedAt, setSavedAt] = React.useState(resume.updatedAt);
  const [templateOpen, setTemplateOpen] = React.useState(false);
  const [mobileTab, setMobileTab] = React.useState("edit");
  const first = React.useRef(true);
  const template = getTemplate(meta.templateId);

  const update = React.useCallback(<K extends keyof ResumeContent>(key: K, value: ResumeContent[K]) => setContent((c) => ({ ...c, [key]: value })), []);

  // Autosave (debounced)
  const latest = React.useRef({ content, meta });
  React.useLayoutEffect(() => {
    latest.current = { content, meta };
  }, [content, meta]);
  const doSave = React.useCallback(async () => {
    setSave("saving");
    const { content: c, meta: m } = latest.current;
    const res = await saveResumeAction({ id: resume.id, ...m, title: m.title || "Untitled resume", content: c });
    if (res.ok) {
      setSave("saved");
      setSavedAt(res.data.updatedAt);
    } else {
      setSave("error");
      unwrap(res);
    }
  }, [resume.id]);

  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSave("dirty");
    const t = setTimeout(doSave, 1200);
    return () => clearTimeout(t);
  }, [content, meta, doSave]);

  React.useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save === "dirty" || save === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  // Live ATS
  const report = React.useMemo(() => (analysis ? scoreResume(content, analysis, { atsSafeTemplate: template.atsSafe }) : null), [content, analysis, template.atsSafe]);

  const ai: AiContext = React.useMemo(
    () => ({
      role: meta.targetRole || analysis?.job_title || "",
      keywords: analysis ? [...analysis.required_skills, ...analysis.preferred_skills, ...analysis.keywords].slice(0, 40) : [],
      userSkills: Array.from(new Set([...profileSkills, ...content.skills])).slice(0, 80),
    }),
    [meta.targetRole, analysis, profileSkills, content.skills],
  );

  const guide = MBA_GUIDES.find((g) => g.name === mbaSpecialization);
  const bullets = content.experience.flatMap((e) => e.bullets).filter(Boolean);
  const weak = bullets.filter((b) => /^(responsible for|worked on|helped|assisted|involved in|handled)\b/i.test(b)).length;
  const unquantified = bullets.filter((b) => !/\d/.test(b)).length;
  const tips = [
    weak > 0 && `${weak} bullet${weak > 1 ? "s start" : " starts"} with a weak opener like “Responsible for”. Use “Improve Bullet”.`,
    unquantified > 0 && `${unquantified} bullet${unquantified > 1 ? "s have" : " has"} no numbers. Add real metrics where you have them (%, ₹, time, team size).`,
    content.summary.split(/\s+/).length > 120 && "Your summary is long — aim for 45–90 words.",
    !content.basics.linkedinUrl && "Add your LinkedIn URL — recruiters check it.",
    report && report.missingSkills.length > 0 && `The job asks for ${report.missingSkills.slice(0, 3).join(", ")}. Add only if you genuinely have this experience.`,
  ].filter(Boolean) as string[];

  const download = (format: "pdf" | "docx") => {
    const go = () => downloadFile(`/api/resumes/${resume.id}/export?format=${format}`);
    if (save !== "saved") doSave().then(go);
    else go();
  };

  const saveLabel = { saved: `Saved ${relativeTime(savedAt)}`, dirty: "Unsaved changes", saving: "Saving…", error: "Save failed" }[save];

  const editPanel = (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        <F label="Resume name" className="col-span-2">
          <Input value={meta.title} onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))} />
        </F>
        <F label="Target role">
          <Input value={meta.targetRole} onChange={(e) => setMeta((m) => ({ ...m, targetRole: e.target.value }))} />
        </F>
        <F label="Target company">
          <Input value={meta.targetCompany} onChange={(e) => setMeta((m) => ({ ...m, targetCompany: e.target.value }))} />
        </F>
      </div>

      <button onClick={() => setTemplateOpen(true)} className="flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition hover:bg-muted/50">
        <span>
          <span className="text-xs text-muted-foreground">Template</span>
          <span className="block font-medium">{template.name}</span>
        </span>
        <span className="text-xs text-primary">Change</span>
      </button>

      <Accordion type="multiple" defaultValue={["experience"]} className="rounded-lg border bg-card px-3">
        <AccordionItem value="basics">
          <AccordionTrigger className="py-3 text-sm">Contact & headline</AccordionTrigger>
          <AccordionContent className="text-foreground">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["fullName", "Full name"],
                  ["headline", "Headline"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["location", "Location"],
                  ["linkedinUrl", "LinkedIn"],
                ] as const
              ).map(([k, l]) => (
                <F key={k} label={l}>
                  <Input value={content.basics[k]} onChange={(e) => update("basics", { ...content.basics, [k]: e.target.value })} />
                </F>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="summary">
          <AccordionTrigger className="py-3 text-sm">Summary</AccordionTrigger>
          <AccordionContent className="text-foreground">
            <Textarea rows={5} value={content.summary} onChange={(e) => update("summary", e.target.value)} className="text-[13px] leading-relaxed" />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{content.summary.trim() ? content.summary.trim().split(/\s+/).length : 0} words</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience">
          <AccordionTrigger className="py-3 text-sm">Experience</AccordionTrigger>
          <AccordionContent className="space-y-5 text-foreground">
            {content.experience.map((e, i) => {
              const setExp = (patch: Partial<typeof e>) => update("experience", content.experience.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <div key={e.id} className="space-y-2.5 rounded-lg bg-muted/30 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={e.title} onChange={(ev) => setExp({ title: ev.target.value })} placeholder="Title" />
                    <Input value={e.company} onChange={(ev) => setExp({ company: ev.target.value })} placeholder="Company" />
                    <Input value={e.startDate} onChange={(ev) => setExp({ startDate: ev.target.value })} placeholder="Start" />
                    <Input value={e.current ? "Present" : e.endDate} disabled={e.current} onChange={(ev) => setExp({ endDate: ev.target.value })} placeholder="End" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" checked={e.current} onChange={(ev) => setExp({ current: ev.target.checked })} /> Current role
                    </label>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => update("experience", content.experience.filter((_, j) => j !== i))}>
                      <Trash /> Remove role
                    </Button>
                  </div>
                  <BulletEditor bullets={e.bullets} onChange={(b) => setExp({ bullets: b })} ai={ai} />
                </div>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => update("experience", [...content.experience, { id: uid("exp"), title: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] }])}
            >
              <Plus /> Add role
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education">
          <AccordionTrigger className="py-3 text-sm">Education</AccordionTrigger>
          <AccordionContent className="space-y-3 text-foreground">
            {content.education.map((ed, i) => {
              const setEd = (patch: Partial<typeof ed>) => update("education", content.education.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <div key={ed.id} className="grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-3">
                  <Input value={ed.degree} onChange={(ev) => setEd({ degree: ev.target.value })} placeholder="Degree" />
                  <Input value={ed.field} onChange={(ev) => setEd({ field: ev.target.value })} placeholder="Field" />
                  <Input className="col-span-2" value={ed.institution} onChange={(ev) => setEd({ institution: ev.target.value })} placeholder="Institution" />
                  <Input value={ed.startDate} onChange={(ev) => setEd({ startDate: ev.target.value })} placeholder="Start" />
                  <Input value={ed.endDate} onChange={(ev) => setEd({ endDate: ev.target.value })} placeholder="End" />
                  <Input value={ed.grade} onChange={(ev) => setEd({ grade: ev.target.value })} placeholder="Grade" />
                  <Button variant="ghost" size="sm" className="justify-self-end text-muted-foreground" onClick={() => update("education", content.education.filter((_, j) => j !== i))}>
                    <Trash /> Remove
                  </Button>
                  <Input className="col-span-2" value={ed.details} onChange={(ev) => setEd({ details: ev.target.value })} placeholder="Highlights" />
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => update("education", [...content.education, { id: uid("edu"), institution: "", degree: "", field: "", startDate: "", endDate: "", grade: "", details: "" }])}>
              <Plus /> Add education
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills">
          <AccordionTrigger className="py-3 text-sm">Skills</AccordionTrigger>
          <AccordionContent className="text-foreground">
            <SkillsInput value={content.skills} onChange={(v) => update("skills", v)} />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Order matters — put the most relevant skills first.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="projects">
          <AccordionTrigger className="py-3 text-sm">Projects</AccordionTrigger>
          <AccordionContent className="space-y-3 text-foreground">
            {content.projects.map((p, i) => {
              const setP = (patch: Partial<typeof p>) => update("projects", content.projects.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <div key={p.id} className="space-y-2 rounded-lg bg-muted/30 p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={p.name} onChange={(ev) => setP({ name: ev.target.value })} placeholder="Project" />
                    <Input value={p.role} onChange={(ev) => setP({ role: ev.target.value })} placeholder="Role" />
                  </div>
                  <BulletEditor bullets={p.bullets} onChange={(b) => setP({ bullets: b })} ai={ai} />
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => update("projects", content.projects.filter((_, j) => j !== i))}>
                    <Trash /> Remove project
                  </Button>
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => update("projects", [...content.projects, { id: uid("proj"), name: "", role: "", bullets: [""] }])}>
              <Plus /> Add project
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="certifications">
          <AccordionTrigger className="py-3 text-sm">Certifications</AccordionTrigger>
          <AccordionContent className="space-y-2 text-foreground">
            {content.certifications.map((c, i) => {
              const setC = (patch: Partial<typeof c>) => update("certifications", content.certifications.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <div key={c.id} className="grid grid-cols-[2fr_1.2fr_0.8fr_auto] gap-2">
                  <Input value={c.name} onChange={(ev) => setC({ name: ev.target.value })} placeholder="Name" />
                  <Input value={c.issuer} onChange={(ev) => setC({ issuer: ev.target.value })} placeholder="Issuer" />
                  <Input value={c.date} onChange={(ev) => setC({ date: ev.target.value })} placeholder="Year" />
                  <Button variant="ghost" size="icon" onClick={() => update("certifications", content.certifications.filter((_, j) => j !== i))} aria-label="Remove">
                    <Trash />
                  </Button>
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => update("certifications", [...content.certifications, { id: uid("cert"), name: "", issuer: "", date: "" }])}>
              <Plus /> Add certification
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="achievements">
          <AccordionTrigger className="py-3 text-sm">Achievements</AccordionTrigger>
          <AccordionContent className="text-foreground">
            <LinesField value={content.achievements} onChange={(v) => update("achievements", v)} rows={4} placeholder="One achievement per line" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="additional" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm">Additional information</AccordionTrigger>
          <AccordionContent className="text-foreground">
            <Textarea rows={3} value={content.additional} onChange={(e) => update("additional", e.target.value)} placeholder="Languages, interests, volunteering" className="text-[13px]" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  const previewPanel = (
    <div className="p-4 sm:p-8">
      <div className="mx-auto max-w-[720px] overflow-hidden rounded-sm bg-white shadow-[0_8px_40px_-12px_rgba(15,23,42,0.25)] ring-1 ring-black/5">
        <ScaledResume content={content} template={template} />
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">Live preview · A4 · {template.name}</p>
    </div>
  );

  const insightsPanel = (
    <div className="space-y-5 p-4">
      {report ? (
        <>
          <div className="flex items-center gap-4">
            <ScoreRing score={report.overall} size={84} stroke={7} />
            <div>
              <div className="text-sm font-medium">ATS Compatibility</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">
                {report.overall}
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <div className="text-xs text-muted-foreground">vs. {meta.targetCompany || analysis?.company || "target job"}</div>
            </div>
          </div>
          <BreakdownBars report={report} />
          <div>
            <div className="mb-1.5 text-xs font-medium">Missing Keywords</div>
            <KeywordChips items={report.missingKeywords} tone="bad" max={14} />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium">Strong Matches</div>
            <KeywordChips items={report.strongMatches} tone="good" max={12} />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium">Checks</div>
            <AtsChecks report={report} />
          </div>
          <AtsDisclaimer />
        </>
      ) : (
        <div className="rounded-xl border border-dashed p-4 text-center">
          <Sparkles className="mx-auto size-5 text-primary" />
          <p className="mt-2 text-sm font-medium">No job linked</p>
          <p className="mt-1 text-xs text-muted-foreground">Tailor this resume to a job description to see a live ATS match score.</p>
          <Button size="sm" className="mt-3" asChild>
            <Link href="/tailor">Tailor My Resume</Link>
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <Lightbulb className="size-3.5 text-amber-500" /> AI recommendations
        </div>
        {tips.length === 0 ? (
          <p className="text-xs text-muted-foreground">Looking sharp. No issues found.</p>
        ) : (
          tips.map((t) => (
            <div key={t} className="rounded-lg bg-muted/50 p-2.5 text-xs leading-relaxed">
              {t}
            </div>
          ))
        )}
      </div>

      {analysis && (
        <div>
          <div className="mb-1.5 text-xs font-medium">Job keywords you already have</div>
          <div className="flex flex-wrap gap-1">
            {analysis.required_skills
              .filter((k) => ai.userSkills.some((s) => mentionsSkill(s, k)) && !content.skills.some((s) => mentionsSkill(s, k)))
              .map((k) => (
                <button key={k} onClick={() => update("skills", [k, ...content.skills])} className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-0.5 text-[11px] hover:border-primary hover:text-primary">
                  <Plus className="size-3" /> {k}
                </button>
              ))}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Skills from your profile that aren&apos;t on this resume yet.</p>
        </div>
      )}

      {guide && (
        <div className="rounded-xl border p-3">
          <div className="text-xs font-medium">{guide.name} MBA tips</div>
          <ul className="mt-1.5 space-y-1 text-[11.5px] leading-relaxed text-muted-foreground">
            {guide.tips.slice(0, 3).map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-dvh flex-col">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/resumes" aria-label="Back to resumes">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{meta.title || "Untitled resume"}</div>
            <div className={cn("flex items-center gap-1 text-[11px]", save === "error" ? "text-destructive" : "text-muted-foreground")}>
              {save === "saving" ? <LoaderCircle className="size-3 animate-spin" /> : save === "saved" ? <Check className="size-3" /> : null}
              {saveLabel}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={doSave} disabled={save === "saving"} className="hidden sm:inline-flex">
            <Save /> Save Resume
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Copy /> <span className="hidden sm:inline">Versions</span> <ChevronDown className="opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={async () => {
                  await doSave();
                  const res = await duplicateResumeAction(resume.id);
                  if (res && !res.ok) unwrap(res);
                }}
              >
                <Copy /> Duplicate Resume
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tailor">
                  <Sparkles /> Create another tailored version
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/cover-letter?resume=${resume.id}`}>
                  <Mail /> Create Cover Letter
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={async () => {
                  if (!confirm("Delete this resume? This can't be undone.")) return;
                  const ok = unwrap(await deleteResumeAction(resume.id));
                  if (ok) router.push("/resumes");
                }}
              >
                <Trash /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Download /> <span className="hidden sm:inline">Download</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => download("pdf")}>
                <FileText /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => download("docx")}>
                <FileText /> Download DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="border-b px-3 py-2 xl:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="w-full">
            <TabsTrigger value="edit" className="flex-1">
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex-1">
              ATS {report ? `· ${report.overall}` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid min-h-0 flex-1 xl:grid-cols-[400px_1fr_320px]">
        <div className={cn("min-h-0 overflow-y-auto border-r bg-muted/20", mobileTab !== "edit" && "hidden xl:block")}>{editPanel}</div>
        <div className={cn("min-h-0 overflow-y-auto bg-muted/40", mobileTab !== "preview" && "hidden xl:block")}>{previewPanel}</div>
        <div className={cn("min-h-0 overflow-y-auto border-l", mobileTab !== "insights" && "hidden xl:block")}>{insightsPanel}</div>
      </div>

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose a template</DialogTitle>
            <DialogDescription>Your content stays the same — only the design changes.</DialogDescription>
          </DialogHeader>
          <TemplatePicker
            value={meta.templateId}
            onChange={(id) => {
              setMeta((m) => ({ ...m, templateId: id }));
              setTemplateOpen(false);
            }}
            content={content}
            columns="grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
