import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMobileUserId } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile leads inbox — lists the leads captured from the signed-in user's cards
// (someone filled the "share your details" form on a public web card). Read-only
// twin of the web CRM's leads view; dismissal lives in /api/mobile/leads/[id].
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await prisma.lead.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ leads });
}
