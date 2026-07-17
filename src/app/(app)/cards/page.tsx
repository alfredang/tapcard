import Link from "next/link";
import { Plus, Eye, Pencil, Globe2, CreditCard } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { cardCompleteness } from "@/lib/card";
import { appUrl } from "@/lib/utils";

export const metadata = { title: "My Cards — Tapcard" };

export default async function CardsPage() {
  const user = await requireUser();
  const cards = await prisma.card.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="My Cards" description="Create and manage your digital business cards.">
        <Button asChild>
          <Link href="/cards/new">
            <Plus className="h-4 w-4" /> New card
          </Link>
        </Button>
      </PageHeader>

      {cards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Create your first card"
          description="Publish a professional digital business card in under 2 minutes."
          action={
            <Button asChild>
              <Link href="/cards/new">
                <Plus className="h-4 w-4" /> Get started
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const completeness = cardCompleteness(card);
            return (
              <Card key={card.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{card.fullName}</h3>
                    <p className="truncate text-sm text-muted-foreground">
                      {[card.jobTitle, card.company].filter(Boolean).join(" · ") || "No title"}
                    </p>
                  </div>
                  <Badge tone={card.published ? "success" : "default"}>
                    {card.published ? "Live" : "Draft"}
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Completeness</span>
                    <span>{completeness}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="gradient-primary h-full" style={{ width: `${completeness}%` }} />
                  </div>
                </div>

                {/* Footer pinned to the bottom so every tile in a row lines up. */}
                <div className="mt-auto">
                  <div className="mt-5 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/cards/${card.id}/edit`}>
                        <Pencil className="h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    {card.published && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={appUrl(`/c/${card.slug}`)} target="_blank" rel="noreferrer" aria-label="View live card">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <p className="mt-3 flex h-4 items-center gap-1 truncate text-xs text-muted-foreground">
                    {card.published && (
                      <>
                        <Globe2 className="h-3 w-3 shrink-0" />
                        /c/{card.slug}
                      </>
                    )}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
