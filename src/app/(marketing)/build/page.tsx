import type { Metadata } from "next";
import { ResumeTool } from "@/components/build/resume-tool";

export const metadata: Metadata = {
  title: "Build My Resume",
  description: "Upload your resume, paste a job description and download a tailored, ATS-friendly resume. Free, no sign-up.",
  alternates: { canonical: "/build" },
};

export default function BuildPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:pt-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Build your resume for this job</h1>
        <p className="mt-2 text-muted-foreground">Three simple steps. Free. No sign-up.</p>
      </div>
      <ResumeTool />
    </div>
  );
}
