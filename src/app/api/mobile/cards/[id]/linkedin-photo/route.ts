import { NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { importLinkedInPhotoToCard } from "@/lib/linkedin-photo";
import { appUrl } from "@/lib/utils";

// POST — token-based twin of /api/cards/[id]/linkedin-photo, so the apps can
// use the LinkedIn connection the owner made on the website.

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const result = await importLinkedInPhotoToCard(userId, id);
  if (!result.ok) {
    const { status, ...body } = result;
    return NextResponse.json(body, { status });
  }
  return NextResponse.json({ card: result.card, url: appUrl(`/c/${result.card.slug}`) });
}
