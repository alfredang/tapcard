import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { signMobileToken } from "@/lib/mobile-auth";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile OTP verify — checks the emailed code, then signs the user in. Creates
// a passwordless account on first use (find-or-create), so one flow covers both
// sign-in and sign-up. Returns the same bearer token shape as /mobile/oauth/google.
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{4,8}$/, "Enter the code from your email"),
  name: z.string().trim().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();

  // Cap guesses so the 6-digit code can't be brute-forced.
  const ip = clientIp(req);
  const byEmail = rateLimit(`otp:verify:email:${email}`, 10, 10 * 60_000); // 10 tries / 10 min
  if (!byEmail.ok) return tooManyRequests(byEmail.retryAfterSec);
  const byIp = rateLimit(`otp:verify:ip:${ip}`, 30, 10 * 60_000);
  if (!byIp.ok) return tooManyRequests(byIp.retryAfterSec);

  const ok = await verifyOtp(email, parsed.data.code);
  if (!ok) {
    return NextResponse.json(
      { error: "That code is invalid or has expired." },
      { status: 401 },
    );
  }

  // Find-or-create — a verified email is proof of identity for passwordless auth.
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
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

  const token = signMobileToken(user.id);
  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
