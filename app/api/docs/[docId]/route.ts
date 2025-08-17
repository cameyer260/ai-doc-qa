import { NextRequest } from "next/server";
import { z } from "zod";
import { getPineconeIndex } from "@/lib/pinecone";

export const runtime = "nodejs";

const BodySchema = z.object({
  userId: z.string().min(1),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { docId: string } },
) {
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response("Missing or invalid userId", { status: 400 });
    }
    const { userId } = parsed.data;
    const { docId } = params;

    const pineconeIndex = await getPineconeIndex();

    // As in the GET endpoint, we can't easily get all vectors for a docId.
    // So we query for a large number of vectors and delete them.
    const results = await pineconeIndex.query({
      vector: Array(1536).fill(0),
      topK: 1000,
      includeMetadata: false, // we don't need metadata, just the ids
      filter: { userId: { $eq: userId }, docId: { $eq: docId } },
    });

    const vectorIds = (results.matches ?? []).map((m) => m.id);

    if (vectorIds.length > 0) {
      await pineconeIndex.deleteMany(vectorIds);
    }

    return Response.json({ ok: true, deletedCount: vectorIds.length });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(`Delete error: ${message}`, { status: 500 });
  }
}
