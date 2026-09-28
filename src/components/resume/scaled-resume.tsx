"use client";
import * as React from "react";
import type { ResumeContent } from "@/lib/resume/schema";
import type { ResumeTemplate } from "@/lib/resume/templates";
import { ResumeDocument } from "./resume-document";

/** Renders the A4 resume scaled to fit its container width. */
export function ScaledResume({ content, template, className }: { content: ResumeContent; template: ResumeTemplate; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.5);
  const [height, setHeight] = React.useState(1123);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(el.clientWidth / 794);
      if (inner.current) setHeight(inner.current.scrollHeight);
    });
    ro.observe(el);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ height: height * scale, position: "relative", overflow: "hidden" }}>
      <div ref={inner} style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 794, position: "absolute", top: 0, left: 0 }}>
        <ResumeDocument content={content} template={template} />
      </div>
    </div>
  );
}
