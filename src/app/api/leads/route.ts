import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { leadSchema } from "@/lib/validators";

const bodySchema = leadSchema.extend({ slug: z.string() });

// Public lead capture from a card's public page.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { slug, ...lead } = parsed.data;
  const card = await prisma.card.findUnique({ where: { slug } });
  if (!card || !card.published) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.lead.create({
    data: {
      userId: card.userId,
      cardId: card.id,
      name: lead.name,
      email: lead.email || null,
      phone: lead.phone || null,
      company: lead.company || null,
      message: lead.message || null,
      source: "card",
    },
  });

  await prisma.analyticsEvent
    .create({ data: { cardId: card.id, type: "LEAD_SUBMIT" } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
