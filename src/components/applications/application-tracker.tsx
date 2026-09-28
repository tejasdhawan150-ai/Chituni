"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, LoaderCircle, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { APPLICATION_STATUSES, applicationInputSchema, type Application, type ApplicationInput, type ApplicationStatus } from "@/lib/resume/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScorePill } from "@/components/app/score-ring";
import { createApplicationAction, deleteApplicationAction, updateApplicationAction } from "@/server/actions/applications";
import { unwrap } from "@/lib/action-client";
import { cn, formatDate } from "@/lib/utils";

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  saved: "bg-slate-100 text-slate-700",
  applied: "bg-indigo-50 text-indigo-700",
  interview: "bg-amber-50 text-amber-700",
  offer: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
};

type ResumeOption = { id: string; title: string; atsScore: number | null };

function AddApplicationDialog({ resumes }: { resumes: ResumeOption[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationInputSchema) as never,
    defaultValues: { company: "", role: "", resumeId: null, appliedOn: null, status: "saved", jobUrl: "", notes: "" },
  });
  const submit = form.handleSubmit(async (v) => {
    const res = unwrap(await createApplicationAction({ ...v, resumeId: v.resumeId || null, appliedOn: v.appliedOn || null }));
    if (res) {
      toast.success("Application added.");
      setOpen(false);
      form.reset();
      router.refresh();
    }
  });
  const err = form.formState.errors;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="dark">
          <Plus /> Add application
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add application</DialogTitle>
          <DialogDescription>Link the tailored resume you used so you always know what you sent.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input id="company" aria-invalid={!!err.company} {...form.register("company")} />
              {err.company && <p className="text-xs text-destructive">{err.company.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" aria-invalid={!!err.role} {...form.register("role")} />
              {err.role && <p className="text-xs text-destructive">{err.role.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resumeId">Resume</Label>
            <NativeSelect id="resumeId" {...form.register("resumeId", { setValueAs: (v) => v || null })}>
              <option value="">No resume linked</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                  {r.atsScore !== null ? ` (${r.atsScore}%)` : ""}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <NativeSelect id="status" {...form.register("status")}>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="appliedOn">Application date</Label>
              <Input id="appliedOn" type="date" {...form.register("appliedOn", { setValueAs: (v) => v || null })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="jobUrl">Job URL (optional)</Label>
            <Input id="jobUrl" placeholder="https://" aria-invalid={!!err.jobUrl} {...form.register("jobUrl")} />
            {err.jobUrl && <p className="text-xs text-destructive">Enter a valid URL starting with https://</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...form.register("notes")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <LoaderCircle className="animate-spin" />} Add application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ApplicationTracker({ applications, resumes }: { applications: Application[]; resumes: ResumeOption[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<ApplicationStatus | "all">("all");
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, applications.filter((a) => a.status === s).length])) as Record<ApplicationStatus, number>;
  const list = applications.filter((a) => filter === "all" || a.status === filter);
  const resumeById = new Map(resumes.map((r) => [r.id, r]));

  const patch = async (id: string, p: Partial<ApplicationInput>) => {
    if (unwrap(await updateApplicationAction(id, p))) router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter("all")} className={cn("rounded-full border px-3 py-1 text-xs", filter === "all" ? "border-foreground bg-foreground text-background" : "bg-card")}>
            All · {applications.length}
          </button>
          {APPLICATION_STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn("rounded-full border px-3 py-1 text-xs capitalize", filter === s ? "border-foreground bg-foreground text-background" : "bg-card")}>
              {s} · {counts[s]}
            </button>
          ))}
        </div>
        <AddApplicationDialog resumes={resumes} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Company</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Resume</th>
                <th className="px-4 py-2.5 font-medium">ATS Score</th>
                <th className="px-4 py-2.5 font-medium">Application Date</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No applications here yet.
                  </td>
                </tr>
              )}
              {list.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <span className="flex items-center gap-1.5">
                      {a.company}
                      {a.jobUrl && (
                        <a href={a.jobUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open job posting">
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.role}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.resumeId ?? ""}
                      onChange={(e) => patch(a.id, { resumeId: e.target.value || null })}
                      className="max-w-44 truncate rounded-md border-0 bg-transparent py-1 text-sm hover:bg-muted focus:outline-none"
                    >
                      <option value="">— Link resume —</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                    {a.resumeId && resumeById.has(a.resumeId) && (
                      <Link href={`/resumes/${a.resumeId}`} className="ml-1 text-xs text-primary hover:underline">
                        Open
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ScorePill score={a.atsScore} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.appliedOn ? formatDate(a.appliedOn) : "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => {
                        const status = e.target.value as ApplicationStatus;
                        patch(a.id, { status, ...(status === "applied" && !a.appliedOn ? { appliedOn: new Date().toISOString().slice(0, 10) } : {}) });
                      }}
                      className={cn("rounded-md border-0 px-2 py-1 text-xs font-medium capitalize focus:outline-none", STATUS_STYLE[a.status])}
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete application"
                      onClick={async () => {
                        if (confirm(`Remove ${a.company} — ${a.role}?`) && unwrap(await deleteApplicationAction(a.id))) router.refresh();
                      }}
                    >
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
