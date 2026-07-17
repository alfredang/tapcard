import "server-only";
import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight in-memory rate limiter.
//
// A fixed-window counter kept in a module-level Map. It protects the abusable
// public/auth endpoints (OTP email sending, login/register brute force, public
// analytics ingest) from being hammered in a loop.
//
// Caveats (fine for our scale, worth knowing):
//  - In-memory: counters are per server instance and reset on restart/redeploy.
//    If the app is ever scaled to multiple instances, move this to Redis/Upstash.
//  - Best-effort: not a security boundary on its own, just abuse dampening.
// ─────────────────────────────────────────────────────────────────────────────

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

/** Drop expired buckets occasionally so the Map can't grow without bound. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateResult = { ok: boolean; retryAfterSec: number };

/**
 * Record a hit for [key] and report whether it is within [limit] per [windowMs].
 * Different call sites should use distinct key prefixes (e.g. "otp:req:<ip>").
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP from proxy headers (Coolify/Next sit behind a proxy). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Standard 429 response with a Retry-After header. */
export function tooManyRequests(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
