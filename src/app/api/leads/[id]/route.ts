import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED"])
    .optional(),
  convert: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead || lead.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Convert a lead into a CRM contact.
  if (parsed.data.convert) {
    const contact = await prisma.contact.create({
      data: {
        userId,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        notes: lead.message,
      },
    });
    const updated = await prisma.lead.update({
      where: { id },
      data: { status: "CONVERTED", contactId: contact.id },
    });
    return NextResponse.json({ lead: updated, contact });
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ lead: updated });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead || lead.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
