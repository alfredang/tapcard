import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { cardSchema } from "@/lib/validators";
import { slugify, randomSuffix } from "@/lib/utils";

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

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cards = await prisma.card.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ cards });
}

export async function POST(req: Request) {
  const userId = await getUserId();
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
    data: {
      ...data,
      slug,
      userId,
      published: data.published ?? false,
    },
  });
  return NextResponse.json({ card });
}
