import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getMobileUserId } from "@/lib/mobile-auth";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile appointments — the signed-in user's calendar/bookings. Token-auth twin
// of the web CRM's Appointment model.
// ─────────────────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().trim().min(1, "A name is required").max(200),
  email: z.string().trim().email("Enter a valid email").or(z.literal("")).nullish(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  status: z.enum(["REQUESTED", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  notes: z.string().max(2000).or(z.literal("")).nullish(),
});

export async function GET(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { startAt: "asc" },
    take: 300,
  });
  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const appointment = await prisma.appointment.create({
    data: {
      userId,
      name: d.name,
      email: d.email || null,
      startAt: new Date(d.startAt),
      endAt: new Date(d.endAt),
      status: d.status ?? "REQUESTED",
      notes: d.notes || null,
    },
  });
  return NextResponse.json({ appointment });
}
