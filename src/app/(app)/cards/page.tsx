import Link from "next/link";
import { Plus, Eye, Pencil, Globe2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Surface, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Cards</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your digital business cards.
          </p>
        </div>
        <Button asChild>
          <Link href="/cards/new">
            <Plus className="h-4 w-4" /> New card
          </Link>
        </Button>
      </div>

      {cards.length === 0 ? (
        <Surface className="flex flex-col items-center gap-4 p-12 text-center">
          <div className="gradient-primary flex h-14 w-14 items-center justify-center rounded-2xl">
            <Plus className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Create your first card</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish a professional digital business card in under 2 minutes.
            </p>
          </div>
          <Button asChild>
            <Link href="/cards/new">Get started</Link>
          </Button>
        </Surface>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Surface key={card.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{card.fullName}</h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {[card.jobTitle, card.company].filter(Boolean).join(" · ") ||
                      "No title"}
                  </p>
                </div>
                <Badge tone={card.published ? "success" : "default"}>
                  {card.published ? "Live" : "Draft"}
                </Badge>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Completeness</span>
                  <span>{cardCompleteness(card)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="gradient-primary h-full"
                    style={{ width: `${cardCompleteness(card)}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/cards/${card.id}/edit`}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                </Button>
                {card.published && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={appUrl(`/c/${card.slug}`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              {card.published && (
                <p className="mt-3 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <Globe2 className="h-3 w-3 shrink-0" />
                  /c/{card.slug}
                </p>
              )}
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
