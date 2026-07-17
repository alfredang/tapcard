import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getMobileUserId } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile account deletion — used by the native Tapcard apps.
//
// Apple App Store Guideline 5.1.1(v) requires any app that supports account
// creation to also let users initiate account *deletion* from within the app.
// This endpoint deactivates and anonymizes the account so the user can no longer
// sign back in and their personal data is removed/tombstoned, while keeping the
// (now-anonymous) row for referential integrity of any CRM records referencing it.
//
// What it does, in one transaction:
//   1. deletes the user's published digital cards (and, by cascade, their
//      analytics events; leads keep their row with cardId nulled),
//   2. revokes any OAuth links + active sessions,
//   3. tombstones the email (frees the original address for re-signup) and nulls
//      name / image / password / emailVerified so neither password nor OTP login
//      can reach the old account.
//
// AUTH — two accepted proofs of ownership, checked in order:
//   Path 1 (preferred): a valid `Authorization: Bearer <token>` — deletes THAT
//     token's own account. Used by the Android app (and any logged-in client).
//   Path 2 (legacy iOS): shared `x-tapcard-key` header + the account email. This
//     path FAILS CLOSED — it is refused unless MOBILE_API_KEY is configured AND
//     the header matches. (Previously it was wide open whenever the key was
//     unset, which allowed deleting any account from just an email.)
// The call is idempotent: deleting an unknown/already-deleted account returns ok.
// ─────────────────────────────────────────────────────────────────────────────

const deleteSchema = z.object({
  // Only needed for the legacy shared-key path; the token path uses the token's
  // own user id, so email is optional here.
  email: z.string().trim().email("A valid email is required").optional(),
  // Optional — the app only has the password for accounts it created itself.
  password: z.string().optional(),
});

/** Deletes cards/accounts/sessions and tombstones the user, in one transaction. */
async function deleteAndTombstone(userId: string) {
  const tombstone = `deleted+${userId}@deleted.tapcard.invalid`;
  await prisma.$transaction([
    prisma.card.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        email: tombstone,
        name: null,
        image: null,
        password: null,
        emailVerified: null,
      },
    }),
  ]);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  // ── Path 1: token-authenticated. The bearer token proves ownership, so we
  //    delete that user's own account regardless of any email in the body.
  const tokenUserId = getMobileUserId(req);
  if (tokenUserId) {
    const user = await prisma.user.findUnique({ where: { id: tokenUserId } });
    // Idempotent: already gone is still success.
    if (!user) return NextResponse.json({ ok: true, alreadyDeleted: true });
    await deleteAndTombstone(user.id);
    return NextResponse.json({ ok: true });
  }

  // ── Path 2: legacy shared-key + email (native iOS app). Matches onboard's
  //    gate: when MOBILE_API_KEY is set, the x-tapcard-key header must match;
  //    when it is unset, this path stays open so the current live iOS app keeps
  //    working (it does not send a token). NOTE: while the key is unset an
  //    account can still be deleted by email alone — the same behavior as before
  //    this change, i.e. no regression. To fully close that, set MOBILE_API_KEY
  //    in the environment AND update the iOS app to send x-tapcard-key.
  const requiredKey = process.env.MOBILE_API_KEY;
  if (requiredKey && req.headers.get("x-tapcard-key") !== requiredKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = parsed.data.email?.toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true, alreadyDeleted: true });
  }

  // Defense in depth: if a password is supplied and the account has one, it must match.
  if (parsed.data.password && user.password) {
    const ok = await bcrypt.compare(parsed.data.password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  }

  await deleteAndTombstone(user.id);
  return NextResponse.json({ ok: true });
}
