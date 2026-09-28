"use client";
import * as React from "react";
import { Check, Lock } from "lucide-react";
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategory } from "@/lib/resume/templates";
import type { ResumeContent } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { TemplateThumb } from "./template-thumb";

export function TemplatePicker({
  value,
  onChange,
  content,
  canUsePro,
  columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
}: {
  value: string;
  onChange: (id: string) => void;
  content: ResumeContent;
  canUsePro: boolean;
  columns?: string;
}) {
  const [cat, setCat] = React.useState<TemplateCategory | "all">("all");
  const list = TEMPLATES.filter((t) => cat === "all" || t.category === cat);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {[{ id: "all" as const, label: "All" }, ...TEMPLATE_CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={cn("rounded-full border px-3 py-1 text-xs transition", cat === c.id ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground")}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className={cn("grid gap-4", columns)}>
        {list.map((t) => {
          const locked = t.pro && !canUsePro;
          const selected = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => !locked && onChange(t.id)}
              className={cn("group text-left", locked && "cursor-not-allowed")}
              aria-pressed={selected}
              title={locked ? `${t.name} is a Pro template` : t.description}
            >
              <div className={cn("relative rounded-xl ring-offset-2 transition", selected ? "ring-2 ring-primary" : "group-hover:ring-1 group-hover:ring-border")}>
                <TemplateThumb content={content} template={t} className={cn(locked && "opacity-60")} />
                {selected && (
                  <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow">
                    <Check className="size-3.5" />
                  </span>
                )}
                {locked && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">
                    <Lock className="size-3" /> Pro
                  </span>
                )}
              </div>
              <div className="mt-2 text-[13px] font-medium">{t.name}</div>
              <div className="text-[11px] capitalize text-muted-foreground">{t.category === "ats" ? "ATS" : t.category}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
