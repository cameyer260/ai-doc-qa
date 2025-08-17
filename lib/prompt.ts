export function buildQaMessages(question: string, contexts: string[]) {
  const contextBlock = contexts.map((c, i) => `[chunk ${i+1}]\n${c}`).join("\n\n---\n\n");
  return [
    {
      role: "system",
      content:
        "You answer ONLY from the provided context. If the answer is not in the context, say you don't see it in the documents. " +
        "Cite chunks like [chunk X] after claims. Be concise and factual.",
    },
    {
      role: "user",
      content: `Question: ${question}\n\nContext:\n${contextBlock}`,
    },
  ] as const;
}
