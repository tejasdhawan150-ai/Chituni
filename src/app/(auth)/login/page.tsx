import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { isDemoMode } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mb-8 mt-1.5 text-sm text-muted-foreground">Log in to tailor your next application.</p>
      <Suspense>
        <AuthForm mode="login" demo={isDemoMode()} />
      </Suspense>
    </>
  );
}
