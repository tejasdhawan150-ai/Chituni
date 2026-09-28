import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-foreground" />
      <path d="M10 9h6.5a7 7 0 0 1 0 14H10z" className="fill-none stroke-background" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="22.5" cy="9.5" r="2.5" className="fill-[oklch(0.72_0.17_268)]" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)} aria-label="DreamJobResume home">
      <LogoMark />
      <span className="text-[15px]">
        DreamJob<span className="text-muted-foreground">Resume</span>
      </span>
    </Link>
  );
}
