"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, LoaderCircle, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { CoverLetter } from "@/lib/resume/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { generateCoverLetterAction } from "@/server/actions/career";
import { unwrap } from "@/lib/action-client";
import { cn, relativeTime } from "@/lib/utils";

export function CoverLetterGenerator({
  resumes,
  letters,
  defaults,
}: {
  resumes: { id: string; title: string; targetRole: string; targetCompany: string; jobDescription: string }[];
  letters: CoverLetter[];
  defaults: { resumeId: string | null };
}) {
  const router = useRouter();
  const initial = resumes.find((r) => r.id === defaults.resumeId);
  const [resumeId, setResumeId] = React.useState<string>(initial?.id ?? "");
  const [jd, setJd] = React.useState(initial?.jobDescription ?? "");
  const [company, setCompany] = React.useState(initial?.targetCompany ?? "");
  const [role, setRole] = React.useState(initial?.targetRole ?? "");
  const [tone, setTone] = React.useState<"professional" | "warm" | "confident">("professional");
  const [pending, setPending] = React.useState(false);
  const [active, setActive] = React.useState<CoverLetter | null>(letters[0] ?? null);
  const [body, setBody] = React.useState(letters[0]?.body ?? "");

  const pickResume = (id: string) => {
    setResumeId(id);
    const r = resumes.find((x) => x.id === id);
    if (r) {
      if (r.jobDescription) setJd(r.jobDescription);
      if (r.targetCompany) setCompany(r.targetCompany);
      if (r.targetRole) setRole(r.targetRole);
    }
  };

  const generate = async () => {
    setPending(true);
    const res = unwrap(await generateCoverLetterAction({ resumeId: resumeId || null, jobDescription: jd, company, role, tone }));
    setPending(false);
    if (res) {
      setActive(res);
      setBody(res.body);
      router.refresh();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card className="space-y-4 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="resume">Resume</Label>
          <NativeSelect id="resume" value={resumeId} onChange={(e) => pickResume(e.target.value)}>
            <option value="">My profile (all experience)</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jd">Job description</Label>
          <Textarea id="jd" rows={10} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the job description" className="text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label>Tone</Label>
          <div className="flex gap-1.5">
            {(["professional", "warm", "confident"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTone(t)} className={cn("rounded-full border px-3 py-1 text-xs capitalize", tone === t ? "border-foreground bg-foreground text-background" : "bg-card")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={generate} disabled={pending} className="w-full" size="lg">
          {pending ? <LoaderCircle className="animate-spin" /> : <Sparkles />} Create Cover Letter
        </Button>
        <p className="text-xs text-muted-foreground">Written only from your resume and the job description — no invented facts about you or the company.</p>
      </Card>

      <div className="space-y-4">
        <Card className="p-6">
          {active ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium">
                  {active.role || "Cover letter"}
                  {active.company ? ` — ${active.company}` : ""}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(body);
                      toast.success("Copied to clipboard.");
                    }}
                  >
                    <Copy /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/api/cover-letters/${active.id}/export?format=pdf`}>
                      <Download /> PDF
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/api/cover-letters/${active.id}/export?format=docx`}>
                      <Download /> DOCX
                    </a>
                  </Button>
                </div>
              </div>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={22} className="font-serif text-[14.5px] leading-relaxed" />
              <p className="mt-2 text-xs text-muted-foreground">Edits here are for copying. Downloads use the generated version.</p>
            </>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <Mail className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Your cover letter will appear here</p>
            </div>
          )}
        </Card>
        {letters.length > 0 && (
          <Card className="divide-y">
            {letters.slice(0, 8).map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setActive(l);
                  setBody(l.body);
                }}
                className={cn("flex w-full items-center justify-between px-5 py-3 text-left text-sm hover:bg-muted/40", active?.id === l.id && "bg-muted/40")}
              >
                <span className="truncate">
                  {l.role || "Cover letter"}
                  {l.company ? ` — ${l.company}` : ""}
                </span>
                <span className="text-xs text-muted-foreground">{relativeTime(l.createdAt)}</span>
              </button>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
