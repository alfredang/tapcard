import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { dealSchema } from "@/lib/validators";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deals = await prisma.deal.findMany({
    where: { userId },
    orderBy: [{ stage: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    include: { contact: { select: { name: true, company: true } } },
  });
  return NextResponse.json({ deals });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = dealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { contactId, ...rest } = parsed.data;
  const deal = await prisma.deal.create({
    data: {
      ...rest,
      userId,
      contactId: contactId || null,
    },
    include: { contact: { select: { name: true, company: true } } },
  });
  return NextResponse.json({ deal });
}
