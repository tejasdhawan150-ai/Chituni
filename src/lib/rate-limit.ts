import "server-only";

/**
 * Small best-effort rate limiter (per server instance, per IP). It stops one
 * visitor from hammering the AI endpoints; it is not a hard guarantee.
 */
const hits = new Map<string, number[]>();

export function rateLimited(req: Request, bucket: string, limit = 20, windowMs = 10 * 60 * 1000): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return false;
}
