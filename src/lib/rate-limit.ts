const hits = new Map<string, { count: number; windowStart: number }>();

export function checkRate(
  key: string,
  max = 8,
  windowMs = 60_000
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    hits.set(key, { count: 1, windowStart: now });
    return { ok: true, retryAfterMs: 0 };
  }

  if (entry.count >= max) {
    return { ok: false, retryAfterMs: windowMs - (now - entry.windowStart) };
  }

  entry.count++;
  return { ok: true, retryAfterMs: 0 };
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
