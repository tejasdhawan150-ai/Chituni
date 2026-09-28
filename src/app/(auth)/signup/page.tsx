import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { isDemoMode } from "@/lib/auth";

export const metadata: Metadata = { title: "Create your account", robots: { index: false } };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Build your dream resume</h1>
      <p className="mb-8 mt-1.5 text-sm text-muted-foreground">Free to start. No credit card required.</p>
      <Suspense>
        <AuthForm mode="signup" demo={isDemoMode()} />
      </Suspense>
    </>
  );
}
