import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-xs text-muted-foreground">
          By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.55_0.2_268/0.55),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-background">
          <blockquote className="max-w-md text-2xl font-medium leading-snug tracking-tight">
            “Paste a job description. Get a resume tailored for that job.”
          </blockquote>
          <div className="mt-8 space-y-3 text-sm text-background/70">
            {["ATS match score before and after tailoring", "13 recruiter-approved, ATS-safe templates", "AI that never invents experience"].map((x) => (
              <div key={x} className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-indigo-300" /> {x}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
