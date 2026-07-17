import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

const schema = z.object({
  slug: z.string().max(200),
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
  // Cap key/value sizes and the number of keys so a single event can't carry a
  // large blob that bloats storage.
  meta: z
    .record(z.string().max(64), z.string().max(512))
    .refine((m) => Object.keys(m).length <= 20, "Too many meta keys")
    .optional(),
});

// Public event ingest fired from the card page (fetch/sendBeacon).
export async function POST(req: Request) {
  // Public + unauthenticated: throttle per IP so it can't be flooded with rows.
  const ip = clientIp(req);
  const limited = rateLimit(`analytics:ip:${ip}`, 60, 60_000); // 60 events / min per IP
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

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
