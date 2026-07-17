import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validators";
import { getMobileUserId } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile contacts sync — list and create the signed-in user's contacts.
// Token-based twin of /api/contacts (which is cookie/session based). Same
// Prisma model, so contacts saved here appear in the web app's CRM immediately.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ contacts });
}

export async function POST(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const contact = await prisma.contact.create({
    data: { ...parsed.data, userId },
  });
  return NextResponse.json({ contact });
}
