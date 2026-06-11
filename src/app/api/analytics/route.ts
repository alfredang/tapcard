import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  slug: z.string(),
  type: z.enum([
    "VIEW",
    "QR_SCAN",
    "WHATSAPP_CLICK",
    "EMAIL_CLICK",
    "WEBSITE_CLICK",
    "PHONE_CLICK",
    "SOCIAL_CLICK",
    "VCF_DOWNLOAD",
    "LEAD_SUBMIT",
  ]),
  meta: z.record(z.string(), z.string()).optional(),
});

// Public event ingest fired from the card page (fetch/sendBeacon).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const card = await prisma.card.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true, published: true },
  });
  if (!card || !card.published) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  await prisma.analyticsEvent
    .create({
      data: {
        cardId: card.id,
        type: parsed.data.type,
        meta: parsed.data.meta ?? undefined,
        referrer: req.headers.get("referer") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
