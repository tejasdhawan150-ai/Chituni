import { NextResponse } from "next/server";
import { z } from "zod";
import { resumeContentSchema } from "@/lib/resume/schema";
import { getTemplate } from "@/lib/resume/templates";
import { renderResumePdf } from "@/lib/resume/pdf";
import { renderResumeDocx } from "@/lib/resume/docx";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const bodySchema = z.object({ resume: resumeContentSchema, templateId: z.string().default("classic-ats"), format: z.enum(["pdf", "docx"]) });

/** Stateless: resume content in → PDF or Word file out. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid resume." }, { status: 400 });
  const { resume, templateId, format } = parsed.data;
  const template = getTemplate(templateId);
  const name = slugify(`${resume.basics.fullName || "my"}-resume`) || "resume";
  if (format === "docx") {
    const buf = await renderResumeDocx(resume, template);
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="${name}.docx"` },
    });
  }
  const buf = await renderResumePdf(resume, template);
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}.pdf"` } });
}
