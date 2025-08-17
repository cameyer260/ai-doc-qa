import Chat from "@/components/Chat";

export default function AskPage() {
  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Ask Your Documents</h2>
      <Chat />
      <p className="text-xs opacity-70">
        Answers are grounded in retrieved chunks. If it’s not in the docs, the model will say so.
      </p>
    </main>
  );
}
