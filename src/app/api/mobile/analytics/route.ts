import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMobileUserId } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile analytics summary — aggregates the signed-in user's card events
// (views, taps, leads) for the app's "card performance" screen. Read-only;
// events are ingested publicly from the card page via /api/analytics.
// ─────────────────────────────────────────────────────────────────────────────

const TAP_TYPES = [
  "QR_SCAN",
  "WHATSAPP_CLICK",
  "EMAIL_CLICK",
  "WEBSITE_CLICK",
  "PHONE_CLICK",
  "SOCIAL_CLICK",
  "VCF_DOWNLOAD",
] as const;

export async function GET(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await prisma.card.findMany({
    where: { userId },
    select: { id: true, fullName: true, slug: true },
  });
  const cardIds = cards.map((c) => c.id);

  if (cardIds.length === 0) {
    return NextResponse.json({
      totals: { views: 0, taps: 0, leads: 0 },
      byType: {},
      last30dViews: 0,
      cards: [],
    });
  }

  const [byTypeRows, byCardRows, last30dViews] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["type"],
      where: { cardId: { in: cardIds } },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ["cardId", "type"],
      where: { cardId: { in: cardIds } },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.count({
      where: {
        cardId: { in: cardIds },
        type: "VIEW",
        createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
      },
    }),
  ]);

  const byType: Record<string, number> = {};
  for (const row of byTypeRows) byType[row.type] = row._count._all;

  const isTap = (t: string) => (TAP_TYPES as readonly string[]).includes(t);
  const totals = {
    views: byType["VIEW"] ?? 0,
    taps: Object.entries(byType).reduce((n, [t, c]) => (isTap(t) ? n + c : n), 0),
    leads: byType["LEAD_SUBMIT"] ?? 0,
  };

  const perCard = new Map<string, { views: number; taps: number }>();
  for (const row of byCardRows) {
    const entry = perCard.get(row.cardId) ?? { views: 0, taps: 0 };
    if (row.type === "VIEW") entry.views += row._count._all;
    else if (isTap(row.type)) entry.taps += row._count._all;
    perCard.set(row.cardId, entry);
  }

  const cardStats = cards
    .map((c) => ({
      id: c.id,
      name: c.fullName,
      slug: c.slug,
      views: perCard.get(c.id)?.views ?? 0,
      taps: perCard.get(c.id)?.taps ?? 0,
    }))
    .sort((a, b) => b.views - a.views);

  return NextResponse.json({ totals, byType, last30dViews, cards: cardStats });
}
