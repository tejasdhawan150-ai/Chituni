"use client";
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, FileText, LoaderCircle, RotateCcw, ScanSearch, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SAMPLE_JD_DELOITTE } from "@/lib/demo/samples";

type Stage = "idle" | "processing" | "result";

const PROCESS_STEPS = ["Reading job description", "Extracting required skills", "Comparing with your profile", "Optimizing your resume"];
const SKILLS = ["Business Analysis", "Strategy", "Excel", "PowerPoint", "Stakeholder Management", "Data Analysis"];
const IMPROVEMENTS = ["Added relevant keywords", "Reordered skills", "Strengthened achievement statements", "Improved professional summary"];
const FLOW = [
  { icon: FileText, label: "LinkedIn Job Description" },
  { icon: Sparkles, label: "DreamJobResume AI Analysis" },
  { icon: ScanSearch, label: "Tailored Resume" },
  { icon: Target, label: "ATS Match Score" },
];

function useCountUp(target: number, run: boolean, ms = 1100) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return run ? v : 0;
}

function Mark({ children }: { children: React.ReactNode }) {
  return <mark className="rounded-[3px] bg-indigo-100 px-0.5 text-inherit">{children}</mark>;
}

function MiniResume() {
  return (
    <div className="rounded-lg border bg-white p-4 text-[10.5px] leading-[1.45] text-slate-700 shadow-sm">
      <div className="text-center">
        <div className="font-serif text-[15px] font-semibold text-slate-900">Aanya Kapoor</div>
        <div className="text-[9.5px] text-slate-500">Mumbai · aanya.kapoor@example.com · linkedin.com/in/aanya-kapoor</div>
      </div>
      <div className="mt-2.5 border-b border-slate-800 pb-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-900">Summary</div>
      <p className="mt-1">
        <Mark>Business Analyst</Mark> with an MBA in Strategy and experience across consulting and consumer goods. Skilled in <Mark>data analysis</Mark>,{" "}
        <Mark>advanced Excel</Mark> and executive <Mark>PowerPoint</Mark> presentations for <Mark>senior stakeholders</Mark>.
      </p>
      <div className="mt-2 border-b border-slate-800 pb-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-900">Experience</div>
      <div className="mt-1 flex justify-between font-semibold text-slate-900">
        <span>Business Analyst — Northbridge Advisory</span>
        <span className="font-normal text-slate-500">2022 – Present</span>
      </div>
      <ul className="mt-0.5 list-disc space-y-0.5 pl-3.5">
        <li>
          Analyzed sales and margin <Mark>data</Mark> across 120 stores using <Mark>Excel</Mark> and SQL, identifying 8% cost savings
        </li>
        <li>
          Built <Mark>PowerPoint</Mark> decks and <Mark>strategy</Mark> recommendations presented to the CXO team
        </li>
        <li>
          Partnered with <Mark>cross-functional teams</Mark> in finance and operations to design a KPI dashboard
        </li>
      </ul>
      <div className="mt-2 border-b border-slate-800 pb-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-slate-900">Skills</div>
      <p className="mt-1">Business Analysis • Business Strategy • Data Analysis • Excel • PowerPoint • Stakeholder Management • SQL</p>
    </div>
  );
}

export function HeroDemo() {
  const [stage, setStage] = React.useState<Stage>("idle");
  const [step, setStep] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const autoPlayed = React.useRef(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const score = useCountUp(92, stage === "result");

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = React.useCallback(() => {
    clear();
    setStage("processing");
    setStep(0);
    PROCESS_STEPS.forEach((_, i) => timers.current.push(setTimeout(() => setStep(i + 1), 650 * (i + 1))));
    timers.current.push(setTimeout(() => setStage("result"), 650 * PROCESS_STEPS.length + 350));
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !autoPlayed.current) {
          autoPlayed.current = true;
          timers.current.push(setTimeout(run, 1400));
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
  }, [run]);

  const flowIndex = stage === "idle" ? 0 : stage === "processing" ? 1 : 3;

  return (
    <div ref={ref} className="relative">
      {/* Flow indicator */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs">
        {FLOW.map((f, i) => (
          <React.Fragment key={f.label}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 transition-all duration-500",
                i <= flowIndex ? "border-foreground/15 bg-card text-foreground shadow-sm" : "border-transparent text-muted-foreground",
              )}
            >
              <f.icon className="size-3.5" />
              {f.label}
            </span>
            {i < FLOW.length - 1 && <ArrowRight className="hidden size-3.5 text-muted-foreground/50 sm:block" />}
          </React.Fragment>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_24px_80px_-24px_rgba(30,27,75,0.25)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-300" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-300" />
          <span className="ml-3 rounded-md bg-background px-3 py-0.5 font-mono text-[11px] text-muted-foreground">dreamjobresume.com/build</span>
        </div>

        <div className="grid md:grid-cols-[0.95fr_1.25fr]">
          {/* Left: JD */}
          <div className="border-b p-5 md:border-b-0 md:border-r">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Job Description</span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0a66c2]/10 px-2 py-0.5 text-[11px] font-medium text-[#0a66c2]">
                <span className="grid size-3.5 place-items-center rounded-[3px] bg-[#0a66c2] text-[8px] font-bold text-white">in</span>
                Copied from LinkedIn
              </span>
            </div>
            <pre className="h-[260px] overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/30 p-3.5 font-sans text-[12.5px] leading-relaxed text-foreground/85">{SAMPLE_JD_DELOITTE}</pre>
            <Button className="mt-4 w-full" size="lg" onClick={run} disabled={stage === "processing"}>
              {stage === "processing" ? <LoaderCircle className="animate-spin" /> : stage === "result" ? <RotateCcw /> : <Sparkles />}
              {stage === "result" ? "Run again" : "Tailor My Resume"}
            </Button>
          </div>

          {/* Right: AI */}
          <div className="relative min-h-[380px] bg-gradient-to-b from-muted/20 to-transparent p-5">
            <AnimatePresence mode="wait">
              {stage === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full min-h-[340px] flex-col items-center justify-center text-center">
                  <div className="mb-4 grid size-12 place-items-center rounded-2xl border bg-card shadow-sm">
                    <Sparkles className="size-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Your tailored resume appears here</p>
                  <p className="mt-1 max-w-[260px] text-xs text-muted-foreground">Click “Tailor My Resume” to watch the AI analyze the role and optimize a real profile.</p>
                </motion.div>
              )}

              {stage === "processing" && (
                <motion.div key="processing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex min-h-[340px] flex-col justify-center gap-3 px-2">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="size-4 text-primary" /> DreamJobResume AI is working…
                  </div>
                  {PROCESS_STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-3 text-sm">
                      <span className={cn("grid size-5 place-items-center rounded-full border transition-colors", step > i ? "border-emerald-500 bg-emerald-500 text-white" : step === i ? "border-primary" : "")}>
                        {step > i ? <Check className="size-3" /> : step === i ? <LoaderCircle className="size-3 animate-spin text-primary" /> : null}
                      </span>
                      <span className={cn("transition-colors", step >= i ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                    </div>
                  ))}
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                    <motion.div className="h-full bg-primary" initial={{ width: "0%" }} animate={{ width: `${(step / PROCESS_STEPS.length) * 100}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </motion.div>
              )}

              {stage === "result" && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border bg-card p-4">
                      <div className="text-xs font-medium text-muted-foreground">ATS Match</div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-4xl font-semibold tabular-nums tracking-tight text-emerald-600">{score}</span>
                        <span className="text-lg font-medium text-emerald-600">%</span>
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        was <span className="line-through">64%</span> before tailoring
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-card p-4">
                      <div className="mb-2 text-xs font-medium text-muted-foreground">Resume Improvements</div>
                      <ul className="space-y-1.5">
                        {IMPROVEMENTS.map((x, i) => (
                          <motion.li key={x} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.12 }} className="flex items-center gap-2 text-[13px]">
                            <Check className="size-3.5 text-emerald-600" /> {x}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-card p-4">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">Skills Detected</div>
                    <div className="flex flex-wrap gap-1.5">
                      {SKILLS.map((s, i) => (
                        <motion.span key={s} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.06 }} className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                          {s}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">Tailored resume preview</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="size-2 rounded-sm bg-indigo-100 ring-1 ring-indigo-200" /> matched keywords
                      </span>
                    </div>
                    <MiniResume />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
