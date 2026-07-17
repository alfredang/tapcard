import { prisma } from "@/lib/db";
import { cardToVCard, vcfFilename } from "@/lib/vcf";
import { rateLimit, clientIp } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ slug: string }> };

// Public endpoint: serve a downloadable vCard for a published card and record
// the download as an analytics event.
export async function GET(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const card = await prisma.card.findUnique({ where: { slug } });
  if (!card || !card.published) {
    return new Response("Not found", { status: 404 });
  }

  // Only the download *count* is throttled — the vCard is always served.
  const canCount = rateLimit(`view:vcf:${clientIp(req)}:${slug}`, 30, 60_000).ok;
  if (canCount) {
    await prisma.analyticsEvent
      .create({ data: { cardId: card.id, type: "VCF_DOWNLOAD" } })
      .catch(() => {});
  }

  const vcard = cardToVCard(card);
  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vcfFilename(card)}"`,
    },
  });
}
