import type { NextRequest } from "next/server";

const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 10_000; // 10s
const MAX = 15; // 15 req/10s per IP

export function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const entry = hits.get(ip) ?? { count: 0, ts: now };
  if (now - entry.ts > WINDOW_MS) { entry.count = 0; entry.ts = now; }
  entry.count += 1; hits.set(ip, entry);
  if (entry.count > MAX) {
    return new Response("Too many requests", { status: 429 });
  }
  return;
}

export const config = { matcher: ["/api/:path*"] };
