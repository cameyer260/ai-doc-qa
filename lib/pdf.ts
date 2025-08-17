// lib/pdf.ts
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extractTextFromPdf(buf: Buffer): Promise<string> {
  if (!buf || buf.length === 0) throw new Error("Empty PDF buffer");

  const res = await pdfParse(buf);
  // light cleanup to keep chunks tidy
  return res.text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
}
