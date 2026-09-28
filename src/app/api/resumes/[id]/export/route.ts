import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { getTemplate } from "@/lib/resume/templates";
import { renderResumePdf } from "@/lib/resume/pdf";
import { renderResumeDocx } from "@/lib/resume/docx";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") === "docx" ? "docx" : "pdf";
  const repo = getRepository();
  const resume = await repo.getResume(user.id, id);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const template = getTemplate(resume.templateId);
  const name = slugify(`${resume.content.basics.fullName || "resume"}-${resume.targetCompany || resume.title}`) || "resume";

  if (format === "docx") {
    const buf = await renderResumeDocx(resume.content, template);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${name}.docx"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  const buf = await renderResumePdf(resume.content, template);
  return new NextResponse(new Uint8Array(buf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}.pdf"`, "Cache-Control": "private, no-store" },
  });
}
