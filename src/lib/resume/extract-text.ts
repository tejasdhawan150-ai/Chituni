import "server-only";
import { UserFacingError } from "@/lib/errors";

const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Extract plain text from an uploaded PDF or DOCX. Validates by magic bytes, not just extension. */
export async function extractTextFromFile(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const isPdf = buf.subarray(0, 5).toString() === "%PDF-";
  const isZip = buf[0] === 0x50 && buf[1] === 0x4b; // DOCX is a zip container
  const name = file.name.toLowerCase();

  if (isPdf && (file.type === PDF || name.endsWith(".pdf"))) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n") : text;
  }
  if (isZip && (file.type === DOCX || name.endsWith(".docx"))) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return value;
  }
  throw new UserFacingError("Unsupported file type. Upload a PDF or DOCX.");
}
