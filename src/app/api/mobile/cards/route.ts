import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cardSchema } from "@/lib/validators";
import { slugify, randomSuffix, appUrl } from "@/lib/utils";
import { getMobileUserId } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile card sync — list and create the signed-in user's cards. Token-based
// twin of /api/cards (which is cookie/session based). Same Prisma models, so
// cards created here appear on the web app immediately.
// ─────────────────────────────────────────────────────────────────────────────

async function uniqueSlug(base: string) {
  const root = slugify(base) || "card";
  let candidate = root;
  for (let i = 0; i < 6; i++) {
    const exists = await prisma.card.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    candidate = `${root}-${randomSuffix()}`;
  }
  return `${root}-${randomSuffix(6)}`;
}

export async function GET(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await prisma.card.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ cards });
}

export async function POST(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = cardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const slug = await uniqueSlug(data.fullName);
  const card = await prisma.card.create({
    data: { ...data, slug, userId, published: data.published ?? true },
  });

  return NextResponse.json({ card, url: appUrl(`/c/${card.slug}`) });
}
