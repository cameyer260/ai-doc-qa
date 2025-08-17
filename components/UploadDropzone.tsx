"use client";
import { useState } from "react";

export default function UploadDropzone() {
  const [docId, setDocId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleUpload() {
    if (!file || !docId) {
      setStatus("Pick a file and enter a doc id.");
      return;
    }
    setStatus("Uploading & ingesting...");
    const form = new FormData();
    form.set("docId", docId);
    form.set("file", file);

    const res = await fetch("/api/ingest", { method: "POST", body: form });
    if (!res.ok) {
      setStatus(`Error: ${await res.text()}`);
      return;
    }
    const data = await res.json();
    setStatus(`Done! Stored ${data.chunks} chunks under docId=${data.docId}`);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm">
        Document ID (any string): 
        <input
          value={docId}
          onChange={e => setDocId(e.target.value)}
          placeholder="e.g., handbook-fall-2025"
          className="ml-2 rounded border px-2 py-1"
        />
      </label>

      <input
        type="file"
        accept="application/pdf"
        onChange={e => setFile(e.target.files?.[0] ?? null)}
        className="block"
      />

      <button
        onClick={handleUpload}
        className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
      >
        Upload & Ingest
      </button>

      <p className="text-sm opacity-80">{status}</p>
    </div>
  );
}
