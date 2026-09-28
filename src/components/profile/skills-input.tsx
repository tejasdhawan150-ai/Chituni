"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Chip input for skills. Enter or comma adds; backspace removes the last chip. */
export function SkillsInput({ value, onChange, placeholder = "Type a skill and press Enter", className }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; className?: string }) {
  const [draft, setDraft] = React.useState("");
  const add = (raw: string) => {
    const items = raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return;
    const lower = new Set(value.map((v) => v.toLowerCase()));
    onChange([...value, ...items.filter((i) => !lower.has(i.toLowerCase()))].slice(0, 80));
    setDraft("");
  };
  return (
    <div className={cn("flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card p-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/15", className)}>
      {value.map((s, i) => (
        <span key={`${s}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-accent py-0.5 pl-2 pr-1 text-xs font-medium text-accent-foreground">
          {s}
          <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded p-0.5 hover:bg-black/5">
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => {
          if (/[,;]/.test(e.target.value)) add(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => add(draft)}
        onPaste={(e) => {
          const t = e.clipboardData.getData("text");
          if (/[,;\n]/.test(t)) {
            e.preventDefault();
            add(t);
          }
        }}
        placeholder={value.length ? "" : placeholder}
        className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
}
