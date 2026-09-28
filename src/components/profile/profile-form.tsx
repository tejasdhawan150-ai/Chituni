"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, type Control, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, FileUp, GraduationCap, Lightbulb, LoaderCircle, Plus, Trash, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { LinesField } from "./lines-field";
import { SkillsInput } from "./skills-input";
import { MBA_SPECIALIZATIONS, profileSchema, type Profile } from "@/lib/resume/schema";
import { MBA_GUIDES } from "@/config/mba";
import { parseResumeAction, saveProfileAction } from "@/server/actions/profile";
import { unwrap } from "@/lib/action-client";
import { cn, uid } from "@/lib/utils";

const STEPS = ["Basics", "Experience", "Education", "Skills", "Projects & Certifications", "Achievements & More"] as const;

function Field({ label, htmlFor, children, hint, className }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResumeUpload({ onParsed }: { onParsed: (p: Profile) => void }) {
  const [busy, setBusy] = React.useState(false);
  const [drag, setDrag] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);
  const handle = async (file?: File | null) => {
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) return void toast.error("Upload a PDF or DOCX file.");
    if (file.size > 5 * 1024 * 1024) return void toast.error("File is too large (max 5 MB).");
    setBusy(true);
    const fd = new FormData();
    fd.set("file", file);
    const draft = unwrap(await parseResumeAction(fd));
    setBusy(false);
    if (draft) {
      onParsed(draft);
      toast.success("Resume imported. Review each section and fix anything we missed.");
    }
  };
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files[0]);
      }}
      className={cn("flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center transition sm:flex-row sm:text-left", drag ? "border-primary bg-accent/50" : "bg-muted/30")}
    >
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-border">
        {busy ? <LoaderCircle className="size-5 animate-spin text-primary" /> : <FileUp className="size-5 text-primary" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{busy ? "Reading your resume…" : "Already have a resume? Import it"}</p>
        <p className="text-xs text-muted-foreground">Upload a PDF or DOCX — AI extracts your details automatically. You review everything before saving.</p>
      </div>
      <input ref={input} type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={(e) => handle(e.target.files?.[0])} />
      <Button type="button" variant="outline" onClick={() => input.current?.click()} disabled={busy}>
        <Upload /> Upload resume
      </Button>
    </div>
  );
}

type FormValues = Profile;

function ExperienceSection({ control, register }: { control: Control<FormValues>; register: UseFormRegister<FormValues> }) {
  const { fields, append, remove, move } = useFieldArray({ control, name: "experience" });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Start with your current or most recent job. Add internships too — they count.</p>
      {fields.map((f, i) => (
        <Card key={f.id} className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium">{i === 0 ? "Current / most recent role" : `Role ${i + 1}`}</span>
            <div className="flex gap-1">
              {i > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={() => move(i, i - 1)}>
                  Move up
                </Button>
              )}
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Remove role">
                <Trash />
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title" htmlFor={`exp-title-${i}`}>
              <Input id={`exp-title-${i}`} placeholder="Business Analyst" {...register(`experience.${i}.title`)} />
            </Field>
            <Field label="Company" htmlFor={`exp-co-${i}`}>
              <Input id={`exp-co-${i}`} placeholder="Company name" {...register(`experience.${i}.company`)} />
            </Field>
            <Field label="Location">
              <Input placeholder="Mumbai" {...register(`experience.${i}.location`)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <Input placeholder="Jul 2022" {...register(`experience.${i}.startDate`)} />
              </Field>
              <Controller
                control={control}
                name={`experience.${i}.current`}
                render={({ field: cur }) => (
                  <Field label="End">
                    <Input placeholder={cur.value ? "Present" : "Jun 2024"} disabled={cur.value} {...register(`experience.${i}.endDate`)} />
                    <label className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" checked={cur.value} onChange={(e) => cur.onChange(e.target.checked)} className="accent-[var(--primary)]" /> I currently work here
                    </label>
                  </Field>
                )}
              />
            </div>
          </div>
          <Controller
            control={control}
            name={`experience.${i}.bullets`}
            render={({ field }) => (
              <Field label="Achievements (one per line)" className="mt-4" hint="Start with an action verb. Include real numbers where you have them — we never add metrics for you.">
                <LinesField value={field.value} onChange={field.onChange} rows={5} placeholder={"Analyzed sales data across 120 stores using Excel and SQL, identifying 8% cost savings\nBuilt PowerPoint decks presented to the client's leadership team"} />
              </Field>
            )}
          />
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: uid("exp"), title: "", company: "", location: "", startDate: "", endDate: "", current: fields.length === 0, bullets: [] })}>
        <Plus /> Add experience
      </Button>
    </div>
  );
}

function EducationSection({ control, register }: { control: Control<FormValues>; register: UseFormRegister<FormValues> }) {
  const { fields, append, remove } = useFieldArray({ control, name: "education" });
  return (
    <div className="space-y-4">
      {fields.map((f, i) => (
        <Card key={f.id} className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="size-4 text-muted-foreground" /> Education {i + 1}
            </span>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Remove education">
              <Trash />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Degree">
              <Input placeholder="MBA / PGDM / B.Com" {...register(`education.${i}.degree`)} />
            </Field>
            <Field label="Field / specialization">
              <Input placeholder="Marketing & Strategy" {...register(`education.${i}.field`)} />
            </Field>
            <Field label="Institution" className="sm:col-span-2">
              <Input placeholder="Institute name" {...register(`education.${i}.institution`)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <Input placeholder="2022" {...register(`education.${i}.startDate`)} />
              </Field>
              <Field label="End">
                <Input placeholder="2024" {...register(`education.${i}.endDate`)} />
              </Field>
            </div>
            <Field label="Grade (optional)">
              <Input placeholder="CGPA 3.6/4" {...register(`education.${i}.grade`)} />
            </Field>
            <Field label="Highlights (optional)" className="sm:col-span-2">
              <Input placeholder="Case competition finalist; Finance Club lead" {...register(`education.${i}.details`)} />
            </Field>
          </div>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ id: uid("edu"), institution: "", degree: "", field: "", startDate: "", endDate: "", grade: "", details: "" })}>
        <Plus /> Add education
      </Button>
    </div>
  );
}

function ProjectsCertsSection({ control, register }: { control: Control<FormValues>; register: UseFormRegister<FormValues> }) {
  const projects = useFieldArray({ control, name: "projects" });
  const certs = useFieldArray({ control, name: "certifications" });
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Projects</h3>
        {projects.fields.map((f, i) => (
          <Card key={f.id} className="p-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
              <Field label="Project name">
                <Input placeholder="GTM strategy for a D2C brand" {...register(`projects.${i}.name`)} />
              </Field>
              <Field label="Your role">
                <Input placeholder="Team lead, live project" {...register(`projects.${i}.role`)} />
              </Field>
              <Button type="button" variant="ghost" size="icon-sm" className="mt-6" onClick={() => projects.remove(i)} aria-label="Remove project">
                <Trash />
              </Button>
            </div>
            <Controller
              control={control}
              name={`projects.${i}.bullets`}
              render={({ field }) => (
                <Field label="What you did (one per line)" className="mt-4">
                  <LinesField value={field.value} onChange={field.onChange} rows={3} />
                </Field>
              )}
            />
          </Card>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => projects.append({ id: uid("proj"), name: "", role: "", bullets: [] })}>
          <Plus /> Add project
        </Button>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Certifications</h3>
        {certs.fields.map((f, i) => (
          <div key={f.id} className="grid gap-3 sm:grid-cols-[2fr_1.2fr_0.8fr_auto]">
            <Input placeholder="Certification name" {...register(`certifications.${i}.name`)} />
            <Input placeholder="Issuer" {...register(`certifications.${i}.issuer`)} />
            <Input placeholder="Year" {...register(`certifications.${i}.date`)} />
            <Button type="button" variant="ghost" size="icon" onClick={() => certs.remove(i)} aria-label="Remove certification">
              <Trash />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => certs.append({ id: uid("cert"), name: "", issuer: "", date: "" })}>
          <Plus /> Add certification
        </Button>
      </div>
    </div>
  );
}

export function ProfileForm({ initial, mode }: { initial: Profile; mode: "onboarding" | "edit" }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const form = useForm<FormValues>({ resolver: zodResolver(profileSchema) as never, defaultValues: initial, mode: "onBlur" });
  const { register, control, handleSubmit, reset, watch, formState } = form;
  const spec = watch("mbaSpecialization");
  const guide = MBA_GUIDES.find((g) => g.name === spec);
  const skills = watch("skills");

  const save = handleSubmit(
    async (values) => {
      const ok = unwrap(await saveProfileAction(values));
      if (!ok) return;
      reset(values);
      if (mode === "onboarding") {
        toast.success("Profile saved. Now paste a job description to tailor your resume.");
        router.push("/tailor");
      } else toast.success("Profile saved.");
    },
    (errors) => {
      const first = Object.values(errors)[0];
      toast.error(typeof first?.message === "string" ? first.message : "Please fix the highlighted fields.");
    },
  );

  const last = step === STEPS.length - 1;

  return (
    <form onSubmit={save} className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:flex-col lg:self-start">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
              i === step ? "bg-card font-medium shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className={cn("grid size-5 place-items-center rounded-full border text-[10px]", i < step && mode === "onboarding" ? "border-emerald-500 bg-emerald-500 text-white" : "")}>
              {i < step && mode === "onboarding" ? <Check className="size-3" /> : i + 1}
            </span>
            {s}
          </button>
        ))}
      </nav>

      <div className="min-w-0 space-y-6">
        {step === 0 && <ResumeUpload onParsed={(p) => reset({ ...initial, ...p, basics: { ...initial.basics, ...Object.fromEntries(Object.entries(p.basics).filter(([, v]) => v)) } })} />}

        <div>
          <h2 className="text-lg font-semibold">{STEPS[step]}</h2>
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName">
                <Input id="fullName" autoComplete="name" {...register("basics.fullName")} />
              </Field>
              <Field label="Email" htmlFor="email">
                <Input id="email" type="email" autoComplete="email" {...register("basics.email")} />
              </Field>
              <Field label="Phone" htmlFor="phone">
                <Input id="phone" autoComplete="tel" placeholder="+91 98765 43210" {...register("basics.phone")} />
              </Field>
              <Field label="Location" htmlFor="location">
                <Input id="location" placeholder="Bengaluru, India" {...register("basics.location")} />
              </Field>
              <Field label="LinkedIn URL" htmlFor="linkedin">
                <Input id="linkedin" placeholder="linkedin.com/in/yourname" {...register("basics.linkedinUrl")} />
              </Field>
              <Field label="Headline / current role" htmlFor="headline" hint="e.g. “Business Analyst | MBA (Marketing)”">
                <Input id="headline" {...register("basics.headline")} />
              </Field>
              <Field label="MBA specialization" htmlFor="spec">
                <NativeSelect id="spec" {...register("mbaSpecialization")}>
                  <option value="">Select…</option>
                  {MBA_SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Controller
                control={control}
                name="targetRoles"
                render={({ field }) => (
                  <Field label="Target roles">
                    <SkillsInput value={field.value} onChange={field.onChange} placeholder="Business Analyst, Brand Manager…" />
                  </Field>
                )}
              />
            </div>
            <Field label="Professional summary (optional)" htmlFor="summary" hint="We'll tailor this for every job — write it in your own words.">
              <Textarea id="summary" rows={4} {...register("summary")} />
            </Field>
          </div>
        )}

        {step === 1 && <ExperienceSection control={control} register={register} />}
        {step === 2 && <EducationSection control={control} register={register} />}

        {step === 3 && (
          <div className="space-y-5">
            <Controller
              control={control}
              name="skills"
              render={({ field }) => (
                <Field label="Skills" hint="Tools, methods and domain skills you can confidently discuss in an interview.">
                  <SkillsInput value={field.value} onChange={field.onChange} />
                </Field>
              )}
            />
            {guide && (
              <Card className="bg-accent/30 p-5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="size-4 text-amber-500" /> {guide.name} MBA — skills recruiters look for
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Click to add — only if you genuinely have experience with it.</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[...guide.keywords, ...guide.tools]
                    .filter((k) => !skills.some((s) => s.toLowerCase() === k.toLowerCase()))
                    .map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => form.setValue("skills", [...skills, k], { shouldDirty: true })}
                        className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-0.5 text-xs transition hover:border-primary hover:text-primary"
                      >
                        <Plus className="size-3" /> {k}
                      </button>
                    ))}
                </div>
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {guide.tips.slice(0, 3).map((t) => (
                    <li key={t}>• {t}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        {step === 4 && <ProjectsCertsSection control={control} register={register} />}

        {step === 5 && (
          <div className="space-y-5">
            <Controller
              control={control}
              name="achievements"
              render={({ field }) => (
                <Field label="Achievements & awards (one per line)" hint="Case competitions, scholarships, rankings, leadership positions.">
                  <LinesField value={field.value} onChange={field.onChange} rows={5} />
                </Field>
              )}
            />
            <Field label="Additional information" htmlFor="additional" hint="Languages, interests, volunteering.">
              <Textarea id="additional" rows={3} {...register("additional")} />
            </Field>
          </div>
        )}

        <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-3 border-t bg-background/90 px-1 py-4 backdrop-blur">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft /> Back
          </Button>
          <div className="flex gap-2">
            {mode === "edit" && (
              <Button type="submit" variant={last ? "dark" : "outline"} disabled={formState.isSubmitting}>
                {formState.isSubmitting && <LoaderCircle className="animate-spin" />} Save profile
              </Button>
            )}
            {!last ? (
              <Button type="button" variant={mode === "onboarding" ? "dark" : "default"} onClick={() => setStep((s) => s + 1)}>
                Next <ArrowRight />
              </Button>
            ) : (
              mode === "onboarding" && (
                <Button type="submit" variant="dark" disabled={formState.isSubmitting}>
                  {formState.isSubmitting && <LoaderCircle className="animate-spin" />} Save & tailor my resume <ArrowRight />
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
