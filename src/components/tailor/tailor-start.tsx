"use client";
import * as React from "react";
import type { ResumeContent } from "@/lib/resume/schema";
import { getTemplate } from "@/lib/resume/templates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplatePicker } from "@/components/resume/template-picker";
import { TailorForm } from "./tailor-form";

/** Steps 3–4: choose a template, paste the job description, analyze. */
export function TailorStart({ content, defaultTemplate }: { content: ResumeContent; defaultTemplate: string }) {
  const [templateId, setTemplateId] = React.useState(defaultTemplate);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const t = getTemplate(templateId);
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="font-semibold">Paste the job description</h2>
            <p className="text-sm text-muted-foreground">From LinkedIn, Indeed, Naukri, a company careers page — anywhere.</p>
          </div>
        </div>
        <TailorForm size="large" cta="Analyze Job" templateId={templateId} autoFocus />
      </Card>

      <Card className="p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">Template</h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t.name}</span> — {t.description}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowTemplates((s) => !s)}>
            {showTemplates ? "Done" : "Change template"}
          </Button>
        </div>
        {showTemplates && (
          <div className="mt-6">
            <TemplatePicker value={templateId} onChange={setTemplateId} content={content} />
            <p className="mt-4 text-xs text-muted-foreground">All templates are single-column and ATS-safe. You can switch later without losing content.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
