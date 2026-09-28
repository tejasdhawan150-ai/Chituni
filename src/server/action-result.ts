import type { PlanId } from "@/config/pricing";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; upgradeTo?: PlanId; fieldErrors?: Record<string, string> };
