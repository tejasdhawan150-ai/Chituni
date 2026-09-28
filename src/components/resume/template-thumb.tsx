import type { ResumeContent } from "@/lib/resume/schema";
import type { ResumeTemplate } from "@/lib/resume/templates";
import { cn } from "@/lib/utils";
import { ScaledResume } from "./scaled-resume";

/** A4-proportioned template thumbnail that scales to its card width. */
export function TemplateThumb({ content, template, className }: { content: ResumeContent; template: ResumeTemplate; className?: string }) {
  return (
    <div className={cn("pointer-events-none relative aspect-[794/1123] select-none overflow-hidden rounded-xl border bg-white shadow-sm", className)} aria-hidden>
      <ScaledResume content={content} template={template} />
    </div>
  );
}
