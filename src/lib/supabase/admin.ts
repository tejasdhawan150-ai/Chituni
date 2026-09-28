import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./config";

/** Service-role client. Bypasses RLS — use ONLY in trusted server code (e.g. Stripe webhooks). */
export function createSupabaseAdminClient() {
  const { url } = supabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
