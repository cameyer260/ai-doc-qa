// lib/chunk.ts
/**
 * Simple, dependency-free chunker that approximates tokens by characters.
 * Assumes ~4 chars/token (OpenAI-ish). Uses a sliding window with overlap.
 *
 * targetTokens: tokens per chunk (approx)
 * overlapTokens: tokens to overlap between chunks (approx)
 */
export function chunkText(
  text: string,
  {
    targetTokens = 900,
    overlapTokens = 120,
  }: {
    targetTokens?: number;
    overlapTokens?: number;
  } = {},
) {
  const avgCharsPerToken = 4; // rough, good enough for demo
  const maxChars = Math.max(200, Math.floor(targetTokens * avgCharsPerToken));
  const overlapChars = Math.min(
    Math.floor(overlapTokens * avgCharsPerToken),
    Math.floor(maxChars * 0.5), // don't overlap more than 50%
  );

  // Normalize whitespace a bit
  const clean = text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  const chunks: { text: string; chunkIndex: number }[] = [];
  if (!clean) return chunks;

  const step = Math.max(1, maxChars - overlapChars);

  for (let start = 0, idx = 0; start < clean.length; start += step, idx++) {
    let end = Math.min(start + maxChars, clean.length);

    // Try to end on a nicer boundary: sentence end or paragraph break
    if (end < clean.length) {
      // prefer paragraph break
      const paraBreak = clean.lastIndexOf("\n\n", end);
      if (paraBreak > start + Math.floor(maxChars * 0.5)) {
        end = paraBreak + 2; // include the break
      } else {
        // fallback: sentence boundary
        const sentenceEnd = clean.lastIndexOf(".", end);
        if (sentenceEnd > start + Math.floor(maxChars * 0.4)) {
          end = sentenceEnd + 1;
        }
      }
    }

    const slice = clean.slice(start, end).trim();
    if (slice) chunks.push({ text: slice, chunkIndex: idx });
    if (end === clean.length) break;
  }

  return chunks;
}
