"use client";
import { toast } from "sonner";
import type { ActionResult } from "@/server/action-result";
import { downloadFile as openUrl } from "./download";

/** Show a toast for failed actions (with an upgrade link when relevant). Returns data or null. */
export function unwrap<T>(res: ActionResult<T>): T | null {
  if (res.ok) return res.data;
  if (res.upgradeTo) {
    toast.error(res.error, { action: { label: "Upgrade", onClick: () => openUrl("/settings/billing") } });
  } else toast.error(res.error);
  return null;
}
