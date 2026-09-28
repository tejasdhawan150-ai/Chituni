import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { renderTextPdf } from "@/lib/resume/pdf";
import { renderTextDocx } from "@/lib/resume/docx";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const letter = (await getRepository().listCoverLetters(user.id)).find((l) => l.id === id);
  if (!letter) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const name = slugify(`cover-letter-${letter.company || letter.role || "job"}`);
  if (req.nextUrl.searchParams.get("format") === "docx") {
    const buf = await renderTextDocx(letter.body);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${name}.docx"`,
      },
    });
  }
  const buf = await renderTextPdf("Cover letter", letter.body, user.name);
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}.pdf"` } });
}
