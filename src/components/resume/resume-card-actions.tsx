"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Download, Ellipsis, Pencil, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteResumeAction, duplicateResumeAction } from "@/server/actions/resumes";
import { unwrap } from "@/lib/action-client";
import { downloadFile } from "@/lib/download";

export function ResumeCardActions({ id }: { id: string }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Resume actions">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/resumes/${id}`}>
            <Pencil /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            const res = await duplicateResumeAction(id);
            if (res && !res.ok) unwrap(res);
          }}
        >
          <Copy /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => downloadFile(`/api/resumes/${id}/export?format=pdf`)}>
          <Download /> Download PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={async () => {
            if (!confirm("Delete this resume? This can't be undone.")) return;
            if (unwrap(await deleteResumeAction(id))) router.refresh();
          }}
        >
          <Trash /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
