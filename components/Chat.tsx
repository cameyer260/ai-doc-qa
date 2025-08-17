"use client";
import { useState, useEffect } from "react";
import { getUserId } from "@/lib/user";

type Source = { id: string; score?: number; chunk: number; snippet: string };

export default function Chat() {
  const [userId, setUserId] = useState<string>("");
  const [docId, setDocId] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, question, docId: docId || undefined }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setSources(data.sources || []);
    setLoading(false);
  }

  function handleClear() {
    setQuestion("");
    setAnswer("");
    setSources([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="docId" className="text-sm font-medium">
          Filter by Document ID (optional)
        </label>
        <input
          id="docId"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          placeholder="Enter a document ID to limit the search"
          className="rounded border px-3 py-2"
        />
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask your question..."
        rows={4}
        className="w-full rounded border px-3 py-2"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={ask}
          disabled={loading}
          className="rounded-xl bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
        <button
          onClick={handleClear}
          className="rounded-xl border px-6 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
        >
          Clear
        </button>
      </div>

      {answer && (
        <div className="rounded-xl border p-4">
          <div className="mb-2 text-lg font-semibold">Answer</div>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {answer}
          </div>
        </div>
      )}

      {!!sources.length && (
        <details className="rounded-xl border">
          <summary className="cursor-pointer p-4 text-lg font-semibold">
            Sources
          </summary>
          <div className="border-t p-4">
            <ul className="space-y-4">
              {sources.map((s) => (
                <li key={s.id} className="text-sm">
                  <div className="opacity-70">
                    [chunk {s.chunk}] id=<code>{s.id}</code>{" "}
                    {s.score ? `(score: ${s.score.toFixed(3)})` : ""}
                  </div>
                  <div className="mt-1 rounded bg-neutral-100 p-2 dark:bg-neutral-900">
                    {s.snippet}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
