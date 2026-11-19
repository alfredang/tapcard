import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMobileUserId, signMobileToken } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile session renewal — swaps a still-valid bearer token for a fresh one.
// The native apps call this on launch, so someone who opens the app at least
// once within the token's lifetime stays signed in instead of being cut off
// 30 days after their last login. An expired or invalid token gets 401 and the
// app sends the user back to sign-in.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ token: signMobileToken(user.id), user });
}
