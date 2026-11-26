import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { importLinkedInPhotoToCard } from "@/lib/linkedin-photo";

// POST — set this card's profile photo from the owner's LinkedIn profile.
// 409 { connect: true } means LinkedIn isn't connected (or the connection
// expired): the builder then sends the owner through "Connect LinkedIn".

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const result = await importLinkedInPhotoToCard(userId, id);
  if (!result.ok) {
    const { status, ...body } = result;
    return NextResponse.json(body, { status });
  }
  return NextResponse.json({ card: result.card });
}
