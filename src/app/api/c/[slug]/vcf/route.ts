import { prisma } from "@/lib/db";
import { cardToVCard, vcfFilename } from "@/lib/vcf";

type Ctx = { params: Promise<{ slug: string }> };

// Public endpoint: serve a downloadable vCard for a published card and record
// the download as an analytics event.
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const card = await prisma.card.findUnique({ where: { slug } });
  if (!card || !card.published) {
    return new Response("Not found", { status: 404 });
  }

  await prisma.analyticsEvent
    .create({ data: { cardId: card.id, type: "VCF_DOWNLOAD" } })
    .catch(() => {});

  const vcard = cardToVCard(card);
  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vcfFilename(card)}"`,
    },
  });
}
