import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/session";
import { analyzeLead } from "@/lib/ai";

const schema = z.object({ leadId: z.string() });

// AI CRM assistant: score + summarize a captured lead and suggest a follow-up.
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id: parsed.data.leadId } });
  if (!lead || lead.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const insight = await analyzeLead({
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
  });

  return NextResponse.json({ insight });
}
