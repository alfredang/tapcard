import { createHmac, timingSafeEqual } from "node:crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile token auth (HS256 JWT), used by the native Tapcard apps.
//
// The web app authenticates via Auth.js session cookies, which a native app
// can't hold. These helpers issue and verify a compact, self-contained bearer
// token signed with the same AUTH_SECRET, so mobile routes can identify the
// user from an `Authorization: Bearer <token>` header. No extra dependency —
// just Node's crypto (same HS256 scheme as a standard JWT).
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TTL_DAYS = 30;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

/** Issues a signed bearer token for [userId], valid for [days]. */
export function signMobileToken(userId: string, days = DEFAULT_TTL_DAYS): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, iat: now, exp: now + days * 86_400 }),
  ).toString("base64url");
  const data = `${header}.${payload}`;
  return `${data}.${sign(data)}`;
}

/** Verifies a bearer token and returns the user id, or null if invalid/expired. */
export function verifyMobileToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, providedSig] = parts;

  const expectedSig = sign(`${header}.${payload}`);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof decoded.exp === "number" && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return typeof decoded.sub === "string" ? decoded.sub : null;
  } catch {
    return null;
  }
}

/** Extracts and verifies the bearer token from a request; null if absent/invalid. */
export function getMobileUserId(req: Request): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return verifyMobileToken(header.slice("Bearer ".length).trim());
}
