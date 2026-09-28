"use client";
import Link from "next/link";
import { ChevronDown, FileText, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createResumeFromProfileAction } from "@/server/actions/resumes";
import { unwrap } from "@/lib/action-client";

export function NewResumeButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="dark">
          <Plus /> New resume <ChevronDown className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem asChild>
          <Link href="/tailor" className="items-start">
            <Sparkles className="mt-0.5" />
            <span>
              <span className="block font-medium">Tailor for a job</span>
              <span className="block text-xs text-muted-foreground">Paste a job description</span>
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="items-start"
          onSelect={async () => {
            const res = await createResumeFromProfileAction();
            if (res && !res.ok) unwrap(res);
          }}
        >
          <FileText className="mt-0.5" />
          <span>
            <span className="block font-medium">General resume</span>
            <span className="block text-xs text-muted-foreground">From your profile, no job targeting</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
