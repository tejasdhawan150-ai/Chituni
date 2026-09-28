"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, ClipboardPaste, Link2, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { analyzeJobAction } from "@/server/actions/tailor";
import { unwrap } from "@/lib/action-client";
import { cn } from "@/lib/utils";

const STEPS = ["Reading the job description", "Extracting skills & requirements", "Comparing with your profile", "Preparing recommendations"];

export function TailorForm({ templateId, size = "default", cta = "Tailor My Resume", autoFocus }: { templateId?: string; size?: "default" | "large"; cta?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [jd, setJd] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [showUrl, setShowUrl] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!pending) return;
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    return () => clearInterval(id);
  }, [pending]);

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setJd(text);
    } catch {
      toast.info("Press Ctrl/Cmd + V to paste the job description.");
    }
  };

  const submit = async () => {
    if (jd.trim().length < 80) {
      toast.error("Paste the full job description — responsibilities and requirements.");
      return;
    }
    let jobUrl = url.trim();
    if (jobUrl && !/^https?:\/\//i.test(jobUrl)) jobUrl = `https://${jobUrl}`;
    setPending(true);
    const res = unwrap(await analyzeJobAction({ jobDescription: jd, jobUrl, templateId }));
    if (res) router.push(`/tailor/${res.id}`);
    else setPending(false);
  };

  const chars = jd.trim().length;

  return (
    <div className="relative">
      <div className="relative">
        <Textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          autoFocus={autoFocus}
          disabled={pending}
          placeholder="Paste the job description from LinkedIn, Indeed, Naukri, company careers page, etc."
          className={cn("resize-none bg-card pb-12 text-[14px] leading-relaxed", size === "large" ? "min-h-[320px]" : "min-h-[160px]")}
          aria-label="Paste Job Description"
        />
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={paste} disabled={pending}>
              <ClipboardPaste /> Paste
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrl((s) => !s)} disabled={pending}>
              <Link2 /> Job URL
            </Button>
          </div>
          <span className={cn("text-xs tabular-nums", chars > 0 && chars < 80 ? "text-amber-600" : "text-muted-foreground")}>{chars.toLocaleString()} chars</span>
        </div>
      </div>
      {showUrl && (
        <div className="mt-3 space-y-1">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.linkedin.com/jobs/view/…" disabled={pending} />
          <p className="text-xs text-muted-foreground">Saved for your reference only. We don&apos;t fetch or scrape job sites — please paste the description text above.</p>
        </div>
      )}
      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">We use only your real experience. Missing skills are flagged, never invented.</p>
        <Button size={size === "large" ? "lg" : "default"} onClick={submit} disabled={pending} className="sm:min-w-44">
          {pending ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
          {pending ? "Analyzing…" : cta}
        </Button>
      </div>

      <AnimatePresence>
        {pending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-card/85 backdrop-blur-sm">
            <div className="w-72 space-y-3">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className={cn("grid size-5 place-items-center rounded-full border", i < step ? "border-emerald-500 bg-emerald-500 text-white" : i === step ? "border-primary" : "")}>
                    {i < step ? <Check className="size-3" /> : i === step ? <LoaderCircle className="size-3 animate-spin text-primary" /> : null}
                  </span>
                  <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
