import { NextResponse } from "next/server";
import { z } from "zod";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
// Native Google sign-in — the mobile counterpart to the web's Google button.
//
// The native app runs the Google sign-in SDK itself (which owns the system
// browser / account picker) and ends up holding an ID token. It posts that here;
// we verify the token really came from Google and was minted for *our* app, then
// find-or-create the account and hand back the same bearer token shape the rest
// of /api/mobile expects.
//
// Verification is done locally against Google's published keys rather than by
// calling their tokeninfo endpoint — no per-login round-trip, and jose caches
// and rotates the JWKS for us.
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  idToken: z.string().min(1, "idToken is required"),
  // Optional display name for brand-new accounts, if the app collected one.
  // Google's own `name` claim wins when present.
  name: z.string().trim().min(1).max(80).optional(),
});

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

// Google issues a *different* OAuth client ID per platform (iOS, Android, web),
// and the ID token's `aud` is whichever one the app used. Accept the full set.
function audiences(): string[] {
  return [
    process.env.GOOGLE_MOBILE_CLIENT_IDS ?? "",
    process.env.GOOGLE_CLIENT_ID ?? "",
  ]
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`oauth:google:ip:${ip}`, 30, 5 * 60_000); // 30 / 5 min per IP
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  // Fail closed. With no configured audience we cannot tell an ID token minted
  // for Tapcard from one minted for any other Google app — and accepting the
  // latter would let anyone sign in as any Google user.
  const aud = audiences();
  if (!aud.length) {
    return NextResponse.json(
      { error: "Google sign-in is not configured on this server." },
      { status: 501 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  let claims;
  try {
    const { payload } = await jwtVerify(parsed.data.idToken, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: aud,
    });
    claims = payload as {
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
      picture?: string;
    };
  } catch {
    // Bad signature, wrong audience, expired — all the same to the caller.
    return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
  }

  const sub = claims.sub;
  const email = claims.email?.toLowerCase();
  // Google serializes this as a real boolean in ID tokens and as the string
  // "true" via tokeninfo; accept both so we don't reject valid sign-ins.
  const verified = claims.email_verified === true || claims.email_verified === "true";

  if (!sub || !email) {
    return NextResponse.json(
      { error: "Google token is missing an account identifier" },
      { status: 401 },
    );
  }
  if (!verified) {
    return NextResponse.json(
      { error: "Your Google email address is not verified." },
      { status: 403 },
    );
  }

  // Prefer the existing Google link; fall back to matching on the verified
  // email so someone who first signed in with an emailed code lands on the
  // same account instead of getting a duplicate.
  const linked = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "google", providerAccountId: sub } },
    select: { user: true },
  });

  let user = linked?.user ?? (await prisma.user.findUnique({ where: { email } }));

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: claims.name ?? parsed.data.name ?? email.split("@")[0],
        image: claims.picture ?? null,
        emailVerified: new Date(),
      },
    });
  } else if (!user.emailVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  }

  // Record the provider link so this account resolves by `sub` next time, and
  // so the web session and the app converge on one identity.
  if (!linked) {
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "oidc",
        provider: "google",
        providerAccountId: sub,
      },
    });
  }

  const token = signMobileToken(user.id);
  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, image: user.image },
  });
}
