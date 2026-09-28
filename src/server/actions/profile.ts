"use server";
import { revalidatePath } from "next/cache";
import { profileSchema, type Profile } from "@/lib/resume/schema";
import { parseResumeText } from "@/lib/ai/engine";
import { extractTextFromFile } from "@/lib/resume/extract-text";
import { run, UserFacingError } from "../context";

export async function saveProfileAction(input: Profile) {
  return run(async ({ user, repo }) => {
    const profile = profileSchema.parse(input);
    await repo.saveProfile(user.id, profile);
    revalidatePath("/", "layout");
    return true;
  });
}

const MAX_UPLOAD = 5 * 1024 * 1024;

/** Upload a PDF/DOCX resume → text → structured profile draft (user reviews before saving). */
export async function parseResumeAction(formData: FormData) {
  return run(async ({ user, repo }) => {
    const file = formData.get("file");
    if (!(file instanceof File)) throw new UserFacingError("Please choose a PDF or DOCX file.");
    if (file.size > MAX_UPLOAD) throw new UserFacingError("File is too large (max 5 MB).");
    const text = await extractTextFromFile(file);
    if (text.trim().length < 80) throw new UserFacingError("We couldn't read text from this file. If it's a scanned image, please upload a text-based PDF or DOCX.");
    const draft = await parseResumeText(text);
    await repo.recordUsage(user.id, "resume_parse");
    return draft;
  });
}
