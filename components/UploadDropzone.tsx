"use client";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useState, useEffect } from "react";
import { getUserId } from "@/lib/user";
import { v4 as uuidv4 } from 'uuid';

export default function UploadDropzone() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [userId, setUserId] = useState<string>("");
  const [docId, setDocId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  function generateDocId() {
    setDocId(uuidv4().slice(0, 8));
  }

  async function handleUpload() {
    if (!file) {
      setStatus("Please select a file to upload.");
      return;
    }
    if (!docId) {
      setStatus("Please generate or enter a document ID.");
      return;
    }
    if (!executeRecaptcha) {
      setStatus("reCAPTCHA not available");
      return;
    }

    setStatus("Uploading & ingesting...");
    const token = await executeRecaptcha("upload");

    const form = new FormData();
    form.set("userId", userId);
    form.set("docId", docId);
    form.set("file", file);
    form.set("token", token);

    const res = await fetch("/api/ingest", { method: "POST", body: form });
    if (!res.ok) {
      setStatus(`Error: ${await res.text()}`);
      return;
    }
    const data = await res.json();
    setStatus(`Done! Stored ${data.chunks} chunks under docId=${data.docId}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          placeholder="e.g., handbook-fall-2025"
          className="w-full rounded border px-3 py-2"
        />
        <button
          onClick={generateDocId}
          className="rounded-xl border bg-neutral-100 px-4 py-2 text-sm hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          Random
        </button>
      </div>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full rounded border p-2"
      />

      <button
        onClick={handleUpload}
        className="w-full rounded-xl bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        Upload & Ingest
      </button>

      {status && <p className="text-sm opacity-80">{status}</p>}
    </div>
  );
}
