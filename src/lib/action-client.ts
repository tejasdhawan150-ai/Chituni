"use client";
import { toast } from "sonner";
import type { ActionResult } from "@/server/action-result";

/** Show a toast for failed actions. Returns data or null. */
export function unwrap<T>(res: ActionResult<T>): T | null {
  if (res.ok) return res.data;
  toast.error(res.error);
  return null;
}
