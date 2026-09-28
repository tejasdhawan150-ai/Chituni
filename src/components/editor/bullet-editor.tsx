"use client";
import * as React from "react";
import { ArrowDown, ArrowUp, Check, LoaderCircle, Plus, Trash, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { REWRITE_ACTIONS, REWRITE_LABELS, type RewriteAction } from "@/lib/ai/schemas";
import { rewriteAction } from "@/server/actions/ai";
import { unwrap } from "@/lib/action-client";
import { cn } from "@/lib/utils";

export interface AiContext {
  role: string;
  keywords: string[];
  userSkills: string[];
}

function AutoTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
      className="block w-full resize-none bg-transparent py-1.5 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/60"
    />
  );
}

function BulletRow({
  value,
  onChange,
  onRemove,
  onMove,
  canUp,
  canDown,
  ai,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  canUp: boolean;
  canDown: boolean;
  ai: AiContext;
}) {
  const [busy, setBusy] = React.useState<RewriteAction | null>(null);
  const [suggestion, setSuggestion] = React.useState<{ text: string; notes: string[] } | null>(null);

  const run = async (action: RewriteAction) => {
    if (value.trim().length < 3) return;
    setBusy(action);
    const res = unwrap(await rewriteAction({ text: value, action, context: ai }));
    setBusy(null);
    if (res) setSuggestion(res);
  };

  return (
    <div className="group rounded-lg border bg-card px-2.5 transition focus-within:border-ring/60">
      <div className="flex items-start gap-1.5">
        <span className="mt-[11px] size-1 shrink-0 rounded-full bg-muted-foreground/60" />
        <div className="min-w-0 flex-1">
          <AutoTextarea value={value} onChange={onChange} placeholder="Describe an achievement…" />
        </div>
        <div className="flex shrink-0 items-center gap-0.5 pt-1 opacity-60 transition group-focus-within:opacity-100 group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="AI rewrite" disabled={!!busy}>
                {busy ? <LoaderCircle className="animate-spin text-primary" /> : <WandSparkles className="text-primary" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>AI rewrite</DropdownMenuLabel>
              {REWRITE_ACTIONS.map((a) => (
                <DropdownMenuItem key={a} onSelect={() => run(a)}>
                  {REWRITE_LABELS[a]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-[11px] text-muted-foreground">Never adds facts or metrics you didn&apos;t write.</div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon-sm" onClick={() => onMove(-1)} disabled={!canUp} aria-label="Move up">
            <ArrowUp />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onMove(1)} disabled={!canDown} aria-label="Move down">
            <ArrowDown />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Delete bullet">
            <Trash />
          </Button>
        </div>
      </div>
      {suggestion && (
        <div className="mb-2.5 rounded-md border border-primary/20 bg-accent/40 p-2.5">
          {suggestion.text !== value && <p className="text-[13px] leading-relaxed">{suggestion.text}</p>}
          {suggestion.notes.map((n) => (
            <p key={n} className={cn("text-xs text-muted-foreground", suggestion.text !== value && "mt-1.5")}>
              {n}
            </p>
          ))}
          <div className="mt-2 flex gap-1.5">
            {suggestion.text !== value && (
              <Button
                size="sm"
                onClick={() => {
                  onChange(suggestion.text);
                  setSuggestion(null);
                }}
              >
                <Check /> Accept
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setSuggestion(null)}>
              <X /> Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BulletEditor({ bullets, onChange, ai }: { bullets: string[]; onChange: (b: string[]) => void; ai: AiContext }) {
  const set = (i: number, v: string) => onChange(bullets.map((b, j) => (j === i ? v : b)));
  const move = (i: number, dir: -1 | 1) => {
    const n = [...bullets];
    const j = i + dir;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <BulletRow
          key={i}
          value={b}
          onChange={(v) => set(i, v)}
          onRemove={() => onChange(bullets.filter((_, j) => j !== i))}
          onMove={(d) => move(i, d)}
          canUp={i > 0}
          canDown={i < bullets.length - 1}
          ai={ai}
        />
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange([...bullets, ""])} className="text-muted-foreground">
        <Plus /> Add bullet
      </Button>
    </div>
  );
}
