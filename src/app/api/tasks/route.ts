import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/session";

// Session-authed task CRUD for the web app (twin of /api/mobile/tasks).

const createSchema = z.object({
  title: z.string().trim().min(1, "A title is required").max(200),
  type: z.enum(["FOLLOW_UP", "REMINDER", "MEETING"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueAt: z.string().datetime().nullish(),
  contactId: z.string().nullish(),
});

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const d = parsed.data;
  const task = await prisma.task.create({
    data: {
      userId,
      title: d.title,
      type: d.type ?? "FOLLOW_UP",
      status: d.status ?? "TODO",
      dueAt: d.dueAt ? new Date(d.dueAt) : null,
      contactId: d.contactId || null,
    },
  });
  return NextResponse.json({ task });
}
