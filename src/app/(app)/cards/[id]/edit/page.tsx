import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { CardBuilder } from "@/components/builder/card-builder";

export const metadata = { title: "Edit Card — Tapcard" };

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card || card.userId !== user.id) notFound();

  // Drop fields not part of the builder state (gallery/timestamps/relations).
  const { gallery: _gallery, createdAt: _c, updatedAt: _u, userId: _uid, ...rest } =
    card;

  return <CardBuilder cardId={card.id} initialCard={rest} />;
}
