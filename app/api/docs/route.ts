import { NextRequest } from "next/server";
import { z } from "zod";
import { getPineconeIndex } from "@/lib/pinecone";

export const runtime = "nodejs";

const QuerySchema = z.object({
  userId: z.string().min(1),
});

type PineconeMatch = {
  id?: string;
  metadata?: { docId?: string } | null;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      userId: searchParams.get("userId"),
    });

    if (!parsed.success) {
      return new Response("Missing or invalid userId", { status: 400 });
    }

    const { userId } = parsed.data;

    const pineconeIndex = await getPineconeIndex();

    // This is a hacky way to get all docs for a user.
    // We can't actually query for all vectors with a given metadata field.
    // So we query for a random vector and hope that topK is large enough
    // to return all the vectors for the user.
    const results = await pineconeIndex.query({
      vector: Array(1536).fill(0),
      topK: 1000,
      includeMetadata: true,
      filter: { userId: { $eq: userId } },
    });

    const docIds = new Set<string>();
    (results.matches ?? []).forEach((m: PineconeMatch) => {
      if (m.metadata?.docId) {
        docIds.add(m.metadata.docId);
      }
    });

    return Response.json({ docIds: Array.from(docIds) });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(`Docs error: ${message}`, { status: 500 });
  }
}
