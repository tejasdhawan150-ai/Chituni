"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  fullName: z.string().trim().max(120).optional(),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type Values = z.infer<typeof schema>;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export function AuthForm({ mode, demo }: { mode: "login" | "signup"; demo: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? (mode === "signup" ? "/onboarding" : "/dashboard");
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const [oauthLoading, setOauthLoading] = React.useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", fullName: "" } });

  if (demo) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border bg-amber-50/60 p-4 text-sm text-amber-900">
          <p className="font-medium">Demo mode</p>
          <p className="mt-1 text-amber-900/80">Supabase isn&apos;t configured, so you&apos;re signed in as a demo user with sample data. Add your Supabase keys to enable real accounts.</p>
        </div>
        <Button className="w-full" size="lg" variant="dark" onClick={() => router.push(next)}>
          Continue to the app
        </Button>
      </div>
    );
  }

  const google = async () => {
    setOauthLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      toast.error(error.message);
      setOauthLoading(false);
    }
  };

  const onSubmit = form.handleSubmit(async (v) => {
    const supabase = createSupabaseBrowserClient();
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
        options: { data: { full_name: v.fullName }, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) return void toast.error(error.message);
      if (!data.session) return void toast.success("Check your inbox to confirm your email.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
      if (error) return void toast.error(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
    }
    router.replace(next);
    router.refresh();
  });

  return (
    <div className="space-y-5">
      <Button type="button" variant="outline" size="lg" className="w-full" onClick={google} disabled={oauthLoading}>
        {oauthLoading ? <LoaderCircle className="animate-spin" /> : <GoogleIcon />} Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" autoComplete="name" {...form.register("fullName")} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
          {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} aria-invalid={!!form.formState.errors.password} {...form.register("password")} />
          {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" variant="dark" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <LoaderCircle className="animate-spin" />}
          {mode === "signup" ? "Create account" : "Log in"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-foreground underline-offset-4 hover:underline">Log in</Link>
          </>
        ) : (
          <>
            New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-medium text-foreground underline-offset-4 hover:underline">Create an account</Link>
          </>
        )}
      </p>
    </div>
  );
}
