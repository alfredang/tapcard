import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { cardUpdateSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

// GET — the builder polls this so an edit made in the app (design, photo,
// banner…) shows on an open web tab. ?since=<updatedAt ISO> answers 204 when
// nothing changed, so polling never re-downloads inline images.
export async function GET(req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const since = new URL(req.url).searchParams.get("since");
  if (since) {
    const head = await prisma.card.findUnique({
      where: { id },
      select: { userId: true, updatedAt: true },
    });
    if (!head || head.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (head.updatedAt.toISOString() === since) {
      return new NextResponse(null, { status: 204 });
    }
  }

  const card = await prisma.card.findUnique({ where: { id } });
  if (!card || card.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ card });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.card.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = cardUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const card = await prisma.card.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ card });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.card.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
