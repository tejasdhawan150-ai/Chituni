"use client";
import * as React from "react";
import { Check, Copy, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { LinkedInResult } from "@/lib/ai/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { optimizeLinkedInAction } from "@/server/actions/career";
import { unwrap } from "@/lib/action-client";

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setDone(true);
        toast.success("Copied.");
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check /> : <Copy />} Copy
    </Button>
  );
}

export function LinkedInOptimizer({ defaultRole }: { defaultRole: string }) {
  const [headline, setHeadline] = React.useState("");
  const [about, setAbout] = React.useState("");
  const [targetRole, setTargetRole] = React.useState(defaultRole);
  const [pending, setPending] = React.useState(false);
  const [result, setResult] = React.useState<LinkedInResult | null>(null);

  const run = async () => {
    setPending(true);
    const res = unwrap(await optimizeLinkedInAction({ headline, about, targetRole }));
    setPending(false);
    if (res) setResult(res);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <Card className="h-fit space-y-4 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="target">Target role</Label>
          <Input id="target" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Product Manager" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="headline">Current LinkedIn headline</Label>
          <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="MBA Candidate at …" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="about">Current About section</Label>
          <Textarea id="about" rows={9} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Paste your About section" className="text-[13px]" />
        </div>
        <Button onClick={run} disabled={pending} size="lg" className="w-full">
          {pending ? <LoaderCircle className="animate-spin" /> : <Sparkles />} Optimize My LinkedIn
        </Button>
        <p className="text-xs text-muted-foreground">Uses your profile and what you paste here. Skills are only suggested when your experience supports them.</p>
      </Card>

      <div className="space-y-4">
        {!result ? (
          <Card className="flex flex-col items-center p-16 text-center">
            <Sparkles className="size-7 text-primary" />
            <p className="mt-3 text-sm font-medium">Your optimized LinkedIn profile will appear here</p>
            <p className="mt-1 text-xs text-muted-foreground">Headline, About section, experience descriptions and skills.</p>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle>Headline</CardTitle>
                <CopyButton text={result.headline} />
              </CardHeader>
              <CardContent className="text-[15px] font-medium">{result.headline}</CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle>About</CardTitle>
                <CopyButton text={result.about} />
              </CardHeader>
              <CardContent className="whitespace-pre-line text-sm leading-relaxed">{result.about}</CardContent>
            </Card>
            {result.experience_descriptions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Experience descriptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.experience_descriptions.map((d) => (
                    <div key={d.experience_id} className="rounded-lg bg-muted/40 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{d.title}</div>
                        <CopyButton text={d.description} />
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{d.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle>Skills to list</CardTitle>
                <CopyButton text={result.skills.join(", ")} />
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {result.skills.map((s) => (
                  <span key={s} className="rounded-md bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                    {s}
                  </span>
                ))}
              </CardContent>
            </Card>
            {result.notes.length > 0 && (
              <Card className="p-5">
                <div className="mb-2 text-sm font-medium">Tips</div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.notes.map((n) => (
                    <li key={n}>• {n}</li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
