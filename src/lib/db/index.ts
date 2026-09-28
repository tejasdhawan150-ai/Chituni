import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { memoryRepository } from "./memory";
import { createSupabaseRepository } from "./supabase";
import type { Repository } from "./types";

export type { Repository } from "./types";

/** Returns the active repository: Supabase when configured, otherwise the in-memory demo store. */
export function getRepository(): Repository {
  return isSupabaseConfigured() ? createSupabaseRepository() : memoryRepository;
}
