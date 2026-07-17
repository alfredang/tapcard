import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ slug: string }> };

// Public endpoint: return a published card's details as JSON, keyed by slug.
// Used by the mobile app when it scans another person's Tapcard QR/link, so it
// can pull the full contact into the review screen. Records a QR_SCAN event.
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const card = await prisma.card.findUnique({ where: { slug } });
  if (!card || !card.published) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  // Only the view *count* is throttled — the card itself is always returned, so
  // a real visitor is never blocked. Excess hits from one IP just aren't recorded.
  const canCount = rateLimit(`view:qr:${clientIp(req)}:${slug}`, 30, 60_000).ok;
  if (canCount) {
    await prisma.analyticsEvent
      .create({ data: { cardId: card.id, type: "QR_SCAN" } })
      .catch(() => {});
  }

  return NextResponse.json({ card });
}
