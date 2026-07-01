import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { signMobileToken } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile registration — creates an account and returns a bearer token so the
// app can sign the user straight in. Mirrors /api/register (web) but token-based.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const password = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { email, name: parsed.data.name, password },
  });

  const token = signMobileToken(user.id);
  return NextResponse.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}