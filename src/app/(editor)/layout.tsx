import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Full-screen layout for the resume editor (no sidebar). */
export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <div className="min-h-dvh bg-background">{children}</div>;
}
