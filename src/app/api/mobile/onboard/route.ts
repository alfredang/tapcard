import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { cardSchema } from "@/lib/validators";
import { slugify, randomSuffix, appUrl } from "@/lib/utils";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";
import { getMobileUserId } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile onboarding — used by the native iOS "Tapcard" app.
//
// A single unauthenticated (optionally shared-key gated) call that:
//   1. finds or creates the user account for the scanned email,
//   2. creates a published digital business card from the scanned fields,
//   3. returns the public card slug + URL
//
// Accounts created here are passwordless: the owner claims the account later by
// signing in with Google or an emailed one-time code on the same address.
//
// This lets the app turn a snapshot of a paper business card into a live
// digital card + account in one round-trip, with everything persisted to the
// same Coolify Postgres the web app uses.
// ─────────────────────────────────────────────────────────────────────────────

// The scanned card fields are a subset of the full card schema, plus the email
// that doubles as the account identifier. fullName + email are required; the
// rest are best-effort OCR output.
const onboardSchema = cardSchema
  .partial()
  .extend({
    fullName: z.string().trim().min(1, "Full name is required").max(120),
    email: z.string().trim().email("A valid email is required"),
  });

async function uniqueSlug(base: string) {
  const root = slugify(base) || "card";
  let candidate = root;
  for (let i = 0; i < 6; i++) {
    const exists = await prisma.card.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    candidate = `${root}-${randomSuffix()}`;
  }
  return `${root}-${randomSuffix(6)}`;
}

export async function POST(req: Request) {
  // Throttle per IP so this account/card-creating endpoint can't be flooded.
  const limited = rateLimit(`onboard:ip:${clientIp(req)}`, 10, 10 * 60_000); // 10 / 10 min
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  // Optional shared-secret gate. When MOBILE_API_KEY is set in the environment,
  // the app must send a matching `x-tapcard-key` header; when unset the endpoint
  // is open (handy for local dev).
  const requiredKey = process.env.MOBILE_API_KEY;
  if (requiredKey && req.headers.get("x-tapcard-key") !== requiredKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = onboardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email: rawEmail, ...cardFields } = parsed.data;
  const email = rawEmail.toLowerCase();

  // ── Path 1: token-authenticated (the Android app's "Publish to web" while
  //    signed in). The bearer token identifies the owner, so we attach the
  //    published card to that account — no key or new-account creation needed.
  //    This is why publish works in production even when MOBILE_API_KEY is set.
  const tokenUserId = getMobileUserId(req);
  if (tokenUserId) {
    const user = await prisma.user.findUnique({ where: { id: tokenUserId } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const slug = await uniqueSlug(cardFields.fullName);
    const card = await prisma.card.create({
      data: { ...cardFields, email, slug, userId: user.id, published: true },
    });
    return NextResponse.json({
      ok: true,
      isNewAccount: false,
      email,
      card: {
        id: card.id,
        slug: card.slug,
        url: appUrl(`/c/${card.slug}`),
      },
    });
  }

  // ── Path 2: legacy shared-key + email (native iOS app). Find or create the
  //    account. Nothing is issued back for a new account — the address itself is
  //    the credential, redeemed via Google or a one-time code at sign-in.
  let user = await prisma.user.findUnique({ where: { email } });
  let isNewAccount = false;

  if (!user) {
    isNewAccount = true;
    user = await prisma.user.create({
      data: { email, name: cardFields.fullName },
    });
  }

  const slug = await uniqueSlug(cardFields.fullName);
  const card = await prisma.card.create({
    data: {
      ...cardFields,
      email,
      slug,
      userId: user.id,
      published: true,
    },
  });

  return NextResponse.json({
    ok: true,
    isNewAccount,
    email,
    card: {
      id: card.id,
      slug: card.slug,
      url: appUrl(`/c/${card.slug}`),
    },
  });
}
