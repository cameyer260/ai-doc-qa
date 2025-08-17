import { NextRequest } from "next/server";
import { z } from "zod";
import { getPineconeIndex } from "@/lib/pinecone";
import { openai, EMBEDDING_MODEL, ANSWER_MODEL } from "@/lib/openai";
import { buildQaMessages } from "@/lib/prompt";

type PineconeMatch = {
  id?: string;
  score?: number;
  metadata?: { snippet?: string } | null;
};

// Use Node for best compatibility with Pinecone SDK
export const runtime = "nodejs";

const Body = z.object({
  userId: z.string().min(1),
  question: z.string().min(3),
  docId: z.string().optional(),
  topK: z.number().min(1).max(10).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = Body.parse(await req.json());
    const { question, userId, docId } = parsed;
    // defensively clamp topK in case future callers pass something wild
    const topK = Math.min(Math.max(parsed.topK ?? 6, 1), 10);

    // 1) embed query
    const qEmb = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: question,
    });
    const vector = qEmb.data[0].embedding;

    // 2) vector search
    const pineconeIndex = await getPineconeIndex();
    const filter: any = { userId: { $eq: userId } };
    if (docId) {
      filter.docId = { $eq: docId };
    }
    const results = await pineconeIndex.query({
      vector,
      topK,
      includeMetadata: true,
      filter,
    });

    // 3) build contexts
    const contexts = (results.matches ?? [])
      .map((m: PineconeMatch) => m.metadata?.snippet || "")
      .filter((s) => s.length > 0);

    // 4) answer with Chat Completions
    const messages = buildQaMessages(question, contexts).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const chat = await openai.chat.completions.create({
      model: ANSWER_MODEL,
      messages,
      max_tokens: 350,
      temperature: 0.2,
    });

    const answer =
      chat.choices?.[0]?.message?.content?.toString() ?? "No response text.";

    const sources = (results.matches ?? []).map(
      (m: PineconeMatch, i: number) => ({
        id: m.id ?? "",
        score: m.score ?? 0,
        chunk: i + 1,
        snippet: m.metadata?.snippet || "",
      }),
    );

    return Response.json({ answer, sources });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(`Ask error: ${message}`, { status: 500 });
  }
}
