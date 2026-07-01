import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cardSchema } from "@/lib/validators";
import { appUrl } from "@/lib/utils";
import { getMobileUserId } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile card update / delete — token-based twin of /api/cards/[id]. Ownership
// is enforced: a card can only be changed by the user it belongs to.
// ─────────────────────────────────────────────────────────────────────────────

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.card.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = cardSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const card = await prisma.card.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ card, url: appUrl(`/c/${card.slug}`) });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.card.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
