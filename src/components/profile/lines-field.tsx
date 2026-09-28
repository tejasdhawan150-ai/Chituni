"use client";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";

const parse = (text: string) =>
  text
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s+/, "").trim())
    .filter(Boolean);

/** Edits a string[] as one item per line (bullets, achievements). */
export function LinesField({ value, onChange, placeholder, rows = 4, id }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; rows?: number; id?: string }) {
  const [text, setText] = React.useState(() => value.join("\n"));
  // Re-sync when the value is changed from outside (resume upload, AI rewrite).
  const external = value.join("\n");
  const [prevExternal, setPrevExternal] = React.useState(external);
  if (external !== prevExternal) {
    setPrevExternal(external);
    if (parse(text).join("\n") !== external) setText(external);
  }
  return (
    <Textarea
      id={id}
      rows={rows}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        const next = parse(e.target.value);
        setPrevExternal(next.join("\n"));
        onChange(next);
      }}
      className="text-[13.5px] leading-relaxed"
    />
  );
}
