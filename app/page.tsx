export default function Home() {
  return (
    <main className="space-y-4">
      <p>Upload PDFs and ask questions. Answers are grounded in your documents (RAG) with chunk citations.</p>
      <ul className="list-disc ml-6 text-sm">
        <li>Ingest: PDF → text → token-aware chunks → embeddings → Pinecone</li>
        <li>Ask: embed question → vector search → LLM answers from context</li>
      </ul>
    </main>
  );
}
