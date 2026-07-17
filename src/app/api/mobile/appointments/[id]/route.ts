import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getMobileUserId } from "@/lib/mobile-auth";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().or(z.literal("")).nullish(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  status: z.enum(["REQUESTED", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  notes: z.string().max(2000).or(z.literal("")).nullish(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.email !== undefined ? { email: d.email || null } : {}),
      ...(d.startAt !== undefined ? { startAt: new Date(d.startAt) } : {}),
      ...(d.endAt !== undefined ? { endAt: new Date(d.endAt) } : {}),
      ...(d.status !== undefined ? { status: d.status } : {}),
      ...(d.notes !== undefined ? { notes: d.notes || null } : {}),
    },
  });
  return NextResponse.json({ appointment });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
