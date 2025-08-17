import Chat from "@/components/Chat";
import DocList from "@/components/DocList";

export default function AskPage() {
  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Ask Your Documents</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Chat />
        </div>
        <div className="md:col-span-1">
          <DocList />
        </div>
      </div>
      <p className="text-xs opacity-70">
        Answers are grounded in retrieved chunks. If it’s not in the docs, the model will say so.
      </p>
    </main>
  );
}
