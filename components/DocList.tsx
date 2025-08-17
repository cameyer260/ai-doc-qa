"use client";
import { useState, useEffect } from "react";
import { getUserId } from "@/lib/user";

export default function DocList() {
  const [userId, setUserId] = useState<string>("");
  const [docIds, setDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDocs() {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/docs?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setDocIds(data.docIds);
    }
    setLoading(false);
  }

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [userId]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  async function handleDelete(docId: string) {
    const res = await fetch(`/api/docs/${docId}`,
      {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    if (res.ok) {
      setDocIds(docIds.filter((id) => id !== docId));
    }
  }

  if (loading) {
    return <div>Loading docs...</div>;
  }

  if (!docIds.length) {
    return (
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">No Documents Found</h3>
        <p className="text-sm opacity-70">
          You haven't uploaded any documents yet. Go to the{" "}
          <a href="/upload" className="text-blue-500 hover:underline">
            Upload Page
          </a>{" "}
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Documents</h3>
        <button
          onClick={fetchDocs}
          className="rounded bg-neutral-200 px-2 py-1 text-xs hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          Refresh
        </button>
      </div>
      <ul className="space-y-2">
        {docIds.map((docId) => (
          <li key={docId} className="flex items-center justify-between rounded bg-neutral-100 p-2 dark:bg-neutral-900">
            <span className="truncate">{docId}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(docId)}
                className="rounded bg-neutral-200 px-2 py-1 text-xs hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                Copy ID
              </button>
              <button
                onClick={() => handleDelete(docId)}
                className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
