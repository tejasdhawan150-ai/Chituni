import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Auth boundary. Pages and actions only use `getCurrentUser` / `requireUser`,
 * so the provider (Supabase today) can be swapped for Auth.js, Clerk, etc.
 */
export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isDemo: boolean;
}

export const DEMO_USER: AppUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "aanya.kapoor@example.com",
  name: "Aanya Kapoor",
  avatarUrl: null,
  isDemo: true,
};

export const isDemoMode = () => !isSupabaseConfigured();

export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  if (isDemoMode()) {
    await connection(); // user-specific data must never be prerendered
    return DEMO_USER;
  }
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, string | undefined>;
  return {
    id: u.id,
    email: u.email ?? "",
    name: meta.full_name ?? meta.name ?? u.email?.split("@")[0] ?? "",
    avatarUrl: meta.avatar_url ?? null,
    isDemo: false,
  };
});

export async function requireUser(next?: string): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}
