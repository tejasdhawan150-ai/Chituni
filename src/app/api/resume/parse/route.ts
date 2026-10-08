import { NextResponse } from "next/server";
import { z } from "zod";
import { parseResumeText } from "@/lib/ai/engine";
import { extractTextFromFile } from "@/lib/resume/extract-text";
import { profileToContent } from "@/lib/resume/schema";
import { UserFacingError } from "@/lib/errors";
import { rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_UPLOAD = 4 * 1024 * 1024;

/** Upload a PDF/DOCX (multipart) or send { text } → structured resume content. */
export async function POST(req: Request) {
  if (rateLimited(req, "parse")) return NextResponse.json({ error: "Too many requests. Please wait a few minutes and try again." }, { status: 429 });
  try {
    let text: string;
    if ((req.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const file = (await req.formData()).get("file");
      if (!(file instanceof File)) throw new UserFacingError("Please choose a PDF or Word (.docx) file.");
      if (file.size > MAX_UPLOAD) throw new UserFacingError("That file is too large (max 4 MB).");
      text = await extractTextFromFile(file);
    } else {
      text = z.object({ text: z.string().max(30000) }).parse(await req.json()).text;
    }
    if (text.trim().length < 80) {
      throw new UserFacingError("We couldn't read enough text. If your PDF is a scanned image, please paste your resume text instead.");
    }
    const profile = await parseResumeText(text);
    return NextResponse.json({ resume: profileToContent(profile) });
  } catch (err) {
    if (err instanceof UserFacingError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("[parse]", err);
    return NextResponse.json({ error: "We couldn't read that resume. Please try pasting the text instead." }, { status: 500 });
  }
}
