import "server-only";
import { ZodError } from "zod";
import { requireUser, type AppUser } from "@/lib/auth";
import { getRepository, type Repository } from "@/lib/db";
import { AIError } from "@/lib/ai/provider";
import type { ActionResult } from "./action-result";
import { UserFacingError, notFoundMessage } from "@/lib/errors";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export { UserFacingError };

/** User-facing "not found" error (explains demo-mode resets). */
export function missing(thing: string) {
  return new UserFacingError(notFoundMessage(thing, !isSupabaseConfigured()));
}

export interface Ctx {
  user: AppUser;
  repo: Repository;
}

export async function getCtx(): Promise<Ctx> {
  const user = await requireUser();
  return { user, repo: getRepository() };
}

/** Wraps a server action: authenticates, and converts known errors into a typed result. */
export async function run<T>(fn: (ctx: Ctx) => Promise<T>): Promise<ActionResult<T>> {
  try {
    const ctx = await getCtx();
    return { ok: true, data: await fn(ctx) };
  } catch (err) {
    // Let Next.js redirects / notFound propagate.
    if (err && typeof err === "object" && "digest" in err && typeof (err as { digest: unknown }).digest === "string" && (err as { digest: string }).digest.startsWith("NEXT_")) throw err;
    if (err instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const i of err.issues) fieldErrors[i.path.join(".")] ??= i.message;
      return { ok: false, error: err.issues[0]?.message ?? "Invalid input.", fieldErrors };
    }
    if (err instanceof AIError) return { ok: false, error: err.message };
    if (err instanceof UserFacingError) return { ok: false, error: err.message };
    console.error("[action]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

