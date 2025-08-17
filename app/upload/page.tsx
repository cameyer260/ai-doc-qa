import UploadDropzone from "@/components/UploadDropzone";

export default function UploadPage() {
  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Upload a PDF</h2>
      <UploadDropzone />
      <p className="text-xs opacity-70">Tip: keep files reasonably sized for the demo; large PDFs mean more tokens.</p>
    </main>
  );
}
