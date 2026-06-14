import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { cardSchema } from "@/lib/validators";
import { slugify, randomSuffix, appUrl } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile onboarding — used by the native iOS "Tapcard" app.
//
// A single unauthenticated (optionally shared-key gated) call that:
//   1. finds or creates the user account for the scanned email,
//   2. creates a published digital business card from the scanned fields,
//   3. returns the public card slug + URL (and login creds for a new account)
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
    // Optional client-chosen password for a brand-new account. When omitted we
    // generate one and return it so the app can persist it in the Keychain.
    password: z.string().min(8).max(100).optional(),
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

  const { email: rawEmail, password: rawPassword, ...cardFields } = parsed.data;
  const email = rawEmail.toLowerCase();

  // Find or create the account. A generated password is returned only for a
  // newly created account so the app can store it for future logins.
  let user = await prisma.user.findUnique({ where: { email } });
  let isNewAccount = false;
  let issuedPassword: string | undefined;

  if (!user) {
    isNewAccount = true;
    issuedPassword = rawPassword ?? `${randomSuffix(6)}${randomSuffix(6)}`;
    const hashed = await bcrypt.hash(issuedPassword, 10);
    user = await prisma.user.create({
      data: {
        email,
        name: cardFields.fullName,
        password: hashed,
      },
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
    // Only present for a freshly created account.
    password: issuedPassword,
    card: {
      id: card.id,
      slug: card.slug,
      url: appUrl(`/c/${card.slug}`),
    },
  });
}
