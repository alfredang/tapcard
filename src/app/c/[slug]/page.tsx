import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { PublicCard } from "@/components/card/public-card";
import type { CardData } from "@/lib/card";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = await prisma.card.findUnique({ where: { slug } });
  if (!card || !card.published) return { title: "Card not found" };
  return {
    title: `${card.fullName}${card.jobTitle ? ` — ${card.jobTitle}` : ""}`,
    description: card.bio || card.tagline || `${card.fullName}'s digital business card`,
    openGraph: {
      title: card.fullName,
      description: card.bio || card.tagline || "",
      images: card.profilePhoto ? [card.profilePhoto] : undefined,
    },
  };
}

export default async function PublicCardPage({ params }: Props) {
  const { slug } = await params;
  const card = await prisma.card.findUnique({ where: { slug } });
  if (!card || !card.published) notFound();

  // Card is a structural superset of CardData; assignment (not a literal) is fine.
  const data: CardData = card;

  return (
    <Suspense>
      <PublicCard card={data} />
    </Suspense>
  );
}
