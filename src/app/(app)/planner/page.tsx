import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PlannerClient } from "@/components/planner/planner-client";

export const metadata = { title: "Planner — Tapcard" };

export default async function PlannerPage() {
  const user = await requireUser();
  const [tasks, appointments] = await Promise.all([
    prisma.task.findMany({
      where: { userId: user.id },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    }),
    prisma.appointment.findMany({
      where: { userId: user.id },
      orderBy: { startAt: "asc" },
    }),
  ]);

  return (
    <PlannerClient
      initialTasks={tasks.map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        status: t.status,
        dueAt: t.dueAt ? t.dueAt.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
      }))}
      initialAppointments={appointments.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        startAt: a.startAt.toISOString(),
        endAt: a.endAt.toISOString(),
        status: a.status,
        notes: a.notes,
      }))}
    />
  );
}
