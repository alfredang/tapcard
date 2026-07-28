import { NextResponse } from "next/server";
import { z } from "zod";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "@/lib/db";
import { signMobileToken } from "@/lib/mobile-auth";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
// Native Sign in with Apple — the iOS counterpart to /api/mobile/oauth/google.
//
// The app runs `ASAuthorizationAppleIDProvider` itself and ends up holding an
// Apple **identity token** (a JWT). It posts that here; we verify it really
// came from Apple and was minted for *our* app (aud = the app's bundle ID in
// the native flow), then find-or-create the account and hand back the same
// bearer token shape the rest of /api/mobile expects.
//
// Unlike Google, Apple puts no name in the token — the app only ever sees the
// user's name on the FIRST authorization, so it forwards it in the body then.
// The email may be a @privaterelay.appleid.com address when the user chose
// "Hide My Email"; it is still a working, Apple-verified address.
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  identityToken: z.string().min(1, "identityToken is required"),
  // Display name for brand-new accounts, only available on first authorization.
  name: z.string().trim().min(1).max(80).optional(),
});

const APPLE_JWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

// In the native flow the token's `aud` is the app's bundle ID. Overridable via
// env for extra bundle IDs (e.g. a dev build), comma-separated.
function audiences(): string[] {
  return (process.env.APPLE_MOBILE_BUNDLE_IDS ?? "com.tertiaryinfotech.tapcard")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = rateLimit(`oauth:apple:ip:${ip}`, 30, 5 * 60_000); // 30 / 5 min per IP
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

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
    const { payload } = await jwtVerify(parsed.data.identityToken, APPLE_JWKS, {
      issuer: "https://appleid.apple.com",
      audience: audiences(),
    });
    claims = payload as {
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
    };
  } catch {
    // Bad signature, wrong audience, expired — all the same to the caller.
    return NextResponse.json({ error: "Invalid Apple token" }, { status: 401 });
  }

  const sub = claims.sub;
  const email = claims.email?.toLowerCase();

  if (!sub) {
    return NextResponse.json(
      { error: "Apple token is missing an account identifier" },
      { status: 401 },
    );
  }

  // Prefer the existing Apple link; fall back to matching on the email so
  // someone who first signed in with an emailed code lands on the same
  // account instead of getting a duplicate. Apple has verified the address
  // (real or private-relay) before ever minting the token.
  const linked = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: "apple", providerAccountId: sub } },
    select: { user: true },
  });

  let user =
    linked?.user ??
    (email ? await prisma.user.findUnique({ where: { email } }) : null);

  if (!user) {
    // Without a prior link we need an email to anchor the account.
    if (!email) {
      return NextResponse.json(
        { error: "Apple token is missing an email address" },
        { status: 401 },
      );
    }
    user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name ?? email.split("@")[0],
        emailVerified: new Date(),
      },
    });
  } else if (!user.emailVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  }

  // Record the provider link so this account resolves by `sub` next time —
  // essential for Apple, whose later tokens may omit the email claim.
  if (!linked) {
    await prisma.account.create({
      data: {
        userId: user.id,
        type: "oidc",
        provider: "apple",
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
