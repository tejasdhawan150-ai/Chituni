import { cn } from "@/lib/utils";

export function scoreTone(score: number) {
  if (score >= 85) return { text: "text-emerald-600", stroke: "stroke-emerald-500", bg: "bg-emerald-500", label: "Strong match" };
  if (score >= 70) return { text: "text-indigo-600", stroke: "stroke-indigo-500", bg: "bg-indigo-500", label: "Good match" };
  if (score >= 50) return { text: "text-amber-600", stroke: "stroke-amber-500", bg: "bg-amber-500", label: "Needs work" };
  return { text: "text-rose-600", stroke: "stroke-rose-500", bg: "bg-rose-500", label: "Weak match" };
}

export function ScoreRing({ score, size = 96, stroke = 8, className, label }: { score: number; size?: number; stroke?: number; className?: string; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = scoreTone(score);
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
          className={cn("fill-none transition-[stroke-dashoffset] duration-1000 ease-out", tone.stroke)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-semibold tabular-nums tracking-tight", size >= 90 ? "text-2xl" : "text-sm")}>{score}</span>
        {label && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

export function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-muted-foreground">—</span>;
  const tone = scoreTone(score);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium tabular-nums", tone.text)}>
      <span className={cn("size-1.5 rounded-full", tone.bg)} />
      {score}%
    </span>
  );
}
