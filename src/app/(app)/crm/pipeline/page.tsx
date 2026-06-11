import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PipelineBoard } from "@/components/crm/pipeline-board";

export const metadata = { title: "Pipeline — Tapcard" };

export default async function PipelinePage() {
  const user = await requireUser();
  const deals = await prisma.deal.findMany({
    where: { userId: user.id },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    include: { contact: { select: { name: true, company: true } } },
  });

  return (
    <PipelineBoard
      initialDeals={deals.map((d) => ({
        id: d.id,
        title: d.title,
        value: d.value,
        stage: d.stage,
        notes: d.notes,
        contact: d.contact,
      }))}
    />
  );
}
