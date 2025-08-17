import { NextRequest } from "next/server";
import { z } from "zod";
import { extractTextFromPdf } from "@/lib/pdf";
import { chunkText } from "@/lib/chunk";
import { getPineconeIndex } from "@/lib/pinecone";
import { openai, EMBEDDING_MODEL } from "@/lib/openai";

export const runtime = "nodejs";

const BodySchema = z.object({
  userId: z.string().min(1),
  docId: z.string().min(1),
  token: z.string().min(1),
});

type Meta = { userId: string; docId: string; chunkIndex: number; snippet: string };
type PCVector = { id: string; values: number[]; metadata: Meta };

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return new Response("Expected multipart/form-data", { status: 400 });
    }

    const form = await req.formData();
    const parsed = BodySchema.safeParse({
      userId: String(form.get("userId") ?? ""),
      docId: String(form.get("docId") ?? ""),
      token: String(form.get("token") ?? ""),
    });
    if (!parsed.success) {
      return new Response("Missing or invalid form data", { status: 400 });
    }
    const { userId, docId, token } = parsed.data;

    // Verify reCAPTCHA
    const recaptchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });
    const recaptchaJson = await recaptchaRes.json();
    if (!recaptchaJson.success) {
      return new Response("reCAPTCHA verification failed", { status: 400 });
    }

    const fileEntry = form.get("file");
    if (!fileEntry || !(fileEntry instanceof File)) {
      return new Response("PDF file is required", { status: 400 });
    }

    const buf = Buffer.from(await fileEntry.arrayBuffer());
    const text = await extractTextFromPdf(buf);
    if (!text)
      return new Response("No text extracted from PDF", { status: 400 });

    const chunks = chunkText(text, { targetTokens: 900, overlapTokens: 120 });

    const batchSize = 64;
    const vectors: PCVector[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const emb = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch.map((b) => b.text),
      });

      emb.data.forEach((e, j) => {
        const globalIdx = i + j;
        const snippet = batch[j]?.text.slice(0, 500) ?? "";
        vectors.push({
          id: `${docId}::${globalIdx}`,
          values: e.embedding,
          metadata: { userId, docId, chunkIndex: globalIdx, snippet },
        });
      });
    }

    // ⬇️ get the index handle, then upsert
    const pineconeIndex = await getPineconeIndex();

    const upsertBatch = 100;
    for (let i = 0; i < vectors.length; i += upsertBatch) {
      const slice = vectors.slice(i, i + upsertBatch);
      await pineconeIndex.upsert(slice);
    }

    return Response.json({ ok: true, docId, chunks: chunks.length });
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "string"
          ? e
          : "Unknown error";
    console.error("Ingest error:", e);
    return new Response(`Ingest error: ${message}`, { status: 500 });
  }
}
