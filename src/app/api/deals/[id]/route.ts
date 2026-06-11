import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().optional(),
  value: z.coerce.number().optional(),
  stage: z
    .enum([
      "NEW_LEAD",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL",
      "NEGOTIATION",
      "WON",
      "LOST",
    ])
    .optional(),
  position: z.number().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const deal = await prisma.deal.update({
    where: { id },
    data: parsed.data,
    include: { contact: { select: { name: true, company: true } } },
  });
  return NextResponse.json({ deal });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.deal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
