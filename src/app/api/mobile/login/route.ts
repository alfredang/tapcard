import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { signMobileToken } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile login — email + password, returns a bearer token for the native apps.
// The companion to the cookie-based web login; same credentials, same users.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  // Same generic message whether the email is unknown or the password is wrong.
  if (!user?.password || !(await bcrypt.compare(parsed.data.password, user.password))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signMobileToken(user.id);
  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}