import Link from "next/link";
import { CircleCheck, CircleAlert, Info, Lock } from "lucide-react";
import type { AtsReport } from "@/lib/ats/score";
import { ATS_DISCLAIMER } from "@/lib/ats/score";
import { cn } from "@/lib/utils";
import { scoreTone } from "./score-ring";

const LABELS: [keyof AtsReport["breakdown"], string][] = [
  ["keywords", "Keywords"],
  ["experience", "Experience relevance"],
  ["skills", "Skills match"],
  ["formatting", "Formatting"],
  ["education", "Education"],
];

export function BreakdownBars({ report, compare }: { report: AtsReport; compare?: AtsReport }) {
  return (
    <div className="space-y-3">
      {LABELS.map(([k, label]) => {
        const v = report.breakdown[k];
        const before = compare?.breakdown[k];
        return (
          <div key={k}>
            <div className="mb-1 flex justify-between text-[13px]">
              <span className="text-muted-foreground">{label}</span>
              <span className="tabular-nums">
                {before !== undefined && before !== v && <span className="mr-1.5 text-muted-foreground line-through">{before}%</span>}
                <span className="font-medium">{v}%</span>
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
              {before !== undefined && <div className="absolute inset-y-0 left-0 rounded-full bg-foreground/15" style={{ width: `${before}%` }} />}
              <div className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-700", scoreTone(v).bg)} style={{ width: `${v}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function KeywordChips({ items, tone, max }: { items: string[]; tone: "good" | "bad"; max?: number }) {
  const list = max ? items.slice(0, max) : items;
  if (!list.length) return <p className="text-xs text-muted-foreground">None</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((k) => (
        <span key={k} className={cn("rounded-md px-2 py-0.5 font-mono text-[11.5px]", tone === "good" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
          {k}
        </span>
      ))}
      {max && items.length > max && <span className="px-1 text-xs text-muted-foreground">+{items.length - max} more</span>}
    </div>
  );
}

export function AtsChecks({ report, advanced }: { report: AtsReport; advanced: boolean }) {
  if (!advanced) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Lock className="size-3.5" /> Detailed formatting checks are part of Advanced ATS analysis.
        </span>
        <Link href="/settings/billing" className="font-medium text-primary hover:underline">
          Upgrade
        </Link>
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {report.checks.map((c) => (
        <li key={c.id} className="flex items-start gap-2 text-[13px]">
          {c.passed ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />}
          <span className={c.passed ? "text-muted-foreground" : ""}>
            {c.label}
            {!c.passed && c.detail ? <span className="text-muted-foreground"> — {c.detail}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AtsDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-[11.5px] leading-relaxed text-muted-foreground", className)}>
      <Info className="mt-0.5 size-3.5 shrink-0" />
      {ATS_DISCLAIMER}
    </p>
  );
}
