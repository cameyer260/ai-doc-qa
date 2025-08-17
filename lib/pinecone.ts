import { Pinecone, type IndexModel } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw new Error("PINECONE_API_KEY is not set in the environment variables.");
}

const pc = new Pinecone({ apiKey });

const INDEX_NAME = process.env.PINECONE_INDEX!;
const DIMENSION = 1536; // text-embedding-3-small
const CLOUD = "aws";
const REGION = "us-east-1";

export async function getPineconeIndex() {
  let model: IndexModel | undefined;
  try {
    model = await pc.describeIndex(INDEX_NAME);
  } catch {
    model = undefined;
  }

  if (!model) {
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: DIMENSION,
      metric: "cosine",
      spec: { serverless: { cloud: CLOUD, region: REGION } },
    });
    // wait until ready
    while (true) {
      try {
        const d = await pc.describeIndex(INDEX_NAME);
        if (d.status?.ready) {
          model = d;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return pc.index(INDEX_NAME);
}
