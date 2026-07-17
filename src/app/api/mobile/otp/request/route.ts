import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOtp } from "@/lib/otp";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile OTP request — emails a 6-digit code to sign in / sign up passwordless.
// Companion to /verify below. In dev (no EMAIL_SERVER) the code is printed to
// the server console by lib/otp.ts.
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  // Throttle by IP (blanket flood protection) and by target email (stops one
  // address being spammed with codes / from burning the SMTP quota).
  const ip = clientIp(req);
  const byIp = rateLimit(`otp:req:ip:${ip}`, 15, 10 * 60_000); // 15 / 10 min per IP
  if (!byIp.ok) return tooManyRequests(byIp.retryAfterSec);
  const byEmail = rateLimit(`otp:req:email:${email}`, 5, 10 * 60_000); // 5 / 10 min per email
  if (!byEmail.ok) return tooManyRequests(byEmail.retryAfterSec);

  const existing = await prisma.user.findUnique({ where: { email } });
  await createOtp(email);

  // isNewAccount lets the app tailor copy ("Create account" vs "Sign in") and
  // decide whether to ask for a name on verify.
  return NextResponse.json({ ok: true, isNewAccount: !existing });
}
