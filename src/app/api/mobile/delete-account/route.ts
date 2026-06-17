import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile account deletion — used by the native iOS "Tapcard" app.
//
// Apple App Store Guideline 5.1.1(v) requires any app that supports account
// creation to also let users initiate account *deletion* from within the app.
// The companion to /api/mobile/onboard, this endpoint deactivates and anonymizes
// the account so the user can no longer sign back in and their personal data is
// removed/tombstoned, while keeping the (now-anonymous) row for referential
// integrity of any CRM records that reference it.
//
// What it does, in one transaction:
//   1. deletes the user's published digital cards (and, by cascade, their
//      analytics events; leads keep their row with cardId nulled),
//   2. revokes any OAuth links + active sessions,
//   3. tombstones the email (frees the original address for re-signup) and nulls
//      name / image / password / emailVerified so neither password nor OTP login
//      can reach the old account.
//
// Auth mirrors onboard: optional shared-key gate (x-tapcard-key when
// MOBILE_API_KEY is set) + the account email. When the app also has the
// account password (only issued for app-created accounts), it is sent and must
// match — defense in depth. The call is idempotent: deleting an unknown or
// already-deleted account returns ok.
// ─────────────────────────────────────────────────────────────────────────────

const deleteSchema = z.object({
  email: z.string().trim().email("A valid email is required"),
  // Optional — the app only has the password for accounts it created itself.
  password: z.string().optional(),
});

export async function POST(req: Request) {
  // Optional shared-secret gate, identical to /api/mobile/onboard.
  const requiredKey = process.env.MOBILE_API_KEY;
  if (requiredKey && req.headers.get("x-tapcard-key") !== requiredKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Idempotent: nothing to delete (already gone) is still a success.
  if (!user) {
    return NextResponse.json({ ok: true, alreadyDeleted: true });
  }

  // If a password is supplied and the account has one, it must match. This
  // can't be required because returning accounts onboarded on this device are
  // not issued a password (see AccountStore.record in the iOS app).
  if (parsed.data.password && user.password) {
    const ok = await bcrypt.compare(parsed.data.password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  }

  const tombstone = `deleted+${user.id}@deleted.tapcard.invalid`;
  await prisma.$transaction([
    prisma.card.deleteMany({ where: { userId: user.id } }),
    prisma.account.deleteMany({ where: { userId: user.id } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        email: tombstone,
        name: null,
        image: null,
        password: null,
        emailVerified: null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
